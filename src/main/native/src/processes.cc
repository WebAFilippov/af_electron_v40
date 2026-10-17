#include "processes.h"

#include "common.h"

#include <psapi.h>
#include <tlhelp32.h>

#include <algorithm>
#include <map>
#include <string>
#include <vector>

#pragma comment(lib, "psapi.lib")

// Process enumeration via the documented Win32 API.
//
// Two design points worth stating explicitly:
//
//  1. CPU usage cannot be read directly. The kernel only exposes *cumulative*
//     CPU time per process, so the percentage shown in Task Manager is derived
//     from two samples: (kernelDelta + userDelta) / (wallClockDelta * cores).
//     The previous sample is therefore kept between calls, exactly like the
//     per-core CPU load in cpu.cc.
//
//  2. Enumerating with CreateToolhelp32Snapshot gives names and parent PIDs in a
//     single pass and — unlike EnumProcesses + OpenProcess — works for processes
//     owned by other users without elevation. Handles to foreign processes are
//     only opened with PROCESS_QUERY_LIMITED_INFORMATION, the least privileged
//     right that still allows memory and timing queries.

namespace monitor {

namespace {

struct CpuSample {
  uint64_t kernelTime = 0;
  uint64_t userTime = 0;
  uint64_t timestamp = 0;
};

std::map<uint32_t, CpuSample> g_previousCpu;

uint64_t FileTimeToU64(const FILETIME& ft) {
  return (static_cast<uint64_t>(ft.dwHighDateTime) << 32) | ft.dwLowDateTime;
}

uint64_t NowMillis() {
  return ::GetTickCount64();
}

/** Opens a process with the least privilege that still permits the queries below. */
HANDLE OpenForQuery(DWORD pid) {
  return ::OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, FALSE, pid);
}

std::string QueryImagePath(HANDLE process) {
  WCHAR buffer[1024] = {};
  DWORD size = static_cast<DWORD>(std::size(buffer));

  if (::QueryFullProcessImageNameW(process, 0, buffer, &size)) {
    return WideToUtf8(std::wstring(buffer, size));
  }
  return std::string();
}

/**
 * Reads a single string from a file's version resource.
 *
 * Both `FileDescription` ("Google Chrome") and `CompanyName` ("Google LLC") come
 * from the same block, so the lookup is shared instead of duplicated.
 */
std::string QueryVersionString(const std::string& path, const wchar_t* field) {
  if (path.empty()) {
    return std::string();
  }

  const std::wstring widePath(path.begin(), path.end());

  DWORD handle = 0;
  const DWORD versionSize = ::GetFileVersionInfoSizeW(widePath.c_str(), &handle);
  if (versionSize == 0) {
    return std::string();
  }

  std::vector<BYTE> data(versionSize);
  if (!::GetFileVersionInfoW(widePath.c_str(), 0, versionSize, data.data())) {
    return std::string();
  }

  struct Translation {
    WORD language;
    WORD codePage;
  };

  Translation* translation = nullptr;
  UINT translationLength = 0;

  if (!::VerQueryValueW(data.data(), L"\\VarFileInfo\\Translation", reinterpret_cast<LPVOID*>(&translation),
                        &translationLength) ||
      translationLength < sizeof(Translation)) {
    return std::string();
  }

  WCHAR query[128];
  ::swprintf_s(query, L"\\StringFileInfo\\%04x%04x\\%s", translation[0].language, translation[0].codePage, field);

  LPWSTR value = nullptr;
  UINT valueLength = 0;

  if (::VerQueryValueW(data.data(), query, reinterpret_cast<LPVOID*>(&value), &valueLength) && valueLength > 0) {
    // valueLength includes the terminating NUL, which must not be part of the
    // resulting std::string.
    return WideToUtf8(Trim(std::wstring(value, valueLength - 1)));
  }

  return std::string();
}

std::string QueryFileDescription(const std::string& path) {
  return QueryVersionString(path, L"FileDescription");
}

std::string QueryCompanyName(const std::string& path) {
  return QueryVersionString(path, L"CompanyName");
}

/**
 * Processes that must never be terminated: terminating them bug-checks the
 * machine or breaks the session. The check is by name because PIDs are reused.
 */
bool IsProtectedProcess(const std::string& name, uint32_t pid) {
  // PID 0 is the idle process and PID 4 is the kernel; neither can be opened,
  // let alone killed, but they are listed with reserved PIDs.
  if (pid == 0 || pid == 4) {
    return true;
  }

  static const char* kProtected[] = {
      "system",           "registry",         "smss.exe",         "csrss.exe",
      "wininit.exe",      "winlogon.exe",     "services.exe",     "lsass.exe",
      "lsaiso.exe",       "svchost.exe",      "dwm.exe",          "fontdrvhost.exe",
      "audiodg.exe",      "memory compression", "secure system",  "msmpeng.exe"
  };

  std::string lowered = name;
  std::transform(lowered.begin(), lowered.end(), lowered.begin(),
                 [](unsigned char c) { return static_cast<char>(::tolower(c)); });

  for (const char* candidate : kProtected) {
    if (lowered == candidate) {
      return true;
    }
  }

  return false;
}

}  // namespace

