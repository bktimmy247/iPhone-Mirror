// iPhone Mirror HID Bridge
// Board: ESP32 Dev Module
// Serial: 115200
// Libraries (Arduino Library Manager):
//   - ESP32 BLE Keyboard by T-vK
//   - ESP32 BLE Mouse by T-vK
//   - ArduinoJson by Benoit Blanchon
//
// PC app sends one JSON object per line, for example:
//   {"type":"text","text":"hello"}
//   {"type":"key","key":"ENTER"}
//   {"type":"mouse","action":"move","dx":8,"dy":4}
//   {"type":"mouse","action":"click"}
//   {"type":"mouse","action":"scroll","wheel":-3}

#include <Arduino.h>
#include <ArduinoJson.h>
#include <BleKeyboard.h>
#include <BleMouse.h>

BleKeyboard bleKeyboard("iPhone Mirror HID", "Tom AI", 100);
BleMouse bleMouse("iPhone Mirror Mouse", "Tom AI", 100);

static String lineBuffer;

uint8_t keyFromName(const String& key) {
  if (key == "ENTER") return KEY_RETURN;
  if (key == "BACKSPACE") return KEY_BACKSPACE;
  if (key == "ESC") return KEY_ESC;
  if (key == "TAB") return KEY_TAB;
  if (key == "SPACE") return ' ';
  if (key == "HOME") return KEY_HOME;
  if (key == "UP") return KEY_UP_ARROW;
  if (key == "DOWN") return KEY_DOWN_ARROW;
  if (key == "LEFT") return KEY_LEFT_ARROW;
  if (key == "RIGHT") return KEY_RIGHT_ARROW;
  return 0;
}

void sendStatus(const char* status, const char* detail = "") {
  Serial.print("{\"status\":\"");
  Serial.print(status);
  Serial.print("\",\"detail\":\"");
  Serial.print(detail);
  Serial.println("\"}");
}

bool hidReady() {
  return bleKeyboard.isConnected() || bleMouse.isConnected();
}

void handleCommand(const String& line) {
  StaticJsonDocument<768> doc;
  DeserializationError error = deserializeJson(doc, line);
  if (error) {
    sendStatus("error", "bad_json");
    return;
  }

  const char* type = doc["type"] | "";
  if (!hidReady()) {
    sendStatus("waiting", "pair_iphone_first");
    return;
  }

  if (strcmp(type, "text") == 0) {
    const char* text = doc["text"] | "";
    bleKeyboard.print(text);
    sendStatus("ok", "text");
    return;
  }

  if (strcmp(type, "key") == 0) {
    String key = doc["key"] | "";
    uint8_t mapped = keyFromName(key);
    if (mapped == 0) {
      sendStatus("error", "unknown_key");
      return;
    }
    bleKeyboard.write(mapped);
    sendStatus("ok", "key");
    return;
  }

  if (strcmp(type, "mouse") == 0) {
    String action = doc["action"] | "";
    if (action == "move") {
      int dx = doc["dx"] | 0;
      int dy = doc["dy"] | 0;
      bleMouse.move(dx, dy, 0);
      sendStatus("ok", "move");
      return;
    }
    if (action == "click") {
      bleMouse.click(MOUSE_LEFT);
      sendStatus("ok", "click");
      return;
    }
    if (action == "scroll") {
      int wheel = doc["wheel"] | 0;
      bleMouse.move(0, 0, wheel);
      sendStatus("ok", "scroll");
      return;
    }
  }

  sendStatus("error", "unknown_command");
}

void setup() {
  Serial.begin(115200);
  delay(400);
  Serial.println("iPhone Mirror ESP32 HID Bridge booting...");
  bleKeyboard.begin();
  bleMouse.begin();
  sendStatus("ready", "pair_iPhone_Mirror_HID_in_iOS_Bluetooth");
}

void loop() {
  while (Serial.available()) {
    char c = (char)Serial.read();
    if (c == '\n') {
      lineBuffer.trim();
      if (lineBuffer.length() > 0) handleCommand(lineBuffer);
      lineBuffer = "";
    } else if (c != '\r') {
      lineBuffer += c;
      if (lineBuffer.length() > 700) lineBuffer = "";
    }
  }
}
