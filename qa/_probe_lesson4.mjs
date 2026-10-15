export default async function run(page, ui) {
  const out = {};
  await page.evaluate(() => localStorage.clear());
  await page.goto(ui.origin + '/');
  await page.waitForSelector('[data-testid="nav-home"]:visible', { timeout: 20000 });
  await page.getByRole('button', { name: /Tiếng Việt/ }).first().click({ timeout: 12000 });
  await page.waitForSelector('text=Vương Quốc Tiếng Việt', { timeout: 20000 });
  await page.waitForTimeout(1200);
  await page.locator('[data-testid^="lesson-button-"]').first().click({ timeout: 12000, force: true });
  await page.waitForTimeout(800);
  out.dialogs = await page.locator('[role=dialog]').count();
  out.startButtons = await page.getByRole('button', { name: /Bắt đầu/ }).count();
  out.popupText = await page.evaluate(() => document.body.innerText.slice(0, 500));
  const start = page.getByRole('button', { name: /Bắt đầu/ }).first();
  if (out.startButtons) {
    await start.click({ timeout: 8000 });
    out.startClicked = true;
  }
  await page.waitForTimeout(1200);
  out.dialogsAfterStart = await page.locator('[role=dialog]').count();
  out.hasQuestionCounter = await page.evaluate(() => /Câu hỏi 1\s*\//.test(document.body.innerText));
  out.bodyAfter = await page.evaluate(() => document.body.innerText.slice(0, 300));
  out.answerOptions = await page.locator('[data-testid=answer-option]').count();
  return out;
}
