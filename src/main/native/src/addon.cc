#include <napi.h>

#include <windows.h>

#include "connections.h"
#include "cpu.h"
#include "disk.h"
#include "gpu.h"
#include "memory.h"
#include "network.h"
#include "processes.h"
#include "system.h"

namespace {

using namespace monitor;

Napi::Value ToBigIntOrNumber(Napi::Env env, uint64_t value) {
  // Byte counters exceed Number.MAX_SAFE_INTEGER once a machine has transferred
  // more than ~9 PB, which is unrealistic on Windows, so Number is safe and far
  // cheaper to marshal than BigInt.
  return Napi::Number::New(env, static_cast<double>(value));
}

Napi::Object BuildCpu(Napi::Env env) {
  Napi::Object cpu = Napi::Object::New(env);
  cpu.Set("name", Napi::String::New(env, GetCpuName()));
  cpu.Set("physicalCores", Napi::Number::New(env, static_cast<double>(GetPhysicalCoreCount())));
  cpu.Set("logicalCores", Napi::Number::New(env, static_cast<double>(::GetActiveProcessorCount(ALL_PROCESSOR_GROUPS))));
  cpu.Set("maxClockMhz", Napi::Number::New(env, GetMaxClockMhz()));
  cpu.Set("currentClockMhz", Napi::Number::New(env, GetCurrentClockMhz()));

  double total = 0.0;
  std::vector<double> perCore;
  if (ReadCpuLoad(total, perCore)) {
    cpu.Set("loadPercent", Napi::Number::New(env, total));

    Napi::Array cores = Napi::Array::New(env, perCore.size());
    for (size_t i = 0; i < perCore.size(); ++i) {
      cores.Set(static_cast<uint32_t>(i), Napi::Number::New(env, perCore[i]));
    }
    cpu.Set("coresLoad", cores);
  } else {
    cpu.Set("loadPercent", Napi::Number::New(env, 0.0));
    cpu.Set("coresLoad", Napi::Array::New(env, 0));
  }

  return cpu;
}

Napi::Object BuildMemory(Napi::Env env) {
  Napi::Object memory = Napi::Object::New(env);

  MemoryInfo info;
  if (!ReadMemory(info)) {
    memory.Set("available", Napi::Boolean::New(env, false));
    return memory;
  }

  memory.Set("available", Napi::Boolean::New(env, true));
  memory.Set("total", ToBigIntOrNumber(env, info.totalBytes));
  memory.Set("used", ToBigIntOrNumber(env, info.usedBytes));
  memory.Set("free", ToBigIntOrNumber(env, info.availableBytes));
  memory.Set("cached", ToBigIntOrNumber(env, info.cachedBytes));
  memory.Set("loadPercent", Napi::Number::New(env, info.loadPercent));
  memory.Set("commitTotal", ToBigIntOrNumber(env, info.commitTotalBytes));
  memory.Set("commitUsed", ToBigIntOrNumber(env, info.commitUsedBytes));

  return memory;
}

Napi::Array BuildVolumes(Napi::Env env) {
  std::vector<VolumeInfo> volumes;
  ReadVolumes(volumes);

  Napi::Array result = Napi::Array::New(env, volumes.size());
  for (size_t i = 0; i < volumes.size(); ++i) {
    const VolumeInfo& v = volumes[i];
    Napi::Object item = Napi::Object::New(env);

    item.Set("mountPoint", Napi::String::New(env, v.mountPoint));
    item.Set("label", Napi::String::New(env, v.label));
    item.Set("fileSystem", Napi::String::New(env, v.fileSystem));
    item.Set("driveType", Napi::String::New(env, v.driveType));
    item.Set("total", ToBigIntOrNumber(env, v.totalBytes));
    item.Set("used", ToBigIntOrNumber(env, v.usedBytes));
    item.Set("free", ToBigIntOrNumber(env, v.freeBytes));
    item.Set("usagePercent", Napi::Number::New(env, v.usagePercent));

    result.Set(static_cast<uint32_t>(i), item);
  }

  return result;
}

Napi::Array BuildPhysicalDisks(Napi::Env env) {
  std::vector<PhysicalDiskInfo> disks;
  ReadPhysicalDisks(disks);

  Napi::Array result = Napi::Array::New(env, disks.size());
  for (size_t i = 0; i < disks.size(); ++i) {
    const PhysicalDiskInfo& d = disks[i];
    Napi::Object item = Napi::Object::New(env);

    item.Set("device", Napi::String::New(env, d.device));
    item.Set("model", Napi::String::New(env, d.model));
    item.Set("vendor", Napi::String::New(env, d.vendor));
    item.Set("serial", Napi::String::New(env, d.serial));
    item.Set("busType", Napi::String::New(env, d.busType));
    item.Set("size", ToBigIntOrNumber(env, d.sizeBytes));
    item.Set("bytesPerSector", Napi::Number::New(env, d.bytesPerSector));
    item.Set("isRemovable", Napi::Boolean::New(env, d.isRemovable));
    item.Set("hasHealthData", Napi::Boolean::New(env, d.hasHealthData));
    item.Set("healthy", Napi::Boolean::New(env, d.healthy));

    result.Set(static_cast<uint32_t>(i), item);
  }

  return result;
}

Napi::Array BuildNetwork(Napi::Env env) {
  std::vector<NetworkAdapterInfo> adapters;
  ReadNetworkAdapters(adapters);

  Napi::Array result = Napi::Array::New(env, adapters.size());
  for (size_t i = 0; i < adapters.size(); ++i) {
    const NetworkAdapterInfo& a = adapters[i];
    Napi::Object item = Napi::Object::New(env);

    item.Set("ifIndex", Napi::Number::New(env, a.ifIndex));
    item.Set("name", Napi::String::New(env, a.name));
    item.Set("description", Napi::String::New(env, a.description));
    item.Set("type", Napi::String::New(env, a.type));
    item.Set("status", Napi::String::New(env, a.status));
    item.Set("mac", Napi::String::New(env, a.mac));
    item.Set("ip4", Napi::String::New(env, a.ip4));
    item.Set("ip6", Napi::String::New(env, a.ip6));
    item.Set("prefixLength", Napi::Number::New(env, a.prefixLength));
    item.Set("isUp", Napi::Boolean::New(env, a.isUp));
    item.Set("mtu", Napi::Number::New(env, a.mtu));
    item.Set("receiveBytes", ToBigIntOrNumber(env, a.receiveBytes));
    item.Set("transmitBytes", ToBigIntOrNumber(env, a.transmitBytes));
    item.Set("receiveBytesPerSec", Napi::Number::New(env, a.receiveBytesPerSec));
    item.Set("transmitBytesPerSec", Napi::Number::New(env, a.transmitBytesPerSec));
    item.Set("maxSpeedMbps", Napi::Number::New(env, a.maxSpeedMbps));

    result.Set(static_cast<uint32_t>(i), item);
  }

  return result;
}

Napi::Array BuildGpus(Napi::Env env) {
  std::vector<GpuInfo> gpus;
  ReadGpus(gpus);

  Napi::Array result = Napi::Array::New(env, gpus.size());
  for (size_t i = 0; i < gpus.size(); ++i) {
    const GpuInfo& g = gpus[i];
    Napi::Object item = Napi::Object::New(env);

    item.Set("name", Napi::String::New(env, g.name));
    item.Set("vendor", Napi::String::New(env, g.vendor));
    item.Set("vendorId", Napi::Number::New(env, g.vendorId));
    item.Set("deviceId", Napi::Number::New(env, g.deviceId));
    item.Set("luid", ToBigIntOrNumber(env, g.luid));
    item.Set("dedicatedVram", ToBigIntOrNumber(env, g.dedicatedVramBytes));
    item.Set("dedicatedSystemMemory", ToBigIntOrNumber(env, g.dedicatedSystemMemoryBytes));
    item.Set("sharedSystemMemory", ToBigIntOrNumber(env, g.sharedSystemMemoryBytes));
    item.Set("displayWidth", Napi::Number::New(env, g.displayWidth));
    item.Set("displayHeight", Napi::Number::New(env, g.displayHeight));
    item.Set("refreshRateHz", Napi::Number::New(env, g.refreshRateHz));

    result.Set(static_cast<uint32_t>(i), item);
  }

  return result;
}

/**
 * Sensor block placeholder.
 *
 * Readings now come from the separate .NET helper, which loads
 * LibreHardwareMonitorLib directly and therefore has driver access. The addon
 * keeps this field so the snapshot shape stays stable, but always reports it as
 * unavailable; the main process overlays the helper's data when it is running.
 *
 * The previous implementation scraped LibreHardwareMonitor's HTTP server, which
 * required installing and configuring that application вЂ” the reason this was
 * replaced.
 */
Napi::Object BuildSensors(Napi::Env env) {
  Napi::Object sensors = Napi::Object::New(env);

  sensors.Set("available", Napi::Boolean::New(env, false));
  sensors.Set("provider", Napi::String::New(env, "none"));
  sensors.Set("readings", Napi::Array::New(env, 0));
  sensors.Set("diagnostics", Napi::String::New(env, "provided by sensor helper"));

  return sensors;
}

Napi::Array BuildProcesses(Napi::Env env) {
  std::vector<ProcessInfo> processes;
  ReadProcesses(processes);

  Napi::Array result = Napi::Array::New(env, processes.size());
  for (size_t i = 0; i < processes.size(); ++i) {
    const ProcessInfo& p = processes[i];
    Napi::Object item = Napi::Object::New(env);

    item.Set("pid", Napi::Number::New(env, p.pid));
    item.Set("parentPid", Napi::Number::New(env, p.parentPid));
    item.Set("threadCount", Napi::Number::New(env, p.threadCount));

    item.Set("name", Napi::String::New(env, p.name));
    item.Set("path", Napi::String::New(env, p.path));
    item.Set("description", Napi::String::New(env, p.description));
    item.Set("company", Napi::String::New(env, p.company));

    item.Set("workingSet", ToBigIntOrNumber(env, p.workingSetBytes));
    item.Set("privateBytes", ToBigIntOrNumber(env, p.privateBytes));
    item.Set("totalCpuTimeMs", ToBigIntOrNumber(env, p.totalCpuTimeMs));
    item.Set("startTimeMs", ToBigIntOrNumber(env, p.startTimeMs));

    item.Set("cpuPercent", Napi::Number::New(env, p.cpuPercent));

    item.Set("isAccessible", Napi::Boolean::New(env, p.isAccessible));
    item.Set("isProtected", Napi::Boolean::New(env, p.isProtected));
    item.Set("canTerminate", Napi::Boolean::New(env, p.canTerminate));

    result.Set(static_cast<uint32_t>(i), item);
  }

  return result;
}

Napi::Array BuildConnections(Napi::Env env) {
  std::vector<ConnectionInfo> connections;
  ReadConnections(connections);

  Napi::Array result = Napi::Array::New(env, connections.size());
  for (size_t i = 0; i < connections.size(); ++i) {
    const ConnectionInfo& c = connections[i];
    Napi::Object item = Napi::Object::New(env);

    item.Set("protocol", Napi::String::New(env, c.protocol));
    item.Set("family", Napi::String::New(env, c.family));
    item.Set("localAddress", Napi::String::New(env, c.localAddress));
    item.Set("localPort", Napi::Number::New(env, c.localPort));
    item.Set("remoteAddress", Napi::String::New(env, c.remoteAddress));
    item.Set("remotePort", Napi::Number::New(env, c.remotePort));
    item.Set("state", Napi::String::New(env, c.state));
    item.Set("pid", Napi::Number::New(env, c.pid));

    result.Set(static_cast<uint32_t>(i), item);
  }

  return result;
}

Napi::Object BuildSystem(Napi::Env env) {
  Napi::Object system = Napi::Object::New(env);

  SystemInfo info;
  if (ReadSystemInfo(info)) {
    system.Set("hostname", Napi::String::New(env, info.hostname));
    system.Set("manufacturer", Napi::String::New(env, info.manufacturer));
    system.Set("model", Napi::String::New(env, info.model));
    system.Set("biosVersion", Napi::String::New(env, info.biosVersion));
    system.Set("biosDate", Napi::String::New(env, info.biosDate));
    system.Set("osName", Napi::String::New(env, info.osName));
    system.Set("osVersion", Napi::String::New(env, info.osVersion));
    system.Set("osBuild", Napi::String::New(env, info.osBuild));
    system.Set("architecture", Napi::String::New(env, info.architecture));
    system.Set("uptimeSeconds", Napi::Number::New(env, info.uptimeSeconds));
    system.Set("bootTimeMs", Napi::Number::New(env, info.bootTimeMs));
    system.Set("isAdmin", Napi::Boolean::New(env, info.isAdmin));
    system.Set("available", Napi::Boolean::New(env, true));
  } else {
    system.Set("available", Napi::Boolean::New(env, false));
  }

  return system;
}

// Single entry point: one native call returns every metric, which keeps the
// renderer polling loop cheap (no per-metric IPC round trips).
Napi::Value GetSnapshot(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  // Polling must never crash the main process; surface failures as `null` and
  // let the renderer keep the previous sample.
  try {
    Napi::Object snapshot = Napi::Object::New(env);
    snapshot.Set("timestamp", Napi::Number::New(env, static_cast<double>(::GetTickCount64())));
    snapshot.Set("cpu", BuildCpu(env));
    snapshot.Set("memory", BuildMemory(env));
    snapshot.Set("volumes", BuildVolumes(env));
    snapshot.Set("physicalDisks", BuildPhysicalDisks(env));
    snapshot.Set("network", BuildNetwork(env));
    snapshot.Set("gpus", BuildGpus(env));
    snapshot.Set("sensors", BuildSensors(env));
    snapshot.Set("system", BuildSystem(env));
    snapshot.Set("processes", BuildProcesses(env));
    snapshot.Set("connections", BuildConnections(env));
    return snapshot;
  } catch (...) {
    return env.Null();
  }
}

// Opening the PDH query ahead of the first poll removes a ~10ms spike from the
// first sample the UI requests.
Napi::Value Initialize(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  const bool cpuReady = InitCpuQuery();

  Napi::Object result = Napi::Object::New(env);
  result.Set("cpu", Napi::Boolean::New(env, cpuReady));
  // Sensors are owned by the .NET helper, so the addon never reports them ready.
  result.Set("sensors", Napi::Boolean::New(env, false));
  return result;
}

Napi::Value Shutdown(const Napi::CallbackInfo& info) {
  ShutdownCpuQuery();
  return info.Env().Undefined();
}

// Always false: the addon no longer reads sensors. Kept so the preload contract
// stays stable while the helper owns that data.
Napi::Value SensorsAvailable(const Napi::CallbackInfo& info) {
  return Napi::Boolean::New(info.Env(), false);
}

// No-op: the helper is re-read on every snapshot, so there is nothing to refresh
// here. Kept for contract stability.
Napi::Value RefreshSensors(const Napi::CallbackInfo& info) {
  return Napi::Boolean::New(info.Env(), false);
}

/**
 * Terminates a process by PID.
 *
 * The native side re-checks the protection list, so the renderer cannot bypass it
 * by sending an arbitrary PID. The result is a structured object rather than a
 * boolean so the UI can explain *why* a termination was refused.
 */
Napi::Value TerminateProcess(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1 || !info[0].IsNumber()) {
    Napi::TypeError::New(env, "expected a numeric pid").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  const uint32_t pid = info[0].As<Napi::Number>().Uint32Value();
  uint32_t errorCode = 0;
  const TerminateResult result = TerminateProcessById(pid, errorCode);

  const char* status = "failed";
  switch (result) {
    case TerminateResult::Success:
      status = "success";
      break;
    case TerminateResult::Protected:
      status = "protected";
      break;
    case TerminateResult::Self:
      status = "self";
      break;
    case TerminateResult::AccessDenied:
      status = "access-denied";
      break;
    case TerminateResult::NotFound:
      status = "not-found";
      break;
    case TerminateResult::Failed:
      status = "failed";
      break;
  }

  Napi::Object out = Napi::Object::New(env);
  out.Set("ok", Napi::Boolean::New(env, result == TerminateResult::Success));
  out.Set("status", Napi::String::New(env, status));
  out.Set("errorCode", Napi::Number::New(env, errorCode));
  return out;
}

// Clears the CPU deltas so a restarted monitoring session does not report
// percentages computed against a stale sample.
Napi::Value ResetProcesses(const Napi::CallbackInfo& info) {
  ResetProcessCpuHistory();
  return info.Env().Undefined();
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("getSnapshot", Napi::Function::New(env, GetSnapshot));
  exports.Set("initialize", Napi::Function::New(env, Initialize));
  exports.Set("shutdown", Napi::Function::New(env, Shutdown));
  exports.Set("sensorsAvailable", Napi::Function::New(env, SensorsAvailable));
  exports.Set("refreshSensors", Napi::Function::New(env, RefreshSensors));
  exports.Set("terminateProcess", Napi::Function::New(env, TerminateProcess));
  exports.Set("resetProcesses", Napi::Function::New(env, ResetProcesses));
  return exports;
}

}  // namespace

NODE_API_MODULE(system_monitor, Init)
