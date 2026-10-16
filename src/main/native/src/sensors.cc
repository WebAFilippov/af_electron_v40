#include "sensors.h"

#include "common.h"

#include <tlhelp32.h>
#include <winhttp.h>

#include <cstdlib>
#include <mutex>
#include <string>
#include <vector>

#pragma comment(lib, "winhttp.lib")

namespace monitor {

namespace {

constexpr wchar_t kLhmProcessName[] = L"LibreHardwareMonitor.exe";
constexpr char kDataPath[] = "/data.json";
constexpr DWORD kHttpTimeoutMs = 3000;

std::mutex g_mutex;
std::string g_baseUrl;
bool g_available = false;

// Diagnostics for the last probe, surfaced through the addon so the UI can
// explain a failure instead of silently showing nothing.
std::string g_lastError;
int g_configsFound = 0;
bool g_processFound = false;

std::string ReadConfigValue(const std::wstring& filePath, const std::wstring& key) {
  HANDLE file = ::CreateFileW(filePath.c_str(), GENERIC_READ, FILE_SHARE_READ | FILE_SHARE_WRITE, nullptr, OPEN_EXISTING,
                              FILE_ATTRIBUTE_NORMAL, nullptr);
  if (file == INVALID_HANDLE_VALUE) {
    return std::string();
  }

  LARGE_INTEGER size = {};
  if (!::GetFileSizeEx(file, &size) || size.QuadPart <= 0 || size.QuadPart > 16 * 1024 * 1024) {
    ::CloseHandle(file);
    return std::string();
  }

  std::string content(static_cast<size_t>(size.QuadPart), '\0');
  DWORD read = 0;
  const BOOL ok = ::ReadFile(file, content.data(), static_cast<DWORD>(content.size()), &read, nullptr);
  ::CloseHandle(file);

  if (!ok || read == 0) {
    return std::string();
  }
  content.resize(read);

  if (content.rfind("\xEF\xBB\xBF", 0) == 0) {
    content.erase(0, 3);
  }

  const std::string needle = "key=\"" + WideToUtf8(key) + "\"";
  const size_t position = content.find(needle);
  if (position == std::string::npos) {
    return std::string();
  }

  const size_t valueStart = content.find("value=\"", position);
  if (valueStart == std::string::npos) {
    return std::string();
  }

  const size_t begin = valueStart + 7;
  const size_t end = content.find('"', begin);
  if (end == std::string::npos) {
    return std::string();
  }

  return content.substr(begin, end - begin);
}

std::vector<std::wstring> CandidateConfigPaths() {
  std::vector<std::wstring> paths;

  auto addInstallDir = [&paths](const wchar_t* root) {
    if (root == nullptr) {
      return;
    }
    paths.push_back(std::wstring(root) + L"\\LibreHardwareMonitor\\LibreHardwareMonitor.config");
  };

  addInstallDir(_wgetenv(L"ProgramFiles"));
  addInstallDir(_wgetenv(L"ProgramFiles(x86)"));

  const wchar_t* localAppData = _wgetenv(L"LOCALAPPDATA");
  if (localAppData != nullptr) {
    paths.push_back(std::wstring(localAppData) + L"\\Programs\\LibreHardwareMonitor\\LibreHardwareMonitor.config");

    const std::wstring packagesRoot = std::wstring(localAppData) + L"\\Microsoft\\WinGet\\Packages";
    const std::wstring pattern = packagesRoot + L"\\*LibreHardwareMonitor*";

    WIN32_FIND_DATAW entry = {};
    HANDLE find = ::FindFirstFileW(pattern.c_str(), &entry);

    if (find != INVALID_HANDLE_VALUE) {
      do {
        if ((entry.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) != 0) {
          paths.push_back(packagesRoot + L"\\" + entry.cFileName + L"\\LibreHardwareMonitor.config");
        }
      } while (::FindNextFileW(find, &entry));

      ::FindClose(find);
    }
  }

  return paths;
}

/**
 * Best-effort check for a running LibreHardwareMonitor.
 *
 * This is only a hint used to skip an HTTP timeout: the process can legitimately
 * be invisible to a non-elevated caller (it may run in another session, or its
 * listener may be hosted by HTTP.SYS), so a negative result must never be treated
 * as authoritative. The HTTP probe below is what actually decides availability.
 */
bool IsProviderRunning() {
  HANDLE snapshot = ::CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
  if (snapshot == INVALID_HANDLE_VALUE) {
    return false;
  }

  PROCESSENTRY32W entry = {};
  entry.dwSize = sizeof(entry);

  bool found = false;
  if (::Process32FirstW(snapshot, &entry)) {
    do {
      if (_wcsicmp(entry.szExeFile, kLhmProcessName) == 0) {
        found = true;
        break;
      }
    } while (::Process32NextW(snapshot, &entry));
  }

  ::CloseHandle(snapshot);
  return found;
}

/** Builds the list of URLs worth trying, in priority order. */
std::vector<std::string> CandidateBaseUrls() {
  std::vector<std::string> urls;
  g_configsFound = 0;

  for (const std::wstring& path : CandidateConfigPaths()) {
    if (::GetFileAttributesW(path.c_str()) == INVALID_FILE_ATTRIBUTES) {
      continue;
    }
    ++g_configsFound;

    const std::string ip = ReadConfigValue(path, L"listenerIp");
    if (ip.empty()) {
      continue;
    }

    std::string port = ReadConfigValue(path, L"listenerPort");
    if (port.empty()) {
      port = "8085";
    }

    urls.push_back("http://" + ip + ":" + port);
  }

  // The configured interface address is the documented behaviour, but the
  // listener may also be reachable on loopback or on the wildcard address, so
  // those are tried as fallbacks rather than assuming a single answer.
  urls.push_back("http://127.0.0.1:8085");
  urls.push_back("http://localhost:8085");

  return urls;
}

std::string HttpGet(const std::string& baseUrl, const std::string& path, std::string& error) {
  const std::wstring wideUrl(baseUrl.begin(), baseUrl.end());
  const std::wstring widePath(path.begin(), path.end());

  URL_COMPONENTS components = {};
  components.dwStructSize = sizeof(components);
  components.dwSchemeLength = static_cast<DWORD>(-1);
  components.dwHostNameLength = static_cast<DWORD>(-1);
  components.dwUrlPathLength = static_cast<DWORD>(-1);

  if (!::WinHttpCrackUrl(wideUrl.c_str(), static_cast<DWORD>(wideUrl.size()), 0, &components)) {
    error = "WinHttpCrackUrl failed for " + baseUrl;
    return std::string();
  }

  const std::wstring host(components.lpszHostName, components.dwHostNameLength);
  const std::wstring urlPath(components.lpszUrlPath, components.dwUrlPathLength);

  HINTERNET session = ::WinHttpOpen(L"Effectory/1.0", WINHTTP_ACCESS_TYPE_NO_PROXY, WINHTTP_NO_PROXY_NAME,
                                    WINHTTP_NO_PROXY_BYPASS, 0);
  if (session == nullptr) {
    error = "WinHttpOpen failed: " + std::to_string(::GetLastError());
    return std::string();
  }

  ::WinHttpSetTimeouts(session, kHttpTimeoutMs, kHttpTimeoutMs, kHttpTimeoutMs, kHttpTimeoutMs);

  HINTERNET connection = ::WinHttpConnect(session, host.c_str(), static_cast<INTERNET_PORT>(components.nPort), 0);
  if (connection == nullptr) {
    error = "WinHttpConnect failed: " + std::to_string(::GetLastError());
    ::WinHttpCloseHandle(session);
    return std::string();
  }

  const std::wstring requestPath = urlPath + widePath;

  HINTERNET request = ::WinHttpOpenRequest(connection, L"GET", requestPath.c_str(), nullptr, WINHTTP_NO_REFERER,
                                           WINHTTP_DEFAULT_ACCEPT_TYPES, 0);
  if (request == nullptr) {
    error = "WinHttpOpenRequest failed: " + std::to_string(::GetLastError());
    ::WinHttpCloseHandle(connection);
    ::WinHttpCloseHandle(session);
    return std::string();
  }

  std::string body;

  if (!::WinHttpSendRequest(request, WINHTTP_NO_ADDITIONAL_HEADERS, 0, WINHTTP_NO_REQUEST_DATA, 0, 0, 0)) {
    error = "WinHttpSendRequest failed: " + std::to_string(::GetLastError());
  } else if (!::WinHttpReceiveResponse(request, nullptr)) {
    error = "WinHttpReceiveResponse failed: " + std::to_string(::GetLastError());
  } else {
    DWORD status = 0;
    DWORD statusSize = sizeof(status);
    ::WinHttpQueryHeaders(request, WINHTTP_QUERY_STATUS_CODE | WINHTTP_QUERY_FLAG_NUMBER, WINHTTP_HEADER_NAME_BY_INDEX,
                          &status, &statusSize, WINHTTP_NO_HEADER_INDEX);

    if (status != 200) {
      error = "HTTP status " + std::to_string(status);
    } else {
      for (;;) {
        DWORD available = 0;
        if (!::WinHttpQueryDataAvailable(request, &available) || available == 0) {
          break;
        }

        const size_t offset = body.size();
        body.resize(offset + available);

        DWORD read = 0;
        if (!::WinHttpReadData(request, body.data() + offset, available, &read)) {
          error = "WinHttpReadData failed: " + std::to_string(::GetLastError());
          body.clear();
          break;
        }
        body.resize(offset + read);
      }
    }
  }

  ::WinHttpCloseHandle(request);
  ::WinHttpCloseHandle(connection);
  ::WinHttpCloseHandle(session);

  return body;
}

struct JsonNode {
  std::string text;
  std::string value;
  std::string hardwareId;
  std::vector<JsonNode> children;
};

class JsonReader {
 public:
  explicit JsonReader(const std::string& source) : source_(source) {}

