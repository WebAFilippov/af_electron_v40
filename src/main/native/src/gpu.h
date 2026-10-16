#pragma once

#include <cstdint>
#include <string>
#include <vector>

namespace monitor {

struct GpuInfo {
  std::string name;
  std::string vendor;
  uint32_t vendorId = 0;
  uint32_t deviceId = 0;

  uint64_t dedicatedVramBytes = 0;
  uint64_t dedicatedSystemMemoryBytes = 0;
  uint64_t sharedSystemMemoryBytes = 0;
  uint64_t luid = 0;

  bool isSoftware = false;

  uint32_t displayWidth = 0;
  uint32_t displayHeight = 0;
  uint32_t refreshRateHz = 0;
};

void ReadGpus(std::vector<GpuInfo>& out);

}  // namespace monitor
