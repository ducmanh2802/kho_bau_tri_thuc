# LUẬT CHUNG CHO MỌI TASK P42 (OpenCode phải đọc trước khi làm)

Bạn là kỹ sư senior + nhà thiết kế game giáo dục cho trẻ 6–7 tuổi, làm việc trên repo
"Kho Báu Tri Thức — Lớp 1" (React 19 + Vite 8 + TypeScript + Tailwind v4, PWA offline, localStorage).
Người dùng cuối là **một bé trai lớp 1** (Việt Nam). Mọi thứ phải vui, an toàn, đúng kiến thức.

## Bắt buộc
1. Đọc `docs/opencode/P42_AUDIT.md`, `.ai/CURRENT.md`, file task của bạn, và code liên quan TRƯỚC khi sửa.
2. Giữ nguyên stack. KHÔNG thêm dependency trả phí, KHÔNG gọi API mạng, KHÔNG backend. Thêm dependency npm chỉ khi thật cần và ghi lý do trong báo cáo (ưu tiên SVG/CSS tự viết).
3. KHÔNG xoá/reset tiến độ thật của bé trong localStorage. Mọi thay đổi schema lưu trữ phải có migration + sanitizer trong `src/services/storage.ts` và test.
4. KHÔNG làm giả kết quả test. Chỉ báo PASS khi đã chạy thật.
5. Nội dung học phải **đúng chính tả tiếng Việt, đúng chương trình GDPT 2018 lớp 1**, không có từ ngữ buồn/đáng sợ/người lớn (mộ, ma, chết, đánh nhau…). Toán: chỉ số trong phạm vi 100, cộng/trừ KHÔNG nhớ. Tiếng Anh: British English, khớp Kid's Box 1.
6. Âm thanh: không tự đọc câu hỏi; bé bấm nút loa mới đọc. Lời khen tiếng Anh giữ tiếng Anh và khớp chữ hiển thị.
7. Mobile 375×667 phải dùng tốt: không cuộn ngang, nút ≥ 44px, chữ cho bé ≥ 14px (ưu tiên 16–24px).
8. Tôn trọng `prefers-reduced-motion`.
9. Không đụng file ngoài phạm vi task trừ khi cần để build/test pass — ghi rõ trong báo cáo.

## Quy trình mỗi task
1. `git checkout -b p42/<mã-task>` (từ `main` mới nhất).
2. Làm theo từng bước nhỏ; sau mỗi bước chạy test liên quan.
3. Trước khi kết thúc, chạy đủ 3 lệnh và phải PASS:
   ```
   npm run typecheck
   npm test
   npm run build
   ```
4. Viết test mới cho logic mới (vitest, đặt trong `tests/`). Với dữ liệu nội dung: test kiểm tra số lượng, không trùng id, đáp án nằm trong options, không có từ cấm.
5. Commit: `feat(p42-<mã>): <mô tả>` (hoặc `fix(...)`). Không commit `dist/`, `node_modules/`, `*.tgz`.
6. Ghi báo cáo `docs/opencode/reports/<mã-task>_REPORT.md`: đã làm gì, file thay đổi, số liệu trước/sau, lệnh đã chạy + kết quả, việc còn tồn.
7. Cập nhật 1 dòng trạng thái task vào `.ai/CURRENT.md` (mục "P42").

## Phong cách thiết kế (dùng chung)
- Tông ấm, tươi: nền kem, màu chủ đạo cam/vàng; mỗi môn 1 màu: Tiếng Việt = cam, Toán = xanh dương, Tiếng Anh = xanh lá, Em & Cuộc sống = tím, Trò chơi = hồng.
- Bo góc lớn, viền 1 cỡ thống nhất, bóng mềm, chữ to, ít chữ – nhiều hình – có giọng đọc.
- Linh vật chính: **Gấu Bút Chì** (component `Mascot` — xem task T03). Dùng lại, đừng tự vẽ linh vật khác.
