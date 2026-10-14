# P42 — Nâng cấp "Kho Báu Tri Thức": hấp dẫn · đẹp · nhiều kiến thức · nhiều trò chơi

Audit: [`P42_AUDIT.md`](P42_AUDIT.md) · Luật chung: [`00_RULES.md`](00_RULES.md)

## Cách giao việc cho OpenCode

Mở terminal tại thư mục dự án (`D:\trithuc\kho_bau_tri_thuc`) và chạy từng task:

```powershell
opencode run "Đọc docs/opencode/00_RULES.md rồi thực hiện ĐẦY ĐỦ task trong docs/opencode/T01_hotfix_giao_dien_ngay.md. Làm thật, chạy test, commit, viết báo cáo."
```

Hoặc trong giao diện `opencode` gõ cùng câu lệnh đó. Đổi tên file cho task tiếp theo.
Sau mỗi task: xem `docs/opencode/reports/Txx_REPORT.md`, chạy `npm run dev` thử nhanh, rồi merge nhánh `p42/Txx` vào `main`.

> **Chạy song song:** chỉ những task cùng đợt có đánh dấu ⇉ mới chạy song song được, và mỗi task phải ở một
> `git worktree` riêng (`git worktree add ../kb-T10 -b p42/T10`). Không chắc → chạy tuần tự.

## Thứ tự thực hiện

| Đợt | Task | Nội dung | Phụ thuộc | Song song |
|---|---|---|---|---|
| **0. Sửa lỗi** | T01 | Hotfix giao diện + ngày giờ + font offline | — | |
| | T02 | Sửa nội dung sai trong game + kinh tế thưởng | T01 | |
| **1. Nền móng** | T03 | Design system + linh vật Gấu Bút Chì SVG | T02 | |
| | T04 | Ngân hàng câu hỏi chung cho game + khen/feedback | T02 | ⇉ với T05 |
| | T05 | Lesson player: matching, đúng/sai, gõ chữ, kéo thả | T02 | ⇉ với T04 |
| **2. Giao diện** | T06 | Home 1 màn hình + thanh điều hướng 5 mục | T03 | |
| | T07 | Màn môn học thành "con đường phiêu lưu" + bản đồ thế giới | T06 | |
| | T08 | Games Hub + khung game mobile | T06 | ⇉ với T07 |
| | T09 | Luyện đọc + Đấu trường thân thiện với bé | T06 | ⇉ với T07, T08 |
| **3. Kiến thức** | T10 | Tiếng Việt: âm, chữ ghép, toàn bộ vần | T05 | ⇉ T11, T12, T13 |
| | T11 | Toán: số đến 100, cộng trừ trong 100, cm, giờ, lịch, hình khối | T05 | ⇉ |
| | T12 | Tiếng Anh: số 1–20, mẫu câu, phonics, Kid's Box units | T05 | ⇉ |
| | T13 | Luyện đọc: +24 truyện theo chủ đề | T05 | ⇉ |
| | T14 | Môn mới "Em & Cuộc sống" (TN-XH, an toàn, kỹ năng sống) | T10–T13 | |
| **4. Game mới** | T15 | 3 game Tiếng Việt mới | T04, T08 | tuần tự |
| | T16 | 3 game Toán mới | T15 | tuần tự |
| | T17 | 4 game Anh / Logic / Khoa học | T16 | tuần tự |
| **5. Động lực** | T18 | Sticker album, level bé, nhiệm vụ xoay vòng, lịch chuỗi ngày, shop | T17 | |
| | T19 | Âm nhạc, ăn mừng, combo, hiệu ứng | T18 | |
| **6. Nghiệm thu** | T20 | QA toàn diện + chứng nhận P42 | tất cả | |

## Kết quả mong đợi sau P42

| Chỉ số | Trước | Sau |
|---|---|---|
| Câu hỏi bài học | 155 | **≥ 900** (mỗi bài ≥ 10 câu) |
| Vần tiếng Việt được dạy | 6 | **≥ 70** |
| Toán | đến 20 | **đến 100** + đo lường + hình khối |
| Truyện đọc | 12 | **≥ 36** |
| Môn học | 3 | **4** |
| Trò chơi | 18 (có lỗi) | **28**, lấy câu hỏi từ chương trình, có test |
| Linh vật / minh hoạ | emoji | SVG linh vật nhiều tư thế |
| Hệ thưởng | sao | sao + sticker + level + nhiệm vụ xoay vòng + lịch chuỗi ngày |
