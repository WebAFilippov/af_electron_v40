#pragma once

// Shared helpers for the system monitor addon.
//
// The addon talks to Win32 in UTF-16 and hands N-API UTF-8 strings, so every
// Win32 string crossing the boundary goes through these two helpers.

#include <napi.h>

#include <windows.h>

#include <string>
#include <vector>

namespace monitor {

// UTF-16 (wide) -> UTF-8.
inline std::string WideToUtf8(const std::wstring& value) {
  if (value.empty()) {
    return std::string();
  }

  const int size = ::WideCharToMultiByte(CP_UTF8, 0, value.data(), static_cast<int>(value.size()), nullptr, 0, nullptr,
                                         nullptr);
  if (size <= 0) {
    return std::string();
  }

  std::string result(static_cast<size_t>(size), '\0');
  ::WideCharToMultiByte(CP_UTF8, 0, value.data(), static_cast<int>(value.size()), result.data(), size, nullptr, nullptr);
  return result;
}

// A fixed-size Win32 character buffer (e.g. `WCHAR name[128]`) -> UTF-8.
template <size_t N>
inline std::string WideToUtf8(const WCHAR (&buffer)[N]) {
  size_t length = 0;
  while (length < N && buffer[length] != L'\0') {
    ++length;
  }
  return WideToUtf8(std::wstring(buffer, length));
}

// Trims trailing spaces/NULs that some WMI and SetupAPI strings carry.
inline std::wstring Trim(std::wstring value) {
  while (!value.empty() && (value.back() == L' ' || value.back() == L'\0')) {
    value.pop_back();
  }
  return value;
}

}  // namespace monitor
