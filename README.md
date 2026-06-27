# iPhone Mirror

Electron wrapper for UxPlay AirPlay mirroring on Windows.

## What is included

- Electron control UI (`electron-app/`)
- Patched launcher logic to prefer the real LAN adapter over Hyper-V/vEthernet
- Device-frame presentation UI (iPhone/iPad-style rounded frame)
- Prebuilt `uxplay.exe` under `uxplay-src/build/` for the Electron portable build

## Development

```powershell
cd electron-app
npm install
npm start
```

## Build portable EXE

```powershell
cd electron-app
npm run build
```

The portable output is `electron-app/dist/iPhoneMirror.exe`.

## Notes

- PC and iPhone must be on the same LAN/Wi-Fi.
- Bonjour service must be running.
- Windows firewall must allow `uxplay.exe`.
- GStreamer/MSYS2 runtime is expected at `C:\tools\msys64\ucrt64\bin` on the target machine.
