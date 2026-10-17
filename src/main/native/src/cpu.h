#pragma once

#include <cstdint>
#include <string>
#include <vector>

namespace monitor {

std::string GetCpuName();
uint32_t GetPhysicalCoreCount();
double GetMaxClockMhz();

// Live average core frequency across logical processors (0 when unavailable).
double GetCurrentClockMhz();

// Opens the PDH query once and primes it. Safe to call repeatedly.
bool InitCpuQuery();
void ShutdownCpuQuery();

// Reads aggregate and per-logical-processor load (0..100).
bool ReadCpuLoad(double& total, std::vector<double>& perCore);

}  // namespace monitor
