/**
 * P41 — CURRICULUM QUALITY BROWSER PROBE (§4, §5).
 *
 * Verifies, in a REAL browser against the production build, that the expanded
 * lesson bank still renders and plays end-to-end, and that the answer-position
 * fix is visible at runtime (the correct option is not always the first one).
 *
 * Scope note: only WIRED flows are exercised. The Adaptive-Learning session
 * composer has no UI surface yet, so QUICK/DEEP session E2E is intentionally
 * NOT attempted here (it would be a fabricated result).
 */

const state = { ok: false, steps: [], errors: [] };

const log = (name, detail = {}) => state.steps.push({ step: name, ...detail });
const fail = (msg) => state.errors.push(msg);

const CLICK = { timeout: 12000 };

export default async function run(page, ui) {
  const origin = ui.origin;

  page.on('pageerror', (e) => fail('PAGEERROR: ' + String(e.message).split('\n')[0]));
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    // Ignore environment noise (offline fonts / favicon) — not app defects.
    if (/font|favicon|net::ERR|Failed to load resource|manifest/i.test(text)) return;
    fail('CONSOLE_ERROR: ' + text.slice(0, 200));
  });

  // ---- Boot a clean child -------------------------------------------------
  await page.goto(origin + '/');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('__sentinel', 'alive');
  });
  await page.reload();
  await page.waitForSelector('text=Xin chào', { timeout: 20000 });
  log('boot', { ok: true });

  // ---- Vietnamese subject -> first lesson ---------------------------------
  await page.getByRole('button', { name: /Tiếng Việt/ }).first().click(CLICK);
  await page.waitForSelector('text=Vương Quốc Tiếng Việt', { timeout: 20000 });

  const lessonButtons = await page.getByRole('button', { name: /Vào học|Học lại/ }).count();
  log('vietnameseSubject', { lessonCount: lessonButtons });
  if (lessonButtons === 0) fail('no Vietnamese lessons listed');

  await page.getByRole('button', { name: /Vào học/ }).first().click(CLICK);
  await page.waitForSelector('text=Câu hỏi 1', { timeout: 20000 });
  log('lessonOpened', { ok: true });

  // ---- Answer the lesson, recording option counts + correct position ------
  const optionCounts = [];
  const correctPositions = [];
  let answered = 0;

  for (let i = 0; i < 12; i += 1) {
    const checkBtn = page.getByRole('button', { name: /Kiểm tra câu trả lời/ });
    if (!(await checkBtn.count())) break;

    const optionTexts = await page
      .locator('[data-testid=answer-option]')
      .allInnerTexts();
    const count = optionTexts.length;
    if (count > 0) optionCounts.push(count);

    await page.locator('[data-testid=answer-option]').first().click(CLICK);
    await checkBtn.click(CLICK);
    await page.waitForSelector('[role=status]', { timeout: 8000 });

    // After checking, the correct option carries an emerald border.
    const pos = await page.evaluate(() => {
      const opts = Array.from(document.querySelectorAll('[data-testid=answer-option]'));
      return opts.findIndex((el) => el.className.includes('border-emerald-500'));
    });
    if (pos >= 0) correctPositions.push(pos);
    answered += 1;

    const next = page.getByRole('button', { name: /Câu tiếp theo|Xem kết quả bài học/ });
    if (await next.count()) await next.first().click(CLICK);
    await page.waitForTimeout(120);
    if (await page.getByText('CHÚC MỪNG BÉ HOÀN THÀNH!').count()) break;
  }

  const completed = (await page.getByText('CHÚC MỪNG BÉ HOÀN THÀNH!').count()) > 0;
  const minOptions = optionCounts.length ? Math.min(...optionCounts) : 0;
  const distinctPositions = new Set(correctPositions).size;

  log('lessonPlay', {
    answered,
    optionCounts,
    minOptions,
    correctPositions,
    distinctCorrectPositions: distinctPositions,
    completed,
  });

  if (answered < 3) fail('answered fewer than 3 lesson items');
  if (optionCounts.length === 0) fail('no answer options rendered');
  if (minOptions < 3) fail('a choice question rendered with fewer than 3 options');
  if (!completed) fail('lesson did not reach the completion screen');

  // Runtime answer-position: the bank is balanced, so over a lesson we must see
  // the correct answer land at more than just index 0.
  if (correctPositions.length >= 4 && distinctPositions < 2) {
    fail('correct answer always rendered at the same option position');
  }

  // ---- Persistence: Learning OS evidence recorded -------------------------
  const os = await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('kho_bau_learning_os_store') || 'null');
    if (!raw) return null;
    return {
      schemaVersion: raw.schemaVersion,
      skillCount: Object.keys(raw.knowledgeStates || {}).length,
      evidenceCount: (raw.recentEvidences || []).length,
    };
  });
  log('evidencePersisted', os || { none: true });
  if (!os || os.skillCount === 0) fail('Learning OS evidence was not persisted');

  state.ok = state.errors.length === 0;
  return state;
}
