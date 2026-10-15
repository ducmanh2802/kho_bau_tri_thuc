/**
 * T20A — shared helpers for the browser probes in this folder.
 *
 * Everything here exists because a probe must be able to REACH the screen it
 * wants to measure, no matter which responsive breakpoint the app picks.
 */

/** Wait for the app shell to paint (T01B/11 unified QA hook). */
export async function waitForAppShell(page, timeout = 20000) {
  await page.waitForSelector('[data-testid="nav-home"]:visible', { timeout });
}

/** Click a nav destination; works on the top nav AND the bottom nav. */
export async function navTo(page, screen, click = { timeout: 12000 }) {
  const item = page.locator(`[data-testid="nav-${screen}"]:visible`).first();
  await item.click(click);
}

/**
 * T20A / bug B-01 (P0) — open the first lesson of the subject screen in front.
 *
 * The adventure path stacks its nodes when one topic carries many lessons
 * (SubjectScreen.tsx path geometry — see docs/opencode/reports/T20A_BUGS.md),
 * so a mouse click on an overlapped node is intercepted by a later sibling.
 * T20A must not fix that bug (T20B owns P0/P1), so this helper activates the
 * node with the keyboard — the exact same DOM path as a tap, without the
 * hit-test that the overlap breaks. When B-01 is fixed this stays correct.
 */
export async function openFirstLesson(page, click = { timeout: 12000 }) {
  const node = page.locator('[data-testid^="lesson-button-"]').first();
  await node.focus({ timeout: click.timeout ?? 12000 });
  await page.keyboard.press('Enter');
  const start = page.getByRole('button', { name: /Bắt đầu/ }).first();
  if (await start.count()) await start.click(click);
}

/**
 * T20A / bug B-04 — open the competition hub ("Đấu Trường").
 *
 * The hub has no entry in the main nav and none on the world map any more: the
 * only child-safe route is the Parent Dashboard's "Đấu Trường Thi Thử" button
 * (App.tsx). Until that entry point comes back, probes reach it the same way a
 * grown-up does, so the hub itself is still measured.
 */
export async function openCompetitionHub(page, click = { timeout: 12000 }) {
  await page.getByRole('button', { name: /Ba Mẹ/ }).first().click(click);
  await page.waitForSelector('text=Cổng Xác Nhận Phụ Huynh', { timeout: click.timeout ?? 12000 });
  const gate = await page.evaluate(() => {
    const el = document.querySelector('.bg-slate-100.rounded-2xl');
    return el ? el.textContent.trim() : null;
  });
  const match = gate && gate.match(/(\d+)\s*\+\s*(\d+)/);
  if (!match) throw new Error('parent gate arithmetic not found');
  await page.getByRole('spinbutton').fill(String(Number(match[1]) + Number(match[2])));
  await page.getByRole('button', { name: 'Mở Bảng Phụ Huynh' }).click(click);
  await page.getByRole('button', { name: 'Đấu Trường Thi Thử', exact: true }).click(click);
  await page.getByRole('button', { name: /Mở Đấu Trường Thi Thật/ }).click(click);
  await page.waitForSelector('text=Kho Báu Đấu Trường Tri Thức', { timeout: click.timeout ?? 12000 });
}
