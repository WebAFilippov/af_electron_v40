#include "memory.h"

#include <windows.h>
// PERFORMANCE_INFORMATION / GetPerformanceInfo live in psapi, not in the core
// Windows headers pulled in by <windows.h>.
#include <psapi.h>

#include <cstdint>

#pragma comment(lib, "psapi.lib")

namespace monitor {

bool ReadMemory(MemoryInfo& out) {
  MEMORYSTATUSEX status = {};
  status.dwLength = sizeof(status);

  if (!::GlobalMemoryStatusEx(&status)) {
    return false;
  }

  out.totalBytes = status.ullTotalPhys;
  out.availableBytes = status.ullAvailPhys;
  out.usedBytes = status.ullTotalPhys - status.ullAvailPhys;
  out.loadPercent = static_cast<double>(status.dwMemoryLoad);

  out.commitTotalBytes = status.ullTotalPageFile;
  out.commitAvailableBytes = status.ullAvailPageFile;
  out.commitUsedBytes = status.ullTotalPageFile - status.ullAvailPageFile;

  out.cachedBytes = 0;

  // Standby/cached memory lives in the performance counters, not in
  // MEMORYSTATUSEX. `SystemCache` reports the file cache size, which is what
  // Windows Task Manager labels "Cached".
  PERFORMANCE_INFORMATION perfInfo = {};
  perfInfo.cb = sizeof(perfInfo);
  if (::GetPerformanceInfo(&perfInfo, sizeof(perfInfo))) {
    const uint64_t pageSize = perfInfo.PageSize;
    out.cachedBytes = static_cast<uint64_t>(perfInfo.SystemCache) * pageSize;

    out.commitTotalBytes = static_cast<uint64_t>(perfInfo.CommitLimit) * pageSize;
    out.commitUsedBytes = static_cast<uint64_t>(perfInfo.CommitTotal) * pageSize;
    out.commitAvailableBytes =
        (perfInfo.CommitLimit > perfInfo.CommitTotal
             ? static_cast<uint64_t>(perfInfo.CommitLimit - perfInfo.CommitTotal)
             : 0) *
        pageSize;

    // "Hardware reserved" in Task Manager: total physical memory that Windows
    // cannot hand to processes, derived from the physical page count.
    const uint64_t physicalTotal = static_cast<uint64_t>(perfInfo.PhysicalTotal) * pageSize;
    if (out.totalBytes > 0 && physicalTotal > out.totalBytes) {
      out.hardwareReservedBytes = physicalTotal - out.totalBytes;
    }
  }

  return true;
}

}  // namespace monitor
