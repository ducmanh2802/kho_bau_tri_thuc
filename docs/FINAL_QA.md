# BÁO CÁO KIỂM THỬ CHẤT LƯỢNG — KHO BÁU TRI THỨC
## Quality Assurance & Verification Matrix

### 1. Ma Trận Kiểm Thử Chức Năng (Feature Test Matrix)

| Hạng mục kiểm thử | Kịch bản kiểm thử | Kết quả thực tế | Trạng thái |
| :--- | :--- | :--- | :--- |
| **Giao diện Trang Chủ** | Hiển thị lời chào cá nhân, XP, Sao, Chuỗi ngày, 3 nút môn học to rõ ràng | Hoạt động mượt mà, đúng chuẩn Top Bar Contract | **PASS** |
| **Môn Tiếng Việt** | 10 chủ điểm, các dạng câu hỏi: trắc nghiệm, điền khuyết, xếp câu, đọc hiểu | Tương tác tốt, có nút loa nghe phát âm | **PASS** |
| **Môn Toán Học** | 10 chủ điểm: đếm 0-20, so sánh >, <, =, cộng trừ, hình học, lời văn | Trực quan, minh họa sinh động | **PASS** |
| **Môn Tiếng Anh** | 10 chủ điểm: Phonics, numbers, colors, animals, school, family | Phát âm chuẩn tiếng Anh qua Web Speech API | **PASS** |
| **14 Mini-Games** | 14 trò chơi với cơ chế riêng biệt, có điểm, âm thanh và màn ăn mừng | Chơi mượt mà, không giật lag | **PASS** |
| **Ôn Tập Thông Minh** | Tự động chọn câu hỏi từ nhóm kỹ năng yếu và câu sai gần đây | Sinh bộ câu hỏi chính xác | **PASS** |
| **Thử Thách Tuần** | Đấu trường 8 câu hỏi tổng hợp, nhận cúp vàng danh dự | Hoàn thành và ghi nhận tiến độ | **PASS** |
| **Khu Vườn Cây Tri Thức** | Cây lớn theo số lượng bài học, tưới nước có hoa nở | Hiệu ứng sinh động, tạo động lực | **PASS** |
| **Phòng Đồ & Linh Thú** | Đổi mascot, mở khóa mũ, kính, balo bằng sao vàng | Lưu trữ trang bị vào hồ sơ | **PASS** |
| **Khu Vực Phụ Huynh** | Cổng Parent Gate phép tính 2 chữ số, bảng báo cáo phân tích | Bảo mật, chẩn đoán sư phạm chi tiết | **PASS** |
| **Giới Hạn Màn Hình** | Cảnh báo nghỉ ngơi khi học đủ số phút quy định | Nhắc nhở ấm áp bảo vệ mắt bé | **PASS** |
| **Lưu Trữ Dữ Liệu** | Tải lại trang (F5/Reload) tiến độ học tập vẫn giữ nguyên vẹn | Dữ liệu được lưu trữ an toàn trong localStorage | **PASS** |
| **Kiểm Tra Biên Dịch** | Typecheck và Build thành công không có lỗi | `tsc --noEmit` & `npm run build` PASS | **PASS** |
| **Kiểm Thử Tự Động (Vitest)** | 5 files kiểm thử (24 bài test) bao phủ: Learning Engine, Math, Vietnamese, English, Parent Mode | 24/24 tests passed (100%) | **PASS** |
| **Tuân Thủ iFrame Sandbox** | Không sử dụng `window.alert` hoặc `window.confirm` chặn giao diện | Toàn bộ xác nhận thực hiện in-modal an toàn | **PASS** |
