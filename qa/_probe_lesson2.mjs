export default async function run(page, ui) {
  const out = {};
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('__x','1'); });
  await page.goto(ui.origin + '/');
  await page.waitForSelector('[data-testid="nav-home"]:visible', { timeout: 20000 });
  await page.evaluate(() => {
    // Parent override so every lesson node is unlocked (the same switch the
    // app exposes in the parent dashboard).
    const raw = JSON.parse(localStorage.getItem('kho_bau_child_profile') || '{}');
    raw.unlockAllLessons = true;
    localStorage.setItem('kho_bau_child_profile', JSON.stringify(raw));
  });
  await page.reload();
  await page.waitForSelector('[data-testid="nav-home"]:visible', { timeout: 20000 });
  await page.getByRole('button', { name: /Tiếng Việt/ }).first().click({ timeout: 12000 });
  await page.waitForSelector('text=Vương Quốc Tiếng Việt', { timeout: 20000 });
  await page.waitForTimeout(1500);
  const first = page.locator('[data-testid^="lesson-button-"]').first();
  out.firstId = await first.getAttribute('data-testid');
  try {
    await first.click({ timeout: 6000 });
    out.plainClick = 'ok';
  } catch (e) {
    out.plainClick = String(e.message).split('\n').slice(0, 4).join(' | ');
  }
  // try scroll into view + click
  try {
    await first.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.waitForTimeout(400);
    await first.click({ timeout: 6000 });
    out.scrolledClick = 'ok';
  } catch (e) {
    out.scrolledClick = String(e.message).split('\n').slice(0, 4).join(' | ');
  }
  try {
    await first.click({ timeout: 4000, force: true });
    out.forceClick = 'ok';
    await page.waitForTimeout(400);
    const dlg = await page.locator('[role=dialog]').count();
    const txt = await page.evaluate(() => document.body.innerText.slice(0, 400));
    out.dialogAfterForce = dlg;
    out.textAfterForce = txt;
  } catch (e) {
    out.forceClick = String(e.message).split('\n').slice(0, 4).join(' | ');
  }
  return out;
}
