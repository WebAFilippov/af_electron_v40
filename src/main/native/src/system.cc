#include "system.h"

#include "common.h"

#include <lmcons.h>

#include <cstdlib>
#include <vector>

namespace monitor {

namespace {

std::string ReadRegString(HKEY root, const wchar_t* subKey, const wchar_t* valueName) {
  HKEY key = nullptr;
  if (::RegOpenKeyExW(root, subKey, 0, KEY_READ | KEY_WOW64_64KEY, &key) != ERROR_SUCCESS) {
    return std::string();
  }

  WCHAR buffer[512] = {};
  DWORD size = sizeof(buffer);
  DWORD type = 0;
  const LONG status = ::RegQueryValueExW(key, valueName, nullptr, &type, reinterpret_cast<LPBYTE>(buffer), &size);
  ::RegCloseKey(key);

  if (status != ERROR_SUCCESS || (type != REG_SZ && type != REG_EXPAND_SZ)) {
    return std::string();
  }

  return WideToUtf8(Trim(std::wstring(buffer)));
}

// `CurrentBuildNumber` alone is ambiguous across Windows 11; the build revision
// disambiguates 21H2/22H2/23H2 etc.
std::string ReadBuildRevision() {
  return ReadRegString(HKEY_LOCAL_MACHINE, L"SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion", L"UBR");
}

// `ProductName` in the registry has reported "Windows 10" for every release
// since 2016 — including Windows 11 — because Microsoft never updated the value.
// The reliable discriminator is the build number: 22000+ is Windows 11.
std::string ResolveWindowsName(const std::string& registryProductName, const std::string& buildNumber) {
  const long build = buildNumber.empty() ? 0 : std::strtol(buildNumber.c_str(), nullptr, 10);

  if (build >= 22000) {
    return "Windows 11";
  }
  if (build > 0) {
    return "Windows 10";
  }

  return registryProductName;
}

std::string FormatOsVersion(const std::string& edition) {
  const std::string displayVersion =
      ReadRegString(HKEY_LOCAL_MACHINE, L"SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion", L"DisplayVersion");
  const std::string build =
      ReadRegString(HKEY_LOCAL_MACHINE, L"SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion", L"CurrentBuildNumber");
  const std::string revision = ReadBuildRevision();

  std::string result = edition;
  if (!displayVersion.empty()) {
    result += " " + displayVersion;
  }
  if (!build.empty()) {
    result += " (build " + build;
    if (!revision.empty()) {
      result += "." + revision;
    }
    result += ")";
  }

  return result;
}

}  // namespace

bool ReadSystemInfo(SystemInfo& out) {
  WCHAR hostname[MAX_COMPUTERNAME_LENGTH + 1] = {};
  DWORD hostnameLength = MAX_COMPUTERNAME_LENGTH + 1;
  if (::GetComputerNameW(hostname, &hostnameLength)) {
    out.hostname = WideToUtf8(std::wstring(hostname, hostnameLength));
  }

  out.manufacturer = ReadRegString(HKEY_LOCAL_MACHINE, L"HARDWARE\\DESCRIPTION\\System\\BIOS", L"SystemManufacturer");
  out.model = ReadRegString(HKEY_LOCAL_MACHINE, L"HARDWARE\\DESCRIPTION\\System\\BIOS", L"SystemProductName");
  out.biosVersion = ReadRegString(HKEY_LOCAL_MACHINE, L"HARDWARE\\DESCRIPTION\\System\\BIOS", L"BIOSVersion");
  out.biosDate = ReadRegString(HKEY_LOCAL_MACHINE, L"HARDWARE\\DESCRIPTION\\System\\BIOS", L"BIOSReleaseDate");

  out.osBuild =
      ReadRegString(HKEY_LOCAL_MACHINE, L"SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion", L"CurrentBuildNumber");
  out.osName = ResolveWindowsName(
      ReadRegString(HKEY_LOCAL_MACHINE, L"SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion", L"ProductName"),
      out.osBuild);
  out.osVersion = FormatOsVersion(out.osName);

  SYSTEM_INFO sysInfo = {};
  ::GetNativeSystemInfo(&sysInfo);
  switch (sysInfo.wProcessorArchitecture) {
    case PROCESSOR_ARCHITECTURE_AMD64:
      out.architecture = "x64";
      break;
    case PROCESSOR_ARCHITECTURE_ARM64:
      out.architecture = "ARM64";
      break;
    case PROCESSOR_ARCHITECTURE_INTEL:
      out.architecture = "x86";
      break;
    default:
      out.architecture = "unknown";
      break;
  }

  out.uptimeSeconds = static_cast<double>(::GetTickCount64()) / 1000.0;
  out.bootTimeMs = static_cast<double>(::GetTickCount64());

  out.isAdmin = false;
  BOOL isAdmin = FALSE;
  PSID adminGroup = nullptr;
  SID_IDENTIFIER_AUTHORITY ntAuthority = SECURITY_NT_AUTHORITY;

  if (::AllocateAndInitializeSid(&ntAuthority, 2, SECURITY_BUILTIN_DOMAIN_RID, DOMAIN_ALIAS_RID_ADMINS, 0, 0, 0, 0, 0, 0,
                                 &adminGroup)) {
    ::CheckTokenMembership(nullptr, adminGroup, &isAdmin);
    ::FreeSid(adminGroup);
    out.isAdmin = isAdmin == TRUE;
  }

  return true;
}

}  // namespace monitor
