# Bluetooth HID Control for iPhone Mirror

This is the new control path. It does **not** replace or overwrite the old Desktop `iPhoneMirror.exe`.

## Architecture

```text
Windows iPhone Mirror app
  -> USB Serial JSONL @ 115200
  -> ESP32 firmware
  -> Bluetooth HID keyboard/mouse
  -> iPhone
```

Why this path:

- Windows apps are not reliable Bluetooth HID peripherals by default.
- ESP32 can act as a BLE keyboard/mouse cheaply and predictably.
- The PC app stays Electron/Windows; the hard Bluetooth role is isolated in firmware.

## Files

- App UI/control bridge: `electron-app/main.js`, `preload.js`, `index.html`
- Firmware: `firmware/esp32-hid-bridge/esp32-hid-bridge.ino`
- New build output target: `electron-app/dist/**/iPhoneMirror-HID-Control.exe`

## Arduino setup

1. Install Arduino IDE.
2. Add/install ESP32 board support.
3. Install libraries:
   - `ESP32 BLE Keyboard` by T-vK
   - `ESP32 BLE Mouse` by T-vK
   - `ArduinoJson` by Benoit Blanchon
4. Open `firmware/esp32-hid-bridge/esp32-hid-bridge.ino`.
5. Select board `ESP32 Dev Module`.
6. Upload.

## Pair with iPhone

1. After flashing, keep ESP32 plugged into the PC.
2. On iPhone: Settings -> Bluetooth.
3. Pair devices named:
   - `iPhone Mirror HID`
   - `iPhone Mirror Mouse`
4. If mouse/pointer does not show, enable relevant iOS pointer/AssistiveTouch settings:
   - Settings -> Accessibility -> Touch -> AssistiveTouch
   - Settings -> Accessibility -> Pointer Control

## Use in the app

1. Open the new iPhone Mirror HID build.
2. In `Bluetooth HID Control`, click `Quet`.
3. Select the ESP32 COM port.
4. Click `Ket noi`.
5. Try:
   - `Gui text`
   - Enter/Backspace/Tab
   - Trackpad drag/click
   - Scroll down

## Serial protocol

The app sends one JSON object per line:

```json
{"type":"text","text":"hello"}
{"type":"key","key":"ENTER"}
{"type":"mouse","action":"move","dx":8,"dy":4}
{"type":"mouse","action":"click"}
{"type":"mouse","action":"scroll","wheel":-3}
```

## Current limitations

- This is HID input, not full system-level touch injection.
- iOS decides what keyboard/mouse shortcuts are accepted.
- End-to-end test requires a real ESP32 board and an iPhone.
- If the keyboard and mouse BLE libraries conflict on a specific board/core version, switch firmware to a composite HID library or run keyboard-only first.
