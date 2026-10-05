# GOOGLE AI STUDIO RUNBOOK — KHO BÁU TRI THỨC
## Development, Build & Operation Guide

### 1. Kiến Trúc Ứng Dụng
- **Khung giao diện**: React 19 + TypeScript.
- **Trình biên dịch & Bundler**: Vite 8.
- **Phong cách giao diện**: Tailwind CSS v4 (@tailwindcss/vite) với bảng màu thân thiện cho trẻ nhỏ.
- **Âm thanh & Giọng nói**: Web Audio API (bộ tổng hợp âm thanh không cần file ngoài) + Web Speech API (TTS tiếng Việt và tiếng Anh).
- **Lưu trữ dữ liệu**: LocalStorage với cơ chế tự động khôi phục lỗi (Fault-Tolerant Persistence).

### 2. Các Lệnh Thực Thi
- `npm run dev`: Khởi động máy chủ phát triển trên cổng 3000 (`vite --port=3000 --host=0.0.0.0`).
- `npm run build`: Đóng gói ứng dụng cho môi trường sản xuất (`vite build`).
- `npm run lint`: Kiểm tra lỗi cú pháp TypeScript (`tsc --noEmit`).

### 3. Xử Lý Khi Không Có Khóa API
- Ứng dụng được thiết kế theo nguyên lý **Offline-First Resilience**: toàn bộ ngân hàng câu hỏi, bài học chuẩn và 14 mini-game đều chạy hoàn hảo độc lập mà không cần kết nối mạng hay khóa Gemini API bắt buộc.
