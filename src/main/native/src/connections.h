#pragma once

#include <cstdint>
#include <string>
#include <vector>

namespace monitor {

struct ConnectionInfo {
  /** "TCP" or "UDP". */
  std::string protocol;
  /** "IPv4" or "IPv6". */
  std::string family;

  std::string localAddress;
  uint16_t localPort = 0;

  /** Empty for listening sockets and for connectionless UDP. */
  std::string remoteAddress;
  uint16_t remotePort = 0;

  /** "established", "listening", "time-wait", "unconnected", ... */
  std::string state;

  uint32_t pid = 0;
};

/** Fills `out` with every TCP and UDP endpoint on the machine. */
void ReadConnections(std::vector<ConnectionInfo>& out);

}  // namespace monitor
