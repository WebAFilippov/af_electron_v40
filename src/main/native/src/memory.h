#pragma once

#include <cstdint>

namespace monitor {

struct MemoryInfo {
  uint64_t totalBytes = 0;
  uint64_t usedBytes = 0;
  uint64_t availableBytes = 0;
  double loadPercent = 0.0;

  uint64_t commitTotalBytes = 0;
  uint64_t commitUsedBytes = 0;
  uint64_t commitAvailableBytes = 0;

  uint64_t cachedBytes = 0;
  uint64_t hardwareReservedBytes = 0;
};

bool ReadMemory(MemoryInfo& out);

}  // namespace monitor
