#pragma once

#include <cstdint>
#include <string>
#include <vector>

// GroupProcesses takes the list the caller already read.
#include "processes.h"

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

/**
 * Battery state, read through `GetSystemPowerStatus`.
 *
 * A desktop has no battery and reports `hasBattery == false`; a laptop may report
 * `percent` as 255 while the battery is being probed, which is also surfaced as
 * "no battery" rather than as a bogus 255%.
 */
struct BatteryInfo {
  bool hasBattery = false;
  /** Charge level in percent, 0-100. */
  int percent = 0;
  /** True while the battery is charging. */
  bool charging = false;
  /** True when AC power is connected. */
  bool acConnected = false;
  /** Seconds of runtime left, -1 when unknown or charging. */
  int secondsRemaining = -1;
  /** Human-readable state: "charging", "discharging", "full", "unknown". */
  std::string state;
};

/** A process aggregated by display name, so a browser's many children count once. */
struct ProcessGroupInfo {
  std::string name;
  std::string imageName;
  double cpuPercent = 0.0;
  uint64_t workingSet = 0;
  uint32_t processCount = 0;
};

bool ReadSystemInfo(SystemInfo& out);

bool ReadBatteryInfo(BatteryInfo& out);

/**
 * Aggregates an already-collected process list by display name.
 *
 * The caller passes the list it just read. This deliberately does not enumerate
 * processes itself: per-process CPU is a delta between two samples, so a second
 * enumeration in the same tick would compare against a sample taken microseconds
 * earlier and report zero for every process.
 *
 * A single browser or Electron app can own a dozen processes, so an ungrouped
 * "top process" ranking is dominated by duplicates; grouping by name makes the
 * number meaningful, both in the UI and in the payload sent to a display device.
 *
 * Returns at most `limit` groups, sorted by CPU usage descending.
 */
void GroupProcesses(const std::vector<ProcessInfo>& processes, std::vector<ProcessGroupInfo>& out, size_t limit);

}  // namespace monitor
