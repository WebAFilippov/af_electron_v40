#include "connections.h"

// Include order is load-bearing here:
//   winsock2.h  must precede windows.h, or the legacy winsock.h wins and the
//               socket types conflict;
//   ws2ipdef.h  must precede iphlpapi.h, because iphlpapi.h pulls in tcpmib.h
//               and tcpmib.h guards its IPv6 tables behind `_WS2IPDEF_`.
// Reordering these silently drops MIB_TCP6TABLE_OWNER_PID / MIB_UDP6TABLE_OWNER_PID.
#include <winsock2.h>
#include <ws2ipdef.h>

#include "common.h"

#include <iphlpapi.h>
#include <tcpmib.h>
#include <udpmib.h>
#include <ws2tcpip.h>

#include <string>
#include <vector>

#pragma comment(lib, "iphlpapi.lib")
#pragma comment(lib, "ws2_32.lib")

// Active TCP/UDP endpoints via the IP Helper API.
//
// GetExtendedTcpTable / GetExtendedUdpTable are the documented user-mode way to
// list sockets together with their owning PID. They require no elevation, unlike
// the `Get-NetTCPConnection` PowerShell cmdlet, which returns nothing for a
// standard user.

namespace monitor {

namespace {

std::string PortToString(DWORD port) {
  // The tables store ports in network byte order inside the low 16 bits.
  return std::to_string(::ntohs(static_cast<u_short>(port)));
}

std::string Ipv4ToString(DWORD address) {
  IN_ADDR addr = {};
  addr.S_un.S_addr = address;

  char buffer[INET_ADDRSTRLEN] = {};
  if (::InetNtopA(AF_INET, &addr, buffer, sizeof(buffer)) == nullptr) {
    return std::string();
  }
  return std::string(buffer);
}

std::string Ipv6ToString(const UCHAR* address) {
  IN6_ADDR addr = {};
  ::memcpy(&addr, address, sizeof(addr));

  char buffer[INET6_ADDRSTRLEN] = {};
  if (::InetNtopA(AF_INET6, &addr, buffer, sizeof(buffer)) == nullptr) {
    return std::string();
  }
  return std::string(buffer);
}

std::string TcpStateName(DWORD state) {
  switch (state) {
    case MIB_TCP_STATE_CLOSED:
      return "closed";
    case MIB_TCP_STATE_LISTEN:
      return "listening";
    case MIB_TCP_STATE_SYN_SENT:
      return "syn-sent";
    case MIB_TCP_STATE_SYN_RCVD:
      return "syn-received";
    case MIB_TCP_STATE_ESTAB:
      return "established";
    case MIB_TCP_STATE_FIN_WAIT1:
      return "fin-wait-1";
    case MIB_TCP_STATE_FIN_WAIT2:
      return "fin-wait-2";
    case MIB_TCP_STATE_CLOSE_WAIT:
      return "close-wait";
    case MIB_TCP_STATE_CLOSING:
      return "closing";
    case MIB_TCP_STATE_LAST_ACK:
      return "last-ack";
    case MIB_TCP_STATE_TIME_WAIT:
      return "time-wait";
    case MIB_TCP_STATE_DELETE_TCB:
      return "delete-tcb";
    default:
      return "unknown";
  }
}

/** A listening socket has no meaningful remote endpoint. */
bool IsListeningState(DWORD state) {
  return state == MIB_TCP_STATE_LISTEN;
}

template <typename TTable>
bool QueryTable(ULONG (*query)(PVOID, PDWORD, BOOL, ULONG, TCP_TABLE_CLASS, ULONG), TCP_TABLE_CLASS tableClass,
                ADDRESS_FAMILY family, std::vector<BYTE>& storage, TTable*& table) {
  DWORD size = 0;
  if (query(nullptr, &size, FALSE, family, tableClass, 0) != ERROR_INSUFFICIENT_BUFFER || size == 0) {
    return false;
  }

  storage.resize(size);
  if (query(storage.data(), &size, FALSE, family, tableClass, 0) != NO_ERROR) {
    return false;
  }

  table = reinterpret_cast<TTable*>(storage.data());
  return true;
}

}  // namespace

void ReadConnections(std::vector<ConnectionInfo>& out) {
  out.clear();

  // --- TCP over IPv4 -------------------------------------------------------
  {
    std::vector<BYTE> storage;
    PMIB_TCPTABLE_OWNER_PID table = nullptr;

    if (QueryTable<MIB_TCPTABLE_OWNER_PID>(::GetExtendedTcpTable, TCP_TABLE_OWNER_PID_ALL, AF_INET, storage, table)) {
      for (DWORD i = 0; i < table->dwNumEntries; ++i) {
        const MIB_TCPROW_OWNER_PID& row = table->table[i];

        ConnectionInfo info;
        info.protocol = "TCP";
        info.family = "IPv4";
        info.localAddress = Ipv4ToString(row.dwLocalAddr);
        info.localPort = ::ntohs(static_cast<u_short>(row.dwLocalPort));
        info.remoteAddress = Ipv4ToString(row.dwRemoteAddr);
        info.remotePort = ::ntohs(static_cast<u_short>(row.dwRemotePort));
        info.state = TcpStateName(row.dwState);
        info.pid = row.dwOwningPid;

        // A listening socket has no peer, so showing 0.0.0.0:0 is noise.
        if (IsListeningState(row.dwState)) {
          info.remoteAddress.clear();
          info.remotePort = 0;
        }

        out.push_back(std::move(info));
      }
    }
  }

  // --- TCP over IPv6 -------------------------------------------------------
  {
    std::vector<BYTE> storage;
    PMIB_TCP6TABLE_OWNER_PID table = nullptr;

    if (QueryTable<MIB_TCP6TABLE_OWNER_PID>(::GetExtendedTcpTable, TCP_TABLE_OWNER_PID_ALL, AF_INET6, storage, table)) {
      for (DWORD i = 0; i < table->dwNumEntries; ++i) {
        const MIB_TCP6ROW_OWNER_PID& row = table->table[i];

        ConnectionInfo info;
        info.protocol = "TCP";
        info.family = "IPv6";
        info.localAddress = Ipv6ToString(row.ucLocalAddr);
        info.localPort = ::ntohs(static_cast<u_short>(row.dwLocalPort));
        info.remoteAddress = Ipv6ToString(row.ucRemoteAddr);
        info.remotePort = ::ntohs(static_cast<u_short>(row.dwRemotePort));
        info.state = TcpStateName(row.dwState);
        info.pid = row.dwOwningPid;

        if (IsListeningState(row.dwState)) {
          info.remoteAddress.clear();
          info.remotePort = 0;
        }

        out.push_back(std::move(info));
      }
    }
  }

  // --- UDP over IPv4 -------------------------------------------------------
  {
    std::vector<BYTE> storage;
    PMIB_UDPTABLE_OWNER_PID table = nullptr;

    DWORD size = 0;
    if (::GetExtendedUdpTable(nullptr, &size, FALSE, AF_INET, UDP_TABLE_OWNER_PID, 0) == ERROR_INSUFFICIENT_BUFFER &&
        size > 0) {
      storage.resize(size);
      if (::GetExtendedUdpTable(storage.data(), &size, FALSE, AF_INET, UDP_TABLE_OWNER_PID, 0) == NO_ERROR) {
        table = reinterpret_cast<PMIB_UDPTABLE_OWNER_PID>(storage.data());

        for (DWORD i = 0; i < table->dwNumEntries; ++i) {
          const MIB_UDPROW_OWNER_PID& row = table->table[i];

          ConnectionInfo info;
          info.protocol = "UDP";
          info.family = "IPv4";
          info.localAddress = Ipv4ToString(row.dwLocalAddr);
          info.localPort = ::ntohs(static_cast<u_short>(row.dwLocalPort));
          // UDP is connectionless: no peer and no state.
          info.state = "unconnected";
          info.pid = row.dwOwningPid;

          out.push_back(std::move(info));
        }
      }
    }
  }

  // --- UDP over IPv6 -------------------------------------------------------
  {
    std::vector<BYTE> storage;
    PMIB_UDP6TABLE_OWNER_PID table = nullptr;

    DWORD size = 0;
    if (::GetExtendedUdpTable(nullptr, &size, FALSE, AF_INET6, UDP_TABLE_OWNER_PID, 0) == ERROR_INSUFFICIENT_BUFFER &&
        size > 0) {
      storage.resize(size);
      if (::GetExtendedUdpTable(storage.data(), &size, FALSE, AF_INET6, UDP_TABLE_OWNER_PID, 0) == NO_ERROR) {
        table = reinterpret_cast<PMIB_UDP6TABLE_OWNER_PID>(storage.data());

        for (DWORD i = 0; i < table->dwNumEntries; ++i) {
          const MIB_UDP6ROW_OWNER_PID& row = table->table[i];

          ConnectionInfo info;
          info.protocol = "UDP";
          info.family = "IPv6";
          info.localAddress = Ipv6ToString(row.ucLocalAddr);
          info.localPort = ::ntohs(static_cast<u_short>(row.dwLocalPort));
          info.state = "unconnected";
          info.pid = row.dwOwningPid;

          out.push_back(std::move(info));
        }
      }
    }
  }
}

}  // namespace monitor
