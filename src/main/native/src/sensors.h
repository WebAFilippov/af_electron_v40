#pragma once

#include <string>
#include <vector>

namespace monitor {

/**
 * One reading from LibreHardwareMonitor.
 *
 * Values arrive pre-formatted (locale-specific decimal separator plus a unit
 * suffix), so both the parsed number and the original string are kept: the number
 * drives charts and thresholds, the string is what a user recognises.
 */
struct SensorReading {
  std::string identifier;
  std::string name;
  /** "temperature" | "load" | "fan" | "power" | "clock" | "voltage" | "memory" | "other". */
  std::string category;
  /** Parent hardware name, e.g. "AMD Ryzen 5 5600G with Radeon Graphics". */
  std::string hardware;
  /** Group inside the hardware, e.g. "Temperatures" or "Fans". */
  std::string group;
  /** Numeric value: °C, %, RPM, W, MHz or V depending on `category`. */
  double value = 0.0;
  /** Original formatted string, e.g. "62,0 °C". */
  std::string displayValue;
};

struct SensorSnapshot {
  std::string provider;
  std::vector<SensorReading> readings;
};

// Probes for a reachable LibreHardwareMonitor web server. Safe to call repeatedly.
bool InitSensors();
void ShutdownSensors();

// True when sensor readings can be fetched right now.
bool IsSensorProviderAvailable();

/**
 * Discards the cached probe result and looks for the provider again. Needed
 * because LibreHardwareMonitor may be installed or started after the app is
 * already running.
 */
bool RefreshSensorProvider();

bool ReadSensors(SensorSnapshot& out);

/**
 * Human-readable report of the last probe: whether the process was seen, how
 * many config files were found, which URL was used and what failed. Lets the UI
 * explain a failure instead of silently showing nothing.
 */
std::string GetSensorDiagnostics();

}  // namespace monitor
