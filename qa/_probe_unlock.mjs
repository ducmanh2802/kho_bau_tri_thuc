export default async function run(page, ui) {
  const out = {};
  await page.evaluate(() => {
    localStorage.clear();
    const raw = JSON.parse(localStorage.getItem('kho_bau_child_profile') || '{}');
    raw.unlockAllLessons = true;
    localStorage.setItem('kho_bau_child_profile', JSON.stringify(raw));
  });
  await page.goto(ui.origin + '/');
  await page.waitForSelector('[data-testid="nav-home"]:visible', { timeout: 20000 });
  out.profileAfterBoot = await page.evaluate(() => {
    const p = JSON.parse(localStorage.getItem('kho_bau_child_profile') || '{}');
    return { unlockAllLessons: p.unlockAllLessons, completed: (p.completedLessons || []).length };
  });
  await page.getByRole('button', { name: /Tiếng Việt/ }).first().click({ timeout: 12000 });
  await page.waitForSelector('text=Vương Quốc Tiếng Việt', { timeout: 20000 });
  await page.waitForTimeout(900);
  const nodes = page.locator('[data-testid^="lesson-button-"]');
  out.firstLabels = [];
  for (let i = 0; i < 3; i += 1) {
    out.firstLabels.push(await nodes.nth(i).getAttribute('aria-label'));
  }
  // play lesson 1 to completion
  await nodes.nth(0).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: /Bắt đầu/ }).first().click({ timeout: 8000 });
  await page.waitForSelector('[data-testid$="-question"]', { timeout: 10000 });
  for (let i = 0; i < 14; i += 1) {
    const checkBtn = page.getByRole('button', { name: /Kiểm tra câu trả lời/ });
    if (!(await checkBtn.count())) break;
    const opt = page.locator('[data-testid=answer-option]').first();
    if (await opt.count()) await opt.click({ timeout: 8000 });
    await checkBtn.click({ timeout: 8000 });
    await page.waitForTimeout(120);
    const next = page.getByRole('button', { name: /Câu tiếp theo|Xem kết quả bài học/ });
    if (await next.count()) await next.first().click({ timeout: 8000 });
    await page.waitForTimeout(120);
  }
  out.dialogsAfterLesson1 = await page.locator('[role=dialog]').count();
  const dismiss = page.locator('[data-testid="lesson-close"], button[aria-label="Đóng"]').last();
  if (await dismiss.count()) await dismiss.click({ timeout: 8000 }).catch((e) => { out.dismissError = String(e.message).slice(0, 80); });
  await page.waitForTimeout(500);
  out.profileAfterLesson1 = await page.evaluate(() => {
    const p = JSON.parse(localStorage.getItem('kho_bau_child_profile') || '{}');
    return { unlockAllLessons: p.unlockAllLessons, completed: (p.completedLessons || []).length };
  });
  // now try lesson 2
  const label2 = await nodes.nth(1).getAttribute('aria-label');
  await nodes.nth(1).focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(700);
  out.dialogsAfterNode2 = await page.locator('[role=dialog]').count();
  out.startButtons = await page.getByRole('button', { name: /Bắt đầu/ }).count();
  out.label2 = label2;
  return out;
}
