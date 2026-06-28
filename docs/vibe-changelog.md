# Vibe Changelog — iPhone Mirror

## 2026-06-27 22:09
- Ghi lại yêu cầu đúng: màn hình iPhone phải nằm trong khung preview iPhone/iPad của Electron app, không phải popup ngoài.
- Kiểm tra hiện trạng: project có electron-app/main.js, index.html, preload.js, window-embedder.ps1; README đã mô tả bản sửa nhúng cửa sổ mirror.
- Tạo safety snapshot trong snapshots/ trước khi tiếp tục chỉnh/sửa.
- Trạng thái kỹ thuật hiện tại: app đang dùng fallback nhúng native window bằng Win32 SetParent; cần verify lại build/smoke và test thật bằng iPhone.

## 2026-06-27 22:11
- Sửa UI để không bật full-screen waiting overlay khi AirPlay đang chạy; preview iPhone/iPad trong app luôn là sân khấu chính, trạng thái chờ/đã nhúng nằm ở pill trong khung thiết bị.


## 2026-06-27 22:12
- Verify OK: node syntax check main/preload passed; electron-builder folder build passed at electron-app/dist-inapp-verify/win-unpacked/iPhone Mirror.exe.
- Thêm checklist test thật bằng iPhone tại docs/test-iphone-airplay.md.
## 2026-06-28 07:49
- Added new Bluetooth HID Control build path without overwriting the old Desktop iPhoneMirror.exe.
- Added Electron SerialPort bridge + UI controls for ESP32 COM connect, text, key, mouse move/click, and scroll commands.
- Added ESP32 BLE HID bridge firmware at firmware/esp32-hid-bridge/esp32-hid-bridge.ino.
- Added setup/test guide at docs/bluetooth-hid-control.md.
- Built new portable EXE: electron-app/dist-hid-control/iPhoneMirror-HID-Control.exe and copied to Desktop as iPhoneMirror-HID-Control.exe.
- Old Desktop iPhoneMirror.exe was not overwritten.

