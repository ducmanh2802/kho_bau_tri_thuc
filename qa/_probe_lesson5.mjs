export default async function run(page, ui) {
  const out = {};
  await page.evaluate(() => localStorage.clear());
  await page.goto(ui.origin + '/');
  await page.waitForSelector('[data-testid="nav-home"]:visible', { timeout: 20000 });
  await page.getByRole('button', { name: /Tiếng Việt/ }).first().click({ timeout: 12000 });
  await page.waitForSelector('text=Vương Quốc Tiếng Việt', { timeout: 20000 });
  await page.waitForTimeout(1000);
  await page.locator('[data-testid^="lesson-button-"]').first().focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(700);
  out.dialogs = await page.locator('[role=dialog]').count();
  const start = page.getByRole('button', { name: /Bắt đầu/ }).first();
  out.startButtons = await start.count();
  if (out.startButtons) await start.click({ timeout: 8000 });
  await page.waitForTimeout(1200);
  out.hasCounter = await page.evaluate(() => /Câu hỏi 1\s*\//.test(document.body.innerText));
  out.answerOptions = await page.locator('[data-testid=answer-option]').count();
  return out;
}
