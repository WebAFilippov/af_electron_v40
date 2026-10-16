#pragma once

#include <cstdint>
#include <string>
#include <vector>

namespace monitor {

struct VolumeInfo {
  std::string mountPoint;
  std::string label;
  std::string fileSystem;
  std::string driveType;

  uint64_t totalBytes = 0;
  uint64_t usedBytes = 0;
  uint64_t freeBytes = 0;
  double usagePercent = 0.0;
};

struct PhysicalDiskInfo {
  std::string device;
  std::string model;
  std::string vendor;
  std::string serial;
  std::string busType;

  uint64_t sizeBytes = 0;
  uint32_t bytesPerSector = 0;
  bool isRemovable = false;
  bool hasHealthData = false;
  bool healthy = true;
};

void ReadVolumes(std::vector<VolumeInfo>& out);
void ReadPhysicalDisks(std::vector<PhysicalDiskInfo>& out);

}  // namespace monitor
