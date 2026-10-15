# T12A — Tiếng Anh: unit 1–6 (British English)

**Spec gốc:** `docs/opencode/T12_tieng_anh_mo_rong.md` — **unit 1–6**

> File này là bản chính thức. Chỗ nào khác spec gốc thì làm theo file này. Luật chung: `docs/opencode/00_RULES.md`.

## Điều chỉnh so với spec gốc
- Đặt các unit trong `englishCurriculum.ts` (hoặc theo `docs/CONTENT_GUIDE.md`). **Không** nạp vào `KIDBOX_MAPPED_UNITS` — mảng này cố ý để trống (xem `docs/ENGLISH_KIDBOX_COMPANION.md` §7).
- Từ vựng không bắt buộc có emoji (được dùng hình SVG đơn giản hoặc chữ).
- Mỗi bài ≥ 10 câu; giọng British (`britishSpeech.ts`); lời khen tiếng Anh khớp chữ hiển thị.

## Nghiệm thu chung
- `npm run typecheck`, `npm test`, `npm run build` đều PASS (runner sẽ tự kiểm lại).
- Báo cáo `docs/opencode/reports/T12A_REPORT.md`: đã làm gì, file thay đổi, số liệu trước/sau, lệnh đã chạy + kết quả, các quyết định bạn tự đưa ra, việc còn tồn.
