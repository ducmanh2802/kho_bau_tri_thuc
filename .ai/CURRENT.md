# CURRENT — KHO BÁU TRI THỨC (Lớp 1)

**Updated:** 2026-10-14 — P42/T01 hotfix certified.

## P42

- T01 (p42/T01): hero gradient + localDateKey + review/weekly achievement rules + nav lg-breakpoint + self-host fonts + tree/game-count — typecheck/test(409)/build PASS, xem `docs/opencode/reports/T01_REPORT.md`.
- T02 (p42/T02): sửa đáp án/sai phạm 10 game + thưởng delta/20% + coloring 30% + memory-seen + playNonce — typecheck/test(435)/build PASS, smoke 0 console error, xem `docs/opencode/reports/T02_REPORT.md`.
- T02B (p42/T02B): tách 18 game sang src/data/games + sửa 16 lỗi B1–B16 + test phủ 18 game — typecheck/test(471)/build PASS, xem `docs/opencode/reports/T02B_REPORT.md`.
- T01B (p42/T01B): header game 1 dòng + Esc/Back + sticky bài học + menu icon-only + scroll-top + font @theme + banner ≥4,5:1 + UpdateBanner + loa riêng + touch 44px + đếm game động + tưới 1/ngày + nav testid — typecheck/test(496)/build PASS, probe QA 30/30, xem `docs/opencode/reports/T01B_REPORT.md`.
- T02D (p42/T02D): bỏ câu "ạ cụ" → "Con dế mèn", "Nón lá 👒" → "Ngọn núi ⛰️", sót 110cm → 10cm, RED → CRAB blend — typecheck/test(504)/build PASS, xem `docs/opencode/reports/T02D_REPORT.md`.
- T02C (p42/T02C): tách competition/reading/KidBox khỏi chunk chính (727→253 kB, react-vendor riêng), SW kho-bau-v3 + precache build-generated, validator giữ dấu 1679ms→35ms (2000 câu 56ms), CONTENT_GUIDE — typecheck/test(523)/build/check:budget/offline-pwa PASS, xem `docs/opencode/reports/T02C_REPORT.md`.
- T07 (p42/T07): SubjectScreen thành con đường phiêu lưu (nút 72px, SVG path, rương, popup, gating/cuộn, storage sao/rương/unlock), WorldMapScreen bản đồ kéo/vuốt + dotted route + badge %, storage sanitizer/migration+test, QA scripts migrate "Vào học" → lesson-button/"Bắt đầu", parent toggle mở hết — typecheck/test(599)/build PASS, xem `docs/opencode/reports/T07_REPORT.md`.
- T08 (p42/T08): GamesHub registry lazy ở src/components/games/registry.ts, catalog chỉ dữ liệu + skillIds + storage first-seen "MỚI", LAUNCHABLE đồng bộ 18 game, tabs cố định 5 cột, gợi ý cho bé, pause chỉ real-time, qa/games.mjs cập nhật 18 game — typecheck/test(601)/build PASS.
## Phase states (real, evidence-backed)

| Phase | State | Evidence |
|---|---|---|
| P25–P33, P34, P35, P36, P37 | Preserved (not regressed) | full suite green (330/330) |
| P38 Praise Engine + language/TTS parity | **PASS** | `docs/P38_PRAISE_ENGINE_CERTIFICATION.md` |
| **P39 Learning OS Decision Engine** | **PASS** | `docs/P39_LEARNING_OS_DECISION_ENGINE.md` |

## P39 summary

- New canonical pipeline: `src/services/decisionEngine.ts` +
  `src/types/decisionEngine.ts` + `P39_DECISION_POLICY` in `src/config/policy.ts`.
- Consumes Learning OS evidence only (read-only); mastery/SM-2/state untouched.
- Outputs: mode, recommendations with reason codes, NBA, `ÔN TẬP HÔM NAY` daily plan
  (3–5), session plan (QUICK/STANDARD/FULL/RECOVERY/DISCOVERY), parent decision report.
- UI: `NextBestActionCard` (child + "Vì sao?" codes) and
  `ParentDashboardModal` insights (`parent-decision-report`, `parent-next-best`).
- Tests: 21 files / 330 pass. Typecheck + production build pass.
- Real Chromium proof: golden paths A–G PASS; mobile 375px + ~200% zoom + a11y probe;
  0 console errors; 0 failed requests.
- Rerun: `npm run build && npm run preview -- --port 4173`, then
  `node <browser-skill>/browser.mjs http://127.0.0.1:4173/ --script qa/decision-engine.mjs`.

## Tree hygiene note (2026-10-06)

P36, P38, P39 sessions share this working tree concurrently. Each lane left its
changes uncommitted. Do not sweep other lanes' files into a single commit.
