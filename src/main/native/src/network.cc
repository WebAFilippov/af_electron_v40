#include "network.h"

// winsock2.h must precede windows.h (pulled in by common.h): including
// windows.h first drags in the legacy winsock.h and breaks the socket types.
#include <winsock2.h>

#include "common.h"

#include <iphlpapi.h>
#include <iptypes.h>
#include <ws2tcpip.h>

#include <cmath>
#include <map>
#include <utility>
#include <vector>

#pragma comment(lib, "iphlpapi.lib")
#pragma comment(lib, "ws2_32.lib")

// NOTE: GetIfTable2 / GetIfEntry2 / MIB_IF_ROW2 look like the modern API, but
// they are declared in <netioapi.h>, which includes <ntddk.h> (a kernel-mode
// header) before its own include guard. In a user-mode addon the whole header is
// skipped silently, so those symbols never exist. The documented user-mode
// equivalents used here are GetAdaptersAddresses (the adapter list) and
// GetIfTable (per-interface counters).

namespace monitor {

namespace {

struct RateSample {
  uint64_t rxBytes = 0;
  uint64_t txBytes = 0;
  uint64_t timestamp = 0;
};

std::map<DWORD, RateSample> g_previousSamples;

std::string AdapterTypeName(ULONG type) {
  switch (type) {
    case IF_TYPE_ETHERNET_CSMACD:
      return "ethernet";
    case IF_TYPE_IEEE80211:
      return "wifi";
    case IF_TYPE_SOFTWARE_LOOPBACK:
      return "loopback";
    case IF_TYPE_TUNNEL:
      return "tunnel";
    case IF_TYPE_PPP:
      return "ppp";
    case IF_TYPE_IEEE1394:
      return "firewire";
    case IF_TYPE_ATM:
      return "atm";
    default:
      return "other";
  }
}

std::string OperStatusName(IF_OPER_STATUS status) {
  switch (status) {
    case IfOperStatusUp:
      return "up";
    case IfOperStatusDown:
      return "down";
    case IfOperStatusTesting:
      return "testing";
    case IfOperStatusDormant:
      return "dormant";
    case IfOperStatusNotPresent:
      return "not-present";
    case IfOperStatusLowerLayerDown:
      return "lower-layer-down";
    default:
      return "unknown";
  }
}

std::string MacToString(const BYTE* address, ULONG length) {
  if (address == nullptr || length == 0) {
    return std::string();
  }

  static const char* hex = "0123456789ABCDEF";
  std::string result;
  result.reserve(length * 3);

  for (ULONG i = 0; i < length; ++i) {
    if (i > 0) {
      result.push_back(':');
    }
    result.push_back(hex[(address[i] >> 4) & 0x0F]);
    result.push_back(hex[address[i] & 0x0F]);
  }

  return result;
}

std::string SockAddrToIp(const SOCKADDR* address) {
  if (address == nullptr) {
    return std::string();
  }

  WCHAR buffer[64] = {};
  const DWORD length = static_cast<DWORD>(std::size(buffer));

  if (address->sa_family == AF_INET) {
    auto* v4 = reinterpret_cast<const SOCKADDR_IN*>(address);
    if (::InetNtopW(AF_INET, &v4->sin_addr, buffer, length) == nullptr) {
      return std::string();
    }
    return WideToUtf8(buffer);
  }

  if (address->sa_family == AF_INET6) {
    auto* v6 = reinterpret_cast<const SOCKADDR_IN6*>(address);
    if (::InetNtopW(AF_INET6, &v6->sin6_addr, buffer, length) == nullptr) {
      return std::string();
    }
    std::string ip = WideToUtf8(buffer);

    // Drop the "%scope" suffix; the owning interface is already known.
    const size_t percent = ip.find('%');
    if (percent != std::string::npos) {
      ip.erase(percent);
    }
    return ip;
  }

  return std::string();
}

uint64_t NowMillis() {
  return ::GetTickCount64();
}

// Indexes the MIB-II counter table by interface index so each real adapter can
// pick up its own byte counters.
bool LoadCounterTable(std::map<DWORD, MIB_IFROW>& out, std::vector<BYTE>& storage) {
  DWORD size = 0;
  if (::GetIfTable(nullptr, &size, FALSE) != ERROR_INSUFFICIENT_BUFFER || size == 0) {
    return false;
  }

  storage.resize(size);
  auto* table = reinterpret_cast<PMIB_IFTABLE>(storage.data());

  if (::GetIfTable(table, &size, FALSE) != NO_ERROR) {
    return false;
  }

  for (DWORD i = 0; i < table->dwNumEntries; ++i) {
    out[table->table[i].dwIndex] = table->table[i];
  }

  return true;
}

// A virtual adapter is a software construct (VPN tunnel, Wi-Fi Direct, WFP
// filter shim). Showing them all buries the real NICs, so only adapters that
// Windows itself would display are kept: those with a description and a MAC.
bool IsMeaningfulAdapter(const IP_ADAPTER_ADDRESSES* adapter) {
  if (adapter->IfType == IF_TYPE_SOFTWARE_LOOPBACK) {
    return false;
  }

  // Tunnels (VPN, Teredo, ISATAP) are not physical links.
  if (adapter->IfType == IF_TYPE_TUNNEL) {
    return false;
  }

  if (adapter->Description == nullptr || adapter->Description[0] == L'\0') {
    return false;
  }

  // Virtual adapters such as "Microsoft Wi-Fi Direct Virtual Adapter" have a
  // MAC but no real link speed and never carry traffic; filtering on a zero
  // link speed keeps the physical devices only.
  const bool hasSpeed = adapter->ReceiveLinkSpeed > 0 && adapter->ReceiveLinkSpeed < 1'000'000'000'000ULL;

  // Keep adapters that are up, or that are physically present but idle.
  return hasSpeed || adapter->OperStatus == IfOperStatusUp;
}

}  // namespace

void ReadNetworkAdapters(std::vector<NetworkAdapterInfo>& out) {
  out.clear();

  std::map<DWORD, MIB_IFROW> counters;
  std::vector<BYTE> counterStorage;
  LoadCounterTable(counters, counterStorage);

  // The adapter list itself comes from GetAdaptersAddresses: unlike GetIfTable it
  // enumerates real adapters rather than per-address pseudo interfaces, so there
  // are no duplicate rows.
  ULONG size = 0;
  const ULONG flags = GAA_FLAG_SKIP_ANYCAST | GAA_FLAG_SKIP_MULTICAST | GAA_FLAG_SKIP_DNS_SERVER;

  if (::GetAdaptersAddresses(AF_UNSPEC, flags, nullptr, nullptr, &size) != ERROR_BUFFER_OVERFLOW) {
    return;
  }

  std::vector<BYTE> storage(size);
  auto* addresses = reinterpret_cast<IP_ADAPTER_ADDRESSES*>(storage.data());

  if (::GetAdaptersAddresses(AF_UNSPEC, flags, nullptr, addresses, &size) != NO_ERROR) {
    return;
  }

  const uint64_t now = NowMillis();

  for (auto* adapter = addresses; adapter != nullptr; adapter = adapter->Next) {
    if (!IsMeaningfulAdapter(adapter)) {
      continue;
    }

    NetworkAdapterInfo info;
    info.ifIndex = adapter->IfIndex;
    info.description = WideToUtf8(Trim(std::wstring(adapter->Description)));
    if (adapter->FriendlyName != nullptr) {
      // FriendlyName ("Ethernet", "Wi-Fi") is what the OS shows in Settings.
      info.name = WideToUtf8(Trim(std::wstring(adapter->FriendlyName)));
    }
    info.type = AdapterTypeName(adapter->IfType);
    info.status = OperStatusName(adapter->OperStatus);
    info.isUp = adapter->OperStatus == IfOperStatusUp;
    info.mtu = adapter->Mtu;
    info.mac = MacToString(adapter->PhysicalAddress, adapter->PhysicalAddressLength);
    info.receiveSpeedBps = adapter->ReceiveLinkSpeed;
    info.transmitSpeedBps = adapter->TransmitLinkSpeed;
    info.maxSpeedMbps = static_cast<double>(adapter->ReceiveLinkSpeed) / 1'000'000.0;

    for (auto* unicast = adapter->FirstUnicastAddress; unicast != nullptr; unicast = unicast->Next) {
      const std::string ip = SockAddrToIp(unicast->Address.lpSockaddr);
      if (ip.empty()) {
        continue;
      }

      const bool isV6 = unicast->Address.lpSockaddr->sa_family == AF_INET6;
      if (!isV6 && info.ip4.empty()) {
        info.ip4 = ip;
        info.prefixLength = unicast->OnLinkPrefixLength;
      } else if (isV6 && info.ip6.empty()) {
        // Keep the first routable IPv6 address; link-local values are only a
        // fallback when nothing better exists.
        const bool linkLocal = ip.rfind("fe80:", 0) == 0;
        if (!linkLocal) {
          info.ip6 = ip;
        }
      }
    }

    // Counters come from the MIB-II table, matched by interface index.
    const auto counter = counters.find(static_cast<DWORD>(adapter->IfIndex));
    if (counter != counters.end()) {
      const MIB_IFROW& row = counter->second;
      info.receiveBytes = row.dwInOctets;
      info.transmitBytes = row.dwOutOctets;

      if (info.mtu == 0 && row.dwMtu > 0) {
        info.mtu = row.dwMtu;
      }
      // `dwSpeed` is in bits per second and fills in when the adapter reports no
      // link speed of its own.
      if (info.maxSpeedMbps == 0.0 && row.dwSpeed > 0 && row.dwSpeed != MAXDWORD) {
        info.maxSpeedMbps = static_cast<double>(row.dwSpeed) / 1'000'000.0;
        info.receiveSpeedBps = row.dwSpeed;
      }

      auto previous = g_previousSamples.find(row.dwIndex);
      if (previous != g_previousSamples.end()) {
        const uint64_t elapsed = now - previous->second.timestamp;
        if (elapsed > 0 && elapsed < 60'000) {
          const double seconds = static_cast<double>(elapsed) / 1000.0;
          const uint64_t rxDelta =
              row.dwInOctets >= previous->second.rxBytes ? row.dwInOctets - previous->second.rxBytes : 0;
          const uint64_t txDelta =
              row.dwOutOctets >= previous->second.txBytes ? row.dwOutOctets - previous->second.txBytes : 0;
          info.receiveBytesPerSec = static_cast<double>(rxDelta) / seconds;
          info.transmitBytesPerSec = static_cast<double>(txDelta) / seconds;
        }
      }

      g_previousSamples[row.dwIndex] = RateSample{row.dwInOctets, row.dwOutOctets, now};
    }

    out.push_back(std::move(info));
  }
}

}  // namespace monitor
