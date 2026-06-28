# Vibe Brief — iPhone Mirror

## App mình sẽ làm
App Electron trên Windows nhận AirPlay từ iPhone/iPad và hiển thị màn hình iPhone trực tiếp trong khung preview thiết bị của app.

## Dùng ở đâu
Desktop/laptop Windows — để anh quay demo khóa học, trình chiếu thao tác iPhone và không bị lộ một cửa sổ UxPlay/GStreamer rời bên ngoài.

## Bản hiện tại phải có gì
- Nút khởi động AirPlay trong Electron app.
- Khung preview iPhone/iPad nằm trong app.
- Khi iPhone mirror kết nối, app tự tìm cửa sổ video do UxPlay/GStreamer tạo ra và nhúng/resize vào vùng preview.
- Nếu chưa bắt được cửa sổ, UI phải báo rõ đang chờ mirror window, không giả vờ đã xong.

## Tạm chưa làm
- Chưa viết AirPlay receiver riêng.
- Chưa bắt buộc headless raw stream nếu UxPlay/GStreamer trên Windows chưa hỗ trợ ổn định.
- Chưa thể xác nhận 100% bằng thiết bị thật nếu không có iPhone AirPlay đang kết nối tại thời điểm test.

## Cách chạy kỹ thuật
Electron main process spawn `uxplay.exe`, thêm MSYS2/GStreamer vào PATH, dùng `d3d11videosink` và không truyền `-fs`. Helper `window-embedder.ps1` dùng Win32 `EnumWindows` + `SetParent` để gắn cửa sổ mirror vào BrowserWindow theo tọa độ `#mirrorHost`.

## Phong cách & màu
Style: Premium/dark, tập trung sân khấu preview thiết bị.
Màu chủ đạo: tím/xanh gradient.
Theme: Dark.
