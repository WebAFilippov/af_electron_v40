#pragma once

#include <cstdint>
#include <string>
#include <vector>

namespace monitor {

struct NetworkAdapterInfo {
  // Stable adapter index; `name` is a device path and is not meant for display.
  uint32_t ifIndex = 0;

  std::string name;
  std::string description;
  std::string type;
  std::string status;
  std::string mac;

  std::string ip4;
  std::string ip6;
  uint32_t prefixLength = 0;

  bool isUp = false;
  uint32_t mtu = 0;

  uint64_t receiveBytes = 0;
  uint64_t transmitBytes = 0;
  uint64_t receiveSpeedBps = 0;
  uint64_t transmitSpeedBps = 0;

  // Computed from successive samples.
  double receiveBytesPerSec = 0.0;
  double transmitBytesPerSec = 0.0;
  double maxSpeedMbps = 0.0;
};

void ReadNetworkAdapters(std::vector<NetworkAdapterInfo>& out);

}  // namespace monitor