  bool Parse(JsonNode& out) {
    SkipWhitespace();
    return ParseObject(out);
  }

 private:
  const std::string& source_;
  size_t position_ = 0;

  void SkipWhitespace() {
    while (position_ < source_.size()) {
      const char c = source_[position_];
      if (c == ' ' || c == '\t' || c == '\n' || c == '\r') {
        ++position_;
      } else {
        break;
      }
    }
  }

  bool PeekIs(char c) {
    SkipWhitespace();
    return position_ < source_.size() && source_[position_] == c;
  }

  bool Expect(char expected) {
    SkipWhitespace();
    if (position_ < source_.size() && source_[position_] == expected) {
      ++position_;
      return true;
    }
    return false;
  }

  std::string ParseString() {
    if (!Expect('"')) {
      return std::string();
    }

    std::string result;
    while (position_ < source_.size()) {
      const char c = source_[position_++];
      if (c == '"') {
        break;
      }

      if (c == '\\' && position_ < source_.size()) {
        const char escaped = source_[position_++];
        switch (escaped) {
          case 'n':
            result.push_back('\n');
            break;
          case 't':
            result.push_back('\t');
            break;
          case 'r':
            result.push_back('\r');
            break;
          case 'u':
            if (position_ + 4 <= source_.size()) {
              position_ += 4;
            }
            break;
          default:
            result.push_back(escaped);
            break;
        }
      } else {
        result.push_back(c);
      }
    }

    return result;
  }

