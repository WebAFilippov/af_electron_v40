#pragma once

#include <cstdint>
#include <string>

namespace monitor {

struct SystemInfo {
  std::string hostname;
  std::string manufacturer;
  std::string model;
  std::string biosVersion;
  std::string biosDate;

  std::string osName;
  std::string osVersion;
  std::string osBuild;
  std::string architecture;

  double uptimeSeconds = 0.0;
  double bootTimeMs = 0.0;
  bool isAdmin = false;
};

bool ReadSystemInfo(SystemInfo& out);

}  // namespace monitor