uint32_t ReadProcesses(std::vector<ProcessInfo>& out) {
  out.clear();

  HANDLE snapshot = ::CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
  if (snapshot == INVALID_HANDLE_VALUE) {
    return 0;
  }

  // System time is needed to convert cumulative CPU time into a percentage.
  // GetSystemTimes returns idle/kernel/user across all cores.
  FILETIME idleTime = {};
  FILETIME kernelTime = {};
  FILETIME userTime = {};
  ::GetSystemTimes(&idleTime, &kernelTime, &userTime);

  const uint64_t systemKernel = FileTimeToU64(kernelTime);
  const uint64_t systemUser = FileTimeToU64(userTime);
  const uint64_t systemTotal = systemKernel + systemUser;

  const uint64_t now = NowMillis();
  const uint32_t logicalCores = ::GetActiveProcessorCount(ALL_PROCESSOR_GROUPS);

  // The elapsed wall time this sample covers, taken from the first process we can
  // measure; it is the same for every row and avoids a second clock read.
  uint64_t elapsedMs = 0;

  PROCESSENTRY32W entry = {};
  entry.dwSize = sizeof(entry);

  std::map<uint32_t, CpuSample> currentCpu;

  if (::Process32FirstW(snapshot, &entry)) {
    do {
      ProcessInfo info;
      info.pid = entry.th32ProcessID;
      info.parentPid = entry.th32ParentProcessID;
      info.threadCount = entry.cntThreads;
      info.name = WideToUtf8(Trim(std::wstring(entry.szExeFile)));

      HANDLE process = OpenForQuery(info.pid);
      if (process != nullptr) {
        FILETIME createTime = {};
        FILETIME exitTime = {};
        FILETIME procKernel = {};
        FILETIME procUser = {};

        if (::GetProcessTimes(process, &createTime, &exitTime, &procKernel, &procUser)) {
          const uint64_t kernel = FileTimeToU64(procKernel);
          const uint64_t user = FileTimeToU64(procUser);

          info.kernelTimeMs = kernel / 10'000;  // 100-ns units -> ms
          info.userTimeMs = user / 10'000;
          info.totalCpuTimeMs = info.kernelTimeMs + info.userTimeMs;

          // Creation time is expressed in FILETIME (1601-01-01 epoch).
          const uint64_t createdSince1601 = FileTimeToU64(createTime);
          constexpr uint64_t kEpochDeltaMs = 11'644'473'600'000ULL;  // 1601 -> 1970
          info.startTimeMs = (createdSince1601 / 10'000) - kEpochDeltaMs;

          currentCpu[info.pid] = CpuSample{kernel, user, now};
        }

        PROCESS_MEMORY_COUNTERS_EX memory = {};
        if (::GetProcessMemoryInfo(process, reinterpret_cast<PROCESS_MEMORY_COUNTERS*>(&memory), sizeof(memory))) {
          info.workingSetBytes = memory.WorkingSetSize;
          info.privateBytes = memory.PrivateUsage;
        }

        info.path = QueryImagePath(process);
        if (info.path.empty()) {
          info.path = std::string();
        }

        // An empty path means the process belongs to another user or is
        // protected; such processes can still be listed but not controlled.
        info.isAccessible = !info.path.empty();
        info.isElevated = false;

        ::CloseHandle(process);
      }

      if (!info.path.empty()) {
        info.description = QueryFileDescription(info.path);
        info.company = QueryCompanyName(info.path);
      }

      info.isProtected = IsProtectedProcess(info.name, info.pid);
      info.canTerminate = info.isAccessible && !info.isProtected && info.pid != ::GetCurrentProcessId();

      out.push_back(std::move(info));
    } while (::Process32NextW(snapshot, &entry));
  }

  ::CloseHandle(snapshot);

  // Second pass: convert cumulative CPU time into a percentage using the delta
  // since the previous call. A sample taken less than ~200 ms apart is too noisy
  // to be meaningful, so such deltas are skipped.
  for (ProcessInfo& info : out) {
    const auto current = currentCpu.find(info.pid);
    const auto previous = g_previousCpu.find(info.pid);

    if (current == currentCpu.end() || previous == g_previousCpu.end()) {
      info.cpuPercent = 0.0;
      continue;
    }

    const uint64_t deltaMs = current->second.timestamp > previous->second.timestamp
                                 ? current->second.timestamp - previous->second.timestamp
                                 : 0;

    if (deltaMs < 200) {
      info.cpuPercent = 0.0;
      continue;
    }

    const uint64_t cpuDelta = (current->second.kernelTime >= previous->second.kernelTime
                                   ? current->second.kernelTime - previous->second.kernelTime
                                   : 0) +
                              (current->second.userTime >= previous->second.userTime
                                   ? current->second.userTime - previous->second.userTime
                                   : 0);

    // Total capacity over the interval, in the same 100-ns units as the deltas.
    const double capacity = static_cast<double>(deltaMs) * 10'000.0 * static_cast<double>(logicalCores);

    info.cpuPercent = capacity > 0.0
                          ? std::clamp((static_cast<double>(cpuDelta) / capacity) * 100.0, 0.0, 100.0 * logicalCores)
                          : 0.0;

    if (elapsedMs == 0) {
      elapsedMs = deltaMs;
    }
  }

  (void)systemTotal;

  g_previousCpu = std::move(currentCpu);

  // Busiest first; Task Manager's default ordering.
  std::sort(out.begin(), out.end(), [](const ProcessInfo& a, const ProcessInfo& b) {
    if (a.cpuPercent != b.cpuPercent) {
      return a.cpuPercent > b.cpuPercent;
    }
    return a.workingSetBytes > b.workingSetBytes;
  });

  return static_cast<uint32_t>(out.size());
}

TerminateResult TerminateProcessById(uint32_t pid, uint32_t& errorCode) {
  errorCode = 0;

  if (pid == 0 || pid == 4) {
    return TerminateResult::Protected;
  }

  if (pid == ::GetCurrentProcessId()) {
    return TerminateResult::Self;
  }

  // Re-check protection by name so a caller cannot bypass it by passing a raw PID.
  {
    HANDLE snapshot = ::CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    if (snapshot != INVALID_HANDLE_VALUE) {
      PROCESSENTRY32W entry = {};
      entry.dwSize = sizeof(entry);

      if (::Process32FirstW(snapshot, &entry)) {
        do {
          if (entry.th32ProcessID == pid) {
            const std::string name = WideToUtf8(Trim(std::wstring(entry.szExeFile)));
            if (IsProtectedProcess(name, pid)) {
              ::CloseHandle(snapshot);
              return TerminateResult::Protected;
            }
            break;
          }
        } while (::Process32NextW(snapshot, &entry));
      }
      ::CloseHandle(snapshot);
    }
  }

  HANDLE process = ::OpenProcess(PROCESS_TERMINATE, FALSE, pid);
  if (process == nullptr) {
    errorCode = ::GetLastError();
    // ERROR_ACCESS_DENIED means the process needs elevation; other failures are
    // reported generically.
    return errorCode == ERROR_ACCESS_DENIED ? TerminateResult::AccessDenied : TerminateResult::Failed;
  }

  const BOOL terminated = ::TerminateProcess(process, 1);
  errorCode = terminated ? 0 : ::GetLastError();
  ::CloseHandle(process);

  return terminated ? TerminateResult::Success : TerminateResult::Failed;
}

void ResetProcessCpuHistory() {
  g_previousCpu.clear();
}

}  // namespace monitor
