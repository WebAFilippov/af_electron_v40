#pragma once

#include <cstdint>
#include <string>
#include <vector>

namespace monitor {

struct ProcessInfo {
  uint32_t pid = 0;
  uint32_t parentPid = 0;
  uint32_t threadCount = 0;

  std::string name;
  std::string path;
  /** Version-resource description, e.g. "Google Chrome". */
  std::string description;
  /** Version-resource company, e.g. "Google LLC". */
  std::string company;

  uint64_t workingSetBytes = 0;
  uint64_t privateBytes = 0;

  /** Cumulative CPU time since process start. */
  uint64_t totalCpuTimeMs = 0;
  uint64_t kernelTimeMs = 0;
  uint64_t userTimeMs = 0;

  /** CPU utilisation over the interval since the previous sample, in percent. */
  double cpuPercent = 0.0;

  /** Milliseconds since the Unix epoch; 0 when unknown. */
  uint64_t startTimeMs = 0;

  /** False for processes owned by other users or otherwise unreadable. */
  bool isAccessible = false;
  bool isElevated = false;
  /** System-critical process that must never be terminated. */
  bool isProtected = false;
  /** Whether the UI may offer to terminate this process. */
  bool canTerminate = false;
};

enum class TerminateResult {
  Success,
  /** The process is system-critical and is deliberately never terminated. */
  Protected,
  /** Refused: the caller asked to terminate the monitoring app itself. */
  Self,
  /** Windows refused because the process belongs to another user or is elevated. */
  AccessDenied,
  NotFound,
  Failed
};

/** Fills `out` with every running process. Returns the number of entries. */
uint32_t ReadProcesses(std::vector<ProcessInfo>& out);

/** Terminates a process after re-checking the protection list. */
TerminateResult TerminateProcessById(uint32_t pid, uint32_t& errorCode);

/** Drops the CPU deltas; call when monitoring restarts. */
void ResetProcessCpuHistory();

}  // namespace monitor
