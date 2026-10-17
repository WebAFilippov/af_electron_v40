#include "disk.h"

#include "common.h"

#include <utility>

#include <winioctl.h>

#include <vector>

namespace monitor {

namespace {

constexpr DWORD kMaxDrives = 32;

std::string DriveTypeName(UINT type) {
  switch (type) {
    case DRIVE_FIXED:
      return "fixed";
    case DRIVE_REMOVABLE:
      return "removable";
    case DRIVE_REMOTE:
      return "network";
    case DRIVE_CDROM:
      return "cdrom";
    case DRIVE_RAMDISK:
      return "ramdisk";
    default:
      return "unknown";
  }
}

std::string FileSystemName(const WCHAR* rootPath) {
  WCHAR fsName[MAX_PATH + 1] = {};
  if (::GetVolumeInformationW(rootPath, nullptr, 0, nullptr, nullptr, nullptr, fsName, MAX_PATH)) {
    return WideToUtf8(fsName);
  }
  return std::string();
}

std::string VolumeLabel(const WCHAR* rootPath) {
  WCHAR label[MAX_PATH + 1] = {};
  if (::GetVolumeInformationW(rootPath, label, MAX_PATH, nullptr, nullptr, nullptr, nullptr, 0)) {
    return WideToUtf8(Trim(std::wstring(label)));
  }
  return std::string();
}

// NVMe/SSD detection: `BusType` is the reliable signal, and it needs no admin
// rights on Windows 10+ вЂ” unlike the old `MSFT_PhysicalDisk` WMI class.
std::string BusTypeName(STORAGE_BUS_TYPE type) {
  switch (type) {
    case BusTypeScsi:
      return "SCSI";
    case BusTypeAtapi:
      return "ATA";
    case BusTypeAta:
      return "SATA";
    case BusType1394:
      return "1394";
    case BusTypeSsa:
      return "SSA";
    case BusTypeFibre:
      return "Fibre";
    case BusTypeUsb:
      return "USB";
    case BusTypeRAID:
      return "RAID";
    case BusTypeiScsi:
      return "iSCSI";
    case BusTypeSas:
      return "SAS";
    case BusTypeSata:
      return "SATA";
    case BusTypeSd:
      return "SD";
    case BusTypeMmc:
      return "MMC";
    case BusTypeNvme:
      return "NVMe";
    default:
      return "Unknown";
  }
}

}  // namespace

void ReadVolumes(std::vector<VolumeInfo>& out) {
  out.clear();

  const DWORD mask = ::GetLogicalDrives();
  if (mask == 0) {
    return;
  }

  WCHAR driveBuffer[MAX_PATH + 1] = {};
  const DWORD length = ::GetLogicalDriveStringsW(MAX_PATH, driveBuffer);
  if (length == 0 || length > MAX_PATH) {
    return;
  }

  for (const WCHAR* drive = driveBuffer; *drive != L'\0'; drive += ::wcslen(drive) + 1) {
    const UINT type = ::GetDriveTypeW(drive);

    // Skip optical/network/unknown drives: reporting them produces rows full of
    // zeros that confuse the dashboard.
    if (type != DRIVE_FIXED && type != DRIVE_REMOVABLE) {
      continue;
    }

    ULARGE_INTEGER freeBytesAvailable = {};
    ULARGE_INTEGER totalBytes = {};
    ULARGE_INTEGER totalFreeBytes = {};
    if (!::GetDiskFreeSpaceExW(drive, &freeBytesAvailable, &totalBytes, &totalFreeBytes)) {
      continue;
    }

    VolumeInfo info;
    info.mountPoint = WideToUtf8(std::wstring(drive, 2));  // "C:" without the backslash
    info.label = VolumeLabel(drive);
    info.fileSystem = FileSystemName(drive);
    info.driveType = DriveTypeName(type);

    info.totalBytes = totalBytes.QuadPart;
    info.freeBytes = totalFreeBytes.QuadPart;
    info.usedBytes = info.totalBytes - info.freeBytes;
    info.usagePercent = info.totalBytes > 0 ? (static_cast<double>(info.usedBytes) / static_cast<double>(info.totalBytes)) * 100.0 : 0.0;

    out.push_back(std::move(info));
  }
}

void ReadPhysicalDisks(std::vector<PhysicalDiskInfo>& out) {
  out.clear();

  for (DWORD index = 0; index < kMaxDrives; ++index) {
    WCHAR path[64];
    ::swprintf_s(path, L"\\\\.\\PhysicalDrive%u", index);

    // Query only: opening with read access would require elevation.
    HANDLE handle = ::CreateFileW(path, 0, FILE_SHARE_READ | FILE_SHARE_WRITE, nullptr, OPEN_EXISTING, 0, nullptr);
    if (handle == INVALID_HANDLE_VALUE) {
      continue;
    }

    PhysicalDiskInfo info;
    info.device = WideToUtf8(path);

    STORAGE_PROPERTY_QUERY query = {};
    query.PropertyId = StorageDeviceProperty;
    query.QueryType = PropertyStandardQuery;

    std::vector<BYTE> buffer(1024);
    DWORD returned = 0;
    if (::DeviceIoControl(handle, IOCTL_STORAGE_QUERY_PROPERTY, &query, sizeof(query), buffer.data(),
                          static_cast<DWORD>(buffer.size()), &returned, nullptr)) {
      auto* descriptor = reinterpret_cast<STORAGE_DEVICE_DESCRIPTOR*>(buffer.data());

      // The three string fields are ANSI and NUL-terminated at the given offset.
      auto readAnsiAt = [&buffer](DWORD offset) -> std::string {
        if (offset == 0 || offset >= buffer.size()) {
          return std::string();
        }
        const char* raw = reinterpret_cast<const char*>(buffer.data() + offset);
        return std::string(raw);
      };

      info.vendor = readAnsiAt(descriptor->VendorIdOffset);
      info.model = readAnsiAt(descriptor->ProductIdOffset);
      info.serial = readAnsiAt(descriptor->SerialNumberOffset);
      info.busType = BusTypeName(descriptor->BusType);
    }

    // Size and sector size. `IOCTL_DISK_GET_LENGTH_INFO` requires read access,
    // which a query-only handle does not have, so the geometry-ex variant is
    // used instead: it works on a zero-access handle and reports the full size.
    DISK_GEOMETRY_EX geometryEx = {};
    if (::DeviceIoControl(handle, IOCTL_DISK_GET_DRIVE_GEOMETRY_EX, nullptr, 0, &geometryEx, sizeof(geometryEx),
                          &returned, nullptr)) {
      info.sizeBytes = static_cast<uint64_t>(geometryEx.DiskSize.QuadPart);
      info.bytesPerSector = geometryEx.Geometry.BytesPerSector;
      info.isRemovable = geometryEx.Geometry.MediaType == RemovableMedia;
    } else {
      DISK_GEOMETRY geometry = {};
      if (::DeviceIoControl(handle, IOCTL_DISK_GET_DRIVE_GEOMETRY, nullptr, 0, &geometry, sizeof(geometry), &returned,
                            nullptr)) {
        info.bytesPerSector = geometry.BytesPerSector;
        info.isRemovable = geometry.MediaType == RemovableMedia;
        info.sizeBytes = static_cast<uint64_t>(geometry.Cylinders.QuadPart) * geometry.TracksPerCylinder *
                         geometry.SectorsPerTrack * geometry.BytesPerSector;
      }
    }

    // Health status via SMART predict-failure flag (works without elevation).
    STORAGE_PREDICT_FAILURE failure = {};
    if (::DeviceIoControl(handle, IOCTL_STORAGE_PREDICT_FAILURE, nullptr, 0, &failure, sizeof(failure), &returned,
                          nullptr)) {
      info.healthy = failure.PredictFailure == 0;
      info.hasHealthData = true;
    }

    ::CloseHandle(handle);
    out.push_back(std::move(info));
  }
}

}  // namespace monitor
