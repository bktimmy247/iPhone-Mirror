# Test checklist — iPhone AirPlay in Electron preview

## Build/smoke verified

- `node --check main.js` ✅
- `node --check preload.js` ✅
- `npx electron-builder --win dir --config.directories.output=dist-inapp-verify` ✅
- Verified output app folder:
  - `electron-app/dist-inapp-verify/win-unpacked/iPhone Mirror.exe`

## Manual test with iPhone

1. Open:

   ```text
   C:\Users\Admin\.openclaw\workspace-main\projects\iphone-mirror\electron-app\dist-inapp-verify\win-unpacked\iPhone Mirror.exe
   ```

2. Click **▶️ Khởi động AirPlay**.
3. On iPhone: Control Center → Screen Mirroring/AirPlay → choose **iPhone Mirror**.
4. Expected app behavior:
   - The main app remains visible; no full-screen waiting overlay covers the stage.
   - The iPhone/iPad device frame is the main preview area.
   - Before iPhone connects, pill says roughly: `Đang chờ cửa sổ mirror của iPhone...`.
   - After connection, pill says: `Đã gắn màn hình iPhone vào trong app`.
   - The GStreamer/UxPlay video surface appears inside the device frame or is snapped to that area.
5. Resize/move app and switch iPhone/iPad frame:
   - Mirror window should stay aligned because renderer sends `#mirrorHost` bounds to main process.

## If it still opens as an external popup

Collect these two things before next fix:

1. Screenshot of the app while iPhone is connected.
2. Latest log lines from the app log box, especially whether `window-embedder.ps1` says waiting or embedded.

Likely next fixes:

- Expand `window-embedder.ps1` matching rules for the actual GStreamer window class/title on anh's machine.
- Add snap-only fallback if `SetParent` fails but the mirror HWND is found.
- Move from native window reparenting to true GStreamer frame bridge (`appsink`/MJPEG/WebSocket) if the driver refuses child-window embedding.
