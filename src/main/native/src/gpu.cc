#include "gpu.h"

#include "common.h"

#include <utility>

#include <dxgi1_6.h>
#include <wrl/client.h>

#include <vector>

using Microsoft::WRL::ComPtr;

namespace monitor {

namespace {

std::string VendorFromId(UINT vendorId) {
  switch (vendorId) {
    case 0x10DE:
      return "NVIDIA";
    case 0x1002:
    case 0x1022:
      return "AMD";
    case 0x8086:
      return "Intel";
    case 0x1AE0:
      return "Google";
    case 0x5143:
      return "Qualcomm";
    default:
      return "Unknown";
  }
}

// DXGI stores the adapter description as a wide string; kept here so both the
// IDXGIFactory6 and the legacy IDXGIFactory1 path build it identically.
std::string AdapterName(const DXGI_ADAPTER_DESC1& desc) {
  return WideToUtf8(std::wstring(desc.Description));
}

}  // namespace

void ReadGpus(std::vector<GpuInfo>& out) {
  out.clear();

  ComPtr<IDXGIFactory6> factory;
  HRESULT hr = ::CreateDXGIFactory1(__uuidof(IDXGIFactory6), reinterpret_cast<void**>(factory.GetAddressOf()));

  // IDXGIFactory6 exists on Windows 10 1803+; fall back for older systems.
  if (FAILED(hr)) {
    ComPtr<IDXGIFactory1> legacy;
    hr = ::CreateDXGIFactory1(__uuidof(IDXGIFactory1), reinterpret_cast<void**>(legacy.GetAddressOf()));
    if (FAILED(hr)) {
      return;
    }

    for (UINT index = 0;; ++index) {
      ComPtr<IDXGIAdapter1> adapter;
      if (legacy->EnumAdapters1(index, adapter.GetAddressOf()) == DXGI_ERROR_NOT_FOUND) {
        break;
      }

      DXGI_ADAPTER_DESC1 desc = {};
      if (FAILED(adapter->GetDesc1(&desc))) {
        continue;
      }

      GpuInfo info;
      info.name = AdapterName(desc);
      info.vendor = VendorFromId(desc.VendorId);
      info.vendorId = desc.VendorId;
      info.deviceId = desc.DeviceId;
      info.dedicatedVramBytes = desc.DedicatedVideoMemory;
      info.dedicatedSystemMemoryBytes = desc.DedicatedSystemMemory;
      info.sharedSystemMemoryBytes = desc.SharedSystemMemory;
      info.isSoftware = (desc.Flags & DXGI_ADAPTER_FLAG_SOFTWARE) != 0;
      info.luid = (static_cast<uint64_t>(desc.AdapterLuid.HighPart) << 32) | desc.AdapterLuid.LowPart;

      out.push_back(std::move(info));
    }
    return;
  }

  // Prefer the high-performance adapter ordering so the discrete GPU is first.
  for (UINT index = 0;; ++index) {
    ComPtr<IDXGIAdapter1> adapter;
    if (factory->EnumAdapterByGpuPreference(index, DXGI_GPU_PREFERENCE_HIGH_PERFORMANCE, __uuidof(IDXGIAdapter1),
                                            reinterpret_cast<void**>(adapter.GetAddressOf())) == DXGI_ERROR_NOT_FOUND) {
      break;
    }

    DXGI_ADAPTER_DESC1 desc = {};
    if (FAILED(adapter->GetDesc1(&desc))) {
      continue;
    }

    // Skip the Microsoft Basic Render Driver: it reports as an adapter but is a
    // CPU software rasterizer and only confuses the dashboard.
    if ((desc.Flags & DXGI_ADAPTER_FLAG_SOFTWARE) != 0) {
      continue;
    }

    GpuInfo info;
    info.name = WideToUtf8(std::wstring(desc.Description));
    info.vendor = VendorFromId(desc.VendorId);
    info.vendorId = desc.VendorId;
    info.deviceId = desc.DeviceId;
    info.dedicatedVramBytes = desc.DedicatedVideoMemory;
    info.dedicatedSystemMemoryBytes = desc.DedicatedSystemMemory;
    info.sharedSystemMemoryBytes = desc.SharedSystemMemory;
    info.isSoftware = false;
    info.luid = (static_cast<uint64_t>(desc.AdapterLuid.HighPart) << 32) | desc.AdapterLuid.LowPart;

    // Refresh rate and resolution from the attached output, if any.
    ComPtr<IDXGIOutput> output;
    if (SUCCEEDED(adapter->EnumOutputs(0, output.GetAddressOf())) && output) {
      DXGI_OUTPUT_DESC outputDesc = {};
      if (SUCCEEDED(output->GetDesc(&outputDesc))) {
        info.displayWidth = static_cast<uint32_t>(outputDesc.DesktopCoordinates.right - outputDesc.DesktopCoordinates.left);
        info.displayHeight = static_cast<uint32_t>(outputDesc.DesktopCoordinates.bottom - outputDesc.DesktopCoordinates.top);

        DEVMODEW mode = {};
        mode.dmSize = sizeof(mode);
        if (::EnumDisplaySettingsW(outputDesc.DeviceName, ENUM_CURRENT_SETTINGS, &mode)) {
          info.refreshRateHz = mode.dmDisplayFrequency;
        }
      }
    }

    out.push_back(std::move(info));
  }
}

}  // namespace monitor
