# CURRENT — KHO BÁU TRI THỨC (Lớp 1)

**Updated:** 2026-10-06 — P39 Learning OS Decision Engine certified.

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