  void SkipScalar() {
    while (position_ < source_.size()) {
      const char c = source_[position_];
      if (c == ',' || c == '}' || c == ']' || c == ' ' || c == '\n' || c == '\r' || c == '\t') {
        break;
      }
      ++position_;
    }
  }

  bool ParseChildren(JsonNode& node) {
    if (!Expect('[')) {
      return false;
    }

    for (;;) {
      if (PeekIs(']')) {
        Expect(']');
        return true;
      }

      JsonNode child;
      if (!PeekIs('{')) {
        SkipScalar();
      } else if (!ParseObject(child)) {
        return false;
      } else {
        node.children.push_back(std::move(child));
      }

      if (PeekIs(',')) {
        Expect(',');
      }
    }
  }

  bool ParseObject(JsonNode& node) {
    if (!Expect('{')) {
      return false;
    }

    for (;;) {
      if (PeekIs('}')) {
        Expect('}');
        return true;
      }

      const std::string key = ParseString();
      if (!Expect(':')) {
        return false;
      }

      if (key == "Children") {
        if (!ParseChildren(node)) {
          return false;
        }
      } else if (PeekIs('"')) {
        const std::string value = ParseString();
        if (key == "Text") {
          node.text = value;
        } else if (key == "Value") {
          node.value = value;
        } else if (key == "HardwareId") {
          node.hardwareId = value;
        }
      } else if (PeekIs('{')) {
        JsonNode ignored;
        if (!ParseObject(ignored)) {
          return false;
        }
      } else if (PeekIs('[')) {
        JsonNode ignored;
        if (!ParseChildren(ignored)) {
          return false;
        }
      } else {
        SkipScalar();
      }

      if (PeekIs(',')) {
        Expect(',');
      }
    }
  }
};

bool ParseNumeric(const std::string& raw, double& out) {
  std::string cleaned;
  cleaned.reserve(raw.size());

  for (char c : raw) {
    if ((c >= '0' && c <= '9') || c == '-') {
      cleaned.push_back(c);
    } else if (c == '.' || c == ',') {
      cleaned.push_back('.');
    } else if (c == ' ' && !cleaned.empty()) {
      break;
    }
  }

  if (cleaned.empty()) {
    return false;
  }

  char* end = nullptr;
  const double value = std::strtod(cleaned.c_str(), &end);
  if (end == cleaned.c_str()) {
    return false;
  }

  out = value;
  return true;
}

const char* Categorize(const std::string& units) {
  // LibreHardwareMonitor formats temperatures as "65,0 C" — the degree sign is
  // dropped, so the bare "C" suffix is what identifies them. A lone "C" is
  // unambiguous here because no other sensor type ends with that letter.
  if (units == "C" || units.find("\xC2\xB0" "C") != std::string::npos) {
    return "temperature";
  }
  if (units.find('%') != std::string::npos) {
    return "load";
  }
  if (units.find("RPM") != std::string::npos) {
    return "fan";
  }
  if (units.find('W') != std::string::npos) {
    return "power";
  }
  if (units.find("MHz") != std::string::npos || units.find("GHz") != std::string::npos) {
    return "clock";
  }
  if (units.find("GB") != std::string::npos || units.find("MB") != std::string::npos) {
    return "memory";
  }
  if (units.find('V') != std::string::npos) {
    return "voltage";
  }
  return "other";
}

std::string ExtractUnits(const std::string& raw) {
  const size_t lastSpace = raw.rfind(' ');
  if (lastSpace == std::string::npos) {
    return std::string();
  }
  return raw.substr(lastSpace + 1);
}

void Walk(const JsonNode& node, const std::string& hardware, const std::string& group, SensorSnapshot& out) {
  std::string nextHardware = hardware;
  std::string nextGroup = group;

  if (!node.hardwareId.empty()) {
    nextHardware = node.text;
    nextGroup.clear();
  } else if (!node.value.empty() && node.children.empty()) {
    double numeric = 0.0;
    if (ParseNumeric(node.value, numeric)) {
      const std::string units = ExtractUnits(node.value);

      SensorReading reading;
      reading.identifier = hardware + "/" + node.text;
      reading.hardware = hardware;
      reading.group = group;
      reading.name = node.text;
      reading.displayValue = node.value;
      reading.value = numeric;
      reading.category = Categorize(units);
      out.readings.push_back(std::move(reading));
    }
    return;
  } else if (!node.value.empty()) {
    nextGroup = node.text;
  }

  for (const JsonNode& child : node.children) {
    Walk(child, nextHardware, nextGroup, out);
  }
}

}  // namespace

bool InitSensors() {
  std::lock_guard<std::mutex> lock(g_mutex);

  if (g_available) {
    return true;
  }

  g_lastError.clear();
  g_processFound = IsProviderRunning();

  // The process check is only a hint: a non-elevated caller may not see the
  // process even while its listener answers, so the HTTP probe always runs.
  std::string lastError;
  for (const std::string& baseUrl : CandidateBaseUrls()) {
    std::string error;
    const std::string body = HttpGet(baseUrl, kDataPath, error);

    if (!body.empty()) {
      g_baseUrl = baseUrl;
      g_available = true;
      g_lastError.clear();
      return true;
    }

    lastError = error.empty() ? ("no response from " + baseUrl) : (error + " @ " + baseUrl);
  }

  g_lastError = g_processFound ? lastError : ("process not visible; " + lastError);
  g_available = false;
  return false;
}

bool IsSensorProviderAvailable() {
  std::lock_guard<std::mutex> lock(g_mutex);
  return g_available;
}

bool RefreshSensorProvider() {
  {
    std::lock_guard<std::mutex> lock(g_mutex);
    g_available = false;
    g_baseUrl.clear();
  }

  return InitSensors();
}

void ShutdownSensors() {
  std::lock_guard<std::mutex> lock(g_mutex);
  g_available = false;
  g_baseUrl.clear();
}

std::string GetSensorDiagnostics() {
  std::lock_guard<std::mutex> lock(g_mutex);

  std::string report = "process=";
  report += g_processFound ? "yes" : "no";
  report += " configs=" + std::to_string(g_configsFound);
  report += " baseUrl=" + (g_baseUrl.empty() ? "<none>" : g_baseUrl);
  report += " available=" + std::string(g_available ? "yes" : "no");
  if (!g_lastError.empty()) {
    report += " error=" + g_lastError;
  }
  return report;
}

bool ReadSensors(SensorSnapshot& out) {
  out.readings.clear();
  out.provider = "none";

  std::string baseUrl;
  {
    std::lock_guard<std::mutex> lock(g_mutex);
    if (!g_available) {
      return false;
    }
    baseUrl = g_baseUrl;
  }

  std::string error;
  const std::string body = HttpGet(baseUrl, kDataPath, error);
  if (body.empty()) {
    return false;
  }

  JsonNode root;
  JsonReader reader(body);
  if (!reader.Parse(root)) {
    return false;
  }

  out.provider = "LibreHardwareMonitor";
  Walk(root, std::string(), std::string(), out);

  return !out.readings.empty();
}

}  // namespace monitor
