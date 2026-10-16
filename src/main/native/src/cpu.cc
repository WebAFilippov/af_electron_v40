#include "cpu.h"

#include "common.h"

#include <pdh.h>
#include <pdhmsg.h>
// CallNtPowerInformation lives in powerbase.h (pulled in by powrprof.h).
#include <powrprof.h>
#include <windows.h>

#include <algorithm>
#include <cmath>
#include <vector>

#pragma comment(lib, "pdh.lib")
#pragma comment(lib, "powrprof.lib")

namespace monitor {

namespace {

// The Windows SDK intentionally does not publish PROCESSOR_POWER_INFORMATION nor
// the `ProcessorInformation` level constant, but both are part of the stable
// documented contract of CallNtPowerInformation, so they are declared here.
struct ProcessorPowerInformation {
  ULONG Number;
  ULONG MaxMhz;
  ULONG CurrentMhz;
  ULONG MhzLimit;
  ULONG MaxIdleState;
  ULONG CurrentIdleState;
};

constexpr POWER_INFORMATION_LEVEL kProcessorInformationLevel = static_cast<POWER_INFORMATION_LEVEL>(11);

// PDH handles the aggregate load. Per-core load comes from
// NtQuerySystemInformation, because the PDH per-core instance naming differs
// between Windows versions ("0,0" vs "0") and silently yields zeros for every
// core but the first.
PDH_HQUERY g_cpuQuery = nullptr;
PDH_HCOUNTER g_cpuTotal = nullptr;

// Undocumented but stable NT API used by Task Manager itself.
using NtQuerySystemInformationFn = LONG(WINAPI*)(ULONG, PVOID, ULONG, PULONG);

// SYSTEM_PROCESSOR_PERFORMANCE_INFORMATION, one entry per logical processor.
struct ProcessorPerformanceInfo {
  LARGE_INTEGER IdleTime;
  LARGE_INTEGER KernelTime;
  LARGE_INTEGER UserTime;
  LARGE_INTEGER DpcTime;
  LARGE_INTEGER InterruptTime;
  ULONG InterruptCount;
};

constexpr ULONG kSystemProcessorPerformanceInformation = 8;
constexpr ULONG kSystemProcessorInformation = 11;

std::vector<ProcessorPerformanceInfo> g_previousPerf;
bool g_hasPreviousPerf = false;

NtQuerySystemInformationFn ResolveNtQuery() {
  static NtQuerySystemInformationFn fn = []() -> NtQuerySystemInformationFn {
    HMODULE ntdll = ::GetModuleHandleW(L"ntdll.dll");
    if (ntdll == nullptr) {
      return nullptr;
    }
    return reinterpret_cast<NtQuerySystemInformationFn>(::GetProcAddress(ntdll, "NtQuerySystemInformation"));
  }();
  return fn;
}

std::string ReadRegistryString(HKEY root, const wchar_t* subKey, const wchar_t* valueName) {
  HKEY key = nullptr;
  if (::RegOpenKeyExW(root, subKey, 0, KEY_READ, &key) != ERROR_SUCCESS) {
    return std::string();
  }

  WCHAR buffer[512] = {};
  DWORD size = sizeof(buffer);
  DWORD type = 0;
  const LONG status = ::RegQueryValueExW(key, valueName, nullptr, &type, reinterpret_cast<LPBYTE>(buffer), &size);
  ::RegCloseKey(key);

  if (status != ERROR_SUCCESS || (type != REG_SZ && type != REG_EXPAND_SZ)) {
    return std::string();
  }

  return WideToUtf8(Trim(std::wstring(buffer)));
}

}  // namespace

std::string GetCpuName() {
  const std::string name = ReadRegistryString(HKEY_LOCAL_MACHINE,
                                              L"HARDWARE\\DESCRIPTION\\System\\CentralProcessor\\0",
                                              L"ProcessorNameString");
  return name.empty() ? "Unknown CPU" : name;
}

uint32_t GetPhysicalCoreCount() {
  DWORD length = 0;
  ::GetLogicalProcessorInformationEx(RelationProcessorCore, nullptr, &length);

  if (length == 0) {
    return ::GetActiveProcessorCount(ALL_PROCESSOR_GROUPS);
  }

  std::vector<BYTE> buffer(length);
  if (!::GetLogicalProcessorInformationEx(RelationProcessorCore,
                                          reinterpret_cast<PSYSTEM_LOGICAL_PROCESSOR_INFORMATION_EX>(buffer.data()),
                                          &length)) {
    return ::GetActiveProcessorCount(ALL_PROCESSOR_GROUPS);
  }

  uint32_t cores = 0;
  DWORD offset = 0;
  while (offset < length) {
    auto* info = reinterpret_cast<PSYSTEM_LOGICAL_PROCESSOR_INFORMATION_EX>(buffer.data() + offset);
    if (info->Relationship == RelationProcessorCore) {
      ++cores;
    }
    offset += info->Size;
  }

  return cores == 0 ? ::GetActiveProcessorCount(ALL_PROCESSOR_GROUPS) : cores;
}

double GetMaxClockMhz() {
  HKEY key = nullptr;
  if (::RegOpenKeyExW(HKEY_LOCAL_MACHINE, L"HARDWARE\\DESCRIPTION\\System\\CentralProcessor\\0", 0, KEY_READ, &key) !=
      ERROR_SUCCESS) {
    return 0.0;
  }

  DWORD mhz = 0;
  DWORD size = sizeof(mhz);
  DWORD type = 0;
  const LONG status = ::RegQueryValueExW(key, L"~MHz", nullptr, &type, reinterpret_cast<LPBYTE>(&mhz), &size);
  ::RegCloseKey(key);

  return status == ERROR_SUCCESS ? static_cast<double>(mhz) : 0.0;
}

double GetCurrentClockMhz() {
  // PROCESSOR_POWER_INFORMATION reports the live core frequency, which the
  // registry's static "~MHz" cannot.
  const DWORD logical = ::GetActiveProcessorCount(ALL_PROCESSOR_GROUPS);
  if (logical == 0) {
    return 0.0;
  }

  std::vector<ProcessorPowerInformation> info(logical);
  const LONG status =
      ::CallNtPowerInformation(kProcessorInformationLevel, nullptr, 0, info.data(),
                               static_cast<ULONG>(info.size() * sizeof(ProcessorPowerInformation)));

  if (status != 0) {
    return 0.0;
  }

  double sum = 0.0;
  for (const auto& entry : info) {
    sum += static_cast<double>(entry.CurrentMhz);
  }

  return sum / static_cast<double>(logical);
}

bool InitCpuQuery() {
  if (g_cpuQuery == nullptr) {
    if (::PdhOpenQueryW(nullptr, 0, &g_cpuQuery) != ERROR_SUCCESS) {
      g_cpuQuery = nullptr;
      return false;
    }

    // "Processor Utility" accounts for turbo/frequency scaling and matches Task
    // Manager; older builds only expose "Processor Time".
    if (::PdhAddEnglishCounterW(g_cpuQuery, L"\\Processor Information(_Total)\\% Processor Utility", 0, &g_cpuTotal) !=
            ERROR_SUCCESS &&
        ::PdhAddEnglishCounterW(g_cpuQuery, L"\\Processor Information(_Total)\\% Processor Time", 0, &g_cpuTotal) !=
            ERROR_SUCCESS) {
      ::PdhCloseQuery(g_cpuQuery);
      g_cpuQuery = nullptr;
      return false;
    }

    ::PdhCollectQueryData(g_cpuQuery);
  }

  // Prime the NT per-core counters as well, so the first real sample is valid.
  const DWORD logical = ::GetActiveProcessorCount(ALL_PROCESSOR_GROUPS);
  std::vector<ProcessorPerformanceInfo> buffer(logical);
  const auto query = ResolveNtQuery();

  if (query != nullptr) {
    ULONG returned = 0;
    if (query(kSystemProcessorPerformanceInformation, buffer.data(),
              static_cast<ULONG>(buffer.size() * sizeof(ProcessorPerformanceInfo)), &returned) == 0) {
      g_previousPerf = std::move(buffer);
      g_hasPreviousPerf = true;
    }
  }

  return true;
}

namespace {

double ReadCounter(PDH_HCOUNTER counter) {
  PDH_FMT_COUNTERVALUE value = {};
  if (::PdhGetFormattedCounterValue(counter, PDH_FMT_DOUBLE, nullptr, &value) != ERROR_SUCCESS) {
    return 0.0;
  }
  if (value.CStatus != PDH_CSTATUS_VALID_DATA && value.CStatus != PDH_CSTATUS_NEW_DATA) {
    return 0.0;
  }
  return std::clamp(value.doubleValue, 0.0, 100.0);
}

// Computes per-logical-processor load from two consecutive NT samples.
bool ReadPerCoreLoad(std::vector<double>& perCore) {
  const auto query = ResolveNtQuery();
  if (query == nullptr) {
    return false;
  }

  const DWORD logical = ::GetActiveProcessorCount(ALL_PROCESSOR_GROUPS);
  std::vector<ProcessorPerformanceInfo> current(logical);

  ULONG returned = 0;
  if (query(kSystemProcessorPerformanceInformation, current.data(),
            static_cast<ULONG>(current.size() * sizeof(ProcessorPerformanceInfo)), &returned) != 0) {
    return false;
  }

  const size_t count = returned / sizeof(ProcessorPerformanceInfo);
  if (count == 0) {
    return false;
  }

  perCore.clear();
  perCore.reserve(count);

  const bool canDiff = g_hasPreviousPerf && g_previousPerf.size() >= count;

  for (size_t i = 0; i < count; ++i) {
    const auto& now = current[i];

    if (!canDiff) {
      perCore.push_back(0.0);
      continue;
    }

    const auto& before = g_previousPerf[i];

    const uint64_t idleDelta = static_cast<uint64_t>(now.IdleTime.QuadPart - before.IdleTime.QuadPart);
    const uint64_t kernelDelta = static_cast<uint64_t>(now.KernelTime.QuadPart - before.KernelTime.QuadPart);
    const uint64_t userDelta = static_cast<uint64_t>(now.UserTime.QuadPart - before.UserTime.QuadPart);

    // Kernel time already includes idle time, so the busy total is
    // (kernel + user - idle).
    const uint64_t total = kernelDelta + userDelta;
    if (total == 0) {
      perCore.push_back(0.0);
      continue;
    }

    const double busy = static_cast<double>(total - (idleDelta <= total ? idleDelta : total));
    perCore.push_back(std::clamp((busy / static_cast<double>(total)) * 100.0, 0.0, 100.0));
  }

  g_previousPerf = std::move(current);
  g_hasPreviousPerf = true;

  return true;
}

}  // namespace

bool ReadCpuLoad(double& total, std::vector<double>& perCore) {
  perCore.clear();

  if (g_cpuQuery == nullptr && !InitCpuQuery()) {
    return false;
  }

  if (::PdhCollectQueryData(g_cpuQuery) != ERROR_SUCCESS) {
    return false;
  }

  total = ReadCounter(g_cpuTotal);

  if (!ReadPerCoreLoad(perCore)) {
    // Fall back to the aggregate when per-core data is unavailable.
    perCore.assign(::GetActiveProcessorCount(ALL_PROCESSOR_GROUPS), total);
  }

  return true;
}

void ShutdownCpuQuery() {
  if (g_cpuQuery != nullptr) {
    ::PdhCloseQuery(g_cpuQuery);
    g_cpuQuery = nullptr;
    g_cpuTotal = nullptr;
  }
  g_previousPerf.clear();
  g_hasPreviousPerf = false;
}

}  // namespace monitor
