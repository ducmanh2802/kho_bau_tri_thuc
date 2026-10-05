# MASTER ROADMAP — KHO BÁU TRI THỨC LỚP 1

> Cập nhật sau chuỗi thực thi P27.5 → P33 (2026-10-05).

## Trạng thái tổng quan

| Phase | Nội dung | Trạng thái |
|---|---|---|
| P25 | Nền móng + audit sâu | Giữ nguyên |
| P26 | Cơ chế học + trò chơi | Giữ nguyên |
| P27 | Competition Engine | Giữ nguyên, đã mở rộng ở P27.5 |
| P28 | Learning OS | **Đã cứu** — trước là code chết + gọi hàm không tồn tại |
| P27.5 | Exam Fidelity + Reading Fluency | **Hoàn tất** |
| P29 | Content / Question Quality | **Hoàn tất** — 0 lỗi |
| P30 | Reliability / Persistence / Security | **Hoàn tất** |
| P31 | Performance / Responsive / A11y / Offline | **Hoàn tất** |
| P32 | Google AI Studio | **Hoàn tất** |
| P33 | Final Certification | **READY** |

## Tài liệu

| File | Nội dung |
|---|---|
| `MASTER_BASELINE.md` | Baseline trước/sau, 3 lỗi P0 gốc rễ |
| `P27_5_EXAM_FIDELITY.md` | 7 dạng bài, blueprint, seed, timer, scoring, review |
| `P27_5_READING_FLUENCY.md` | Taxonomy, thang 5 bậc, công thức chỉ số, công bằng |
| `P29_CONTENT_QUALITY.md` | Validator, coverage matrix, 5 lỗi nội dung đã sửa |
| `P30_RELIABILITY.md` | Migration, sanitize, idempotency 5 tầng, parent mode |
| `P31_PERFORMANCE_ACCESSIBILITY.md` | Bundle, 6 viewport, a11y, reduced motion |
| `P32_GOOGLE_AI_STUDIO.md` | Dependency, metadata, fresh-env test |
| `P33_FINAL_CERTIFICATION.md` | Chứng nhận từng gate + golden path |
| `FINAL_RELEASE_REPORT.md` | Báo cáo phát hành |
| `GOOGLE_AI_STUDIO_RUNBOOK.md` | Runbook thực thi được |

Tài liệu cũ (`P25`–`P28`, `LEARNING_ENGINE.md`, `PRODUCT_SPEC.md`…) được giữ lại làm lịch sử.
Khi tài liệu cũ mô tả hành vi **không còn đúng** so với code, `docs/` ở trên là chuẩn.

## Bản đồ mã nguồn

```
src/
├── config/policy.ts              ← MỌI ngưỡng, có rationale + test
├── types/
│   ├── index.ts                  SubjectType, Question, Lesson, ChildProfile, ActiveScreen
│   ├── competition.ts            Question contract 7 dạng, Blueprint, ExamResult
│   ├── learningOS.ts             Evidence, KnowledgeState, LearningAction, Store
│   └── reading.ts                Taxonomy đọc, Metrics, Profile, Ladder
├── services/
│   ├── learningOS.ts             reduceEvidence · nextBestAction · dailyPlan · explain
│   ├── readingEngine.ts          seed · assembleStageItems · computeMetrics · applySession
│   ├── competitionEngine.ts      assemble · gradeAnswer · scoreSession · assessReadiness
│   ├── adaptive.ts               dailyReview · parentReport · readingReport
│   ├── contentValidator.ts       validate · coverage · semanticSimilarity
│   └── storage.ts                readJSONObject · writeJSON · migrate · sanitize · idempotent
├── data/
│   ├── vietnameseCurriculum.ts   10 chủ đề
│   ├── mathCurriculum.ts         10 chủ đề
│   ├── englishCurriculum.ts      10 chủ đề
│   ├── competitionTaxonomy.ts    26 kỹ năng thi
│   ├── competitionQuestions.ts   49 câu trắc nghiệm + 29 câu đa dạng
│   ├── competitionExamFormats.ts matching/ordering/fill-blank/drag-drop/classify/true-false
│   ├── competitionBlueprints.ts  10 preset có phân phối + section
│   └── readingContent.ts         11 kỹ năng · 5 đoạn đọc · 20 câu
└── components/
    ├── reading/ReadingFluencyScreen.tsx      ← MỚI (P27.5)
    ├── learning/NextBestActionCard.tsx        ← MỚI (Learning OS lên UI)
    ├── competition/                           ← viết lại (7 dạng, timer, review)
    ├── parent/ParentDashboardModal.tsx        ← + tab Luyện Đọc, banner demo
    ├── common/Header.tsx                      ← responsive + a11y
    └── games/ (14 game)
```

## QA trình duyệt thật

| Script | Phạm vi |
|---|---|
| `qa/golden-path.mjs` | 17 bước: bé mới → bài học → đọc → thi → xem lại → phụ huynh → reload |
| `qa/responsive-a11y.mjs` | 6 viewport + accessibility + reduced motion |
| `qa/debug-timer.mjs`, `qa/debug-persist.mjs`, `qa/debug-parent.mjs` | công cụ chẩn đoán |

```bash
npm run build
npm run preview -- --port 4173
node "<browser-skill>/browser.mjs" http://127.0.0.1:4173/ --script ./qa/golden-path.mjs
node "<browser-skill>/browser.mjs" http://127.0.0.1:4173/ --script ./qa/responsive-a11y.mjs
```

## Việc còn lại (không chặn phát hành)

| # | Việc | Ưu tiên |
|---|---|---|
| 1 | Service worker / PWA để app tự cài và chạy offline từ lần đầu | P2 |
| 2 | Bổ sung câu hỏi thi để phủ hết chương trình lớp 1 (hiện 78 câu) | P2 |
| 3 | Audit riêng cho track KID'S BOX | Cao — **không dùng với trẻ cho tới khi audit** |
| 4 | Bọc modal bằng focus trap + trả focus về nút đã mở | P2 |
| 5 | Đưa file âm thanh về repo thay vì TTS phụ thuộc giọng hệ thống | P2 |

## Nguyên tắc không được phá vỡ

1. **UI không quyết định** correctness / score / mastery / readiness.
2. **Không** sinh dữ liệu giả, điểm giả, hay PASS giả.
3. **Không** phụ thuộc AI để chấm điểm hay tính mastery.
4. **Không** gán nhãn tiêu cực cho trẻ: không "chậm", "kém", "yếu", "thua".
5. **Không** tuyên bố preset là đề thi chính thức.
6. Mọi ngưỡng nằm trong `src/config/policy.ts`, có rationale, có test.
7. Sửa tăng dần, không viết lại toàn bộ ứng dụng.
