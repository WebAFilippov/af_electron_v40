{
  "targets": [
    {
      "target_name": "system_monitor",
      "sources": [
        "src/addon.cc",
        "src/cpu.cc",
        "src/memory.cc",
        "src/disk.cc",
        "src/network.cc",
        "src/gpu.cc",
        "src/sensors.cc",
        "src/system.cc",
        "src/processes.cc",
        "src/connections.cc"
      ],
      "include_dirs": [
        "<!@(node -p \"require('path').resolve(require.resolve('node-addon-api/package.json'), '..').replace(/\\\\/g, '/')\")"
      ],
      "defines": [
        "NAPI_VERSION=8",
        "NODE_ADDON_API_DISABLE_DEPRECATED",
        "WIN32_LEAN_AND_MEAN",
        "NOMINMAX",
        "_WIN32_WINNT=0x0A00",
        "WINVER=0x0A00",
        "NTDDI_VERSION=0x0A000006"
      ],
      "libraries": [
        "-lpdh",
        "-lwbemuuid",
        "-lole32",
        "-loleaut32",
        "-ladvapi32",
        "-luser32",
        "-lversion",
        "-liphlpapi",
        "-ldxgi",
        "-ldxguid",
        "-lSetupapi",
        "-lpsapi",
        "-lws2_32"
      ],
      "cflags!": ["-fno-exceptions"],
      "cflags_cc!": ["-fno-exceptions"],
      "conditions": [
        [
          "OS==\"win\"",
          {
            "msvs_settings": {
              "VCCLCompilerTool": {
                "ExceptionHandling": 1,
                "AdditionalOptions": ["/std:c++20", "/permissive-"],
                "Optimization": 2,
                "RuntimeLibrary": 0
              }
            }
          }
        ]
      ]
    }
  ]
}
