export default async function run(page, ui) {
  const out = {};
  const log = [];
  await page.evaluate(() => localStorage.clear());
  await page.goto(ui.origin + '/');
  await page.waitForSelector('[data-testid="nav-home"]:visible', { timeout: 20000 });
  await page.getByRole('button', { name: /Tiếng Việt/ }).first().click({ timeout: 12000 });
  await page.waitForSelector('text=Vương Quốc Tiếng Việt', { timeout: 20000 });
  await page.waitForTimeout(900);
  await page.locator('[data-testid^="lesson-button-"]').first().focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: /Bắt đầu/ }).first().click({ timeout: 8000 });
  await page.waitForSelector('text=Câu hỏi 1', { timeout: 20000 });

  for (let i = 0; i < 16; i += 1) {
    const checkBtn = page.getByRole('button', { name: /Kiểm tra câu trả lời/ });
    const hasCheck = (await checkBtn.count()) > 0;
    if (!hasCheck) {
      log.push(`step ${i}: no check button; body=${(await page.evaluate(() => document.body.innerText)).slice(0, 120).replace(/\n/g, ' | ')}`);
      break;
    }
    const type = await page.evaluate(() => {
      const el = document.querySelector('[data-testid$="-question"]');
      return el ? el.getAttribute('data-testid') : 'unknown';
    });
    const optCount = await page.locator('[data-testid=answer-option]').count();
    await page.locator('[data-testid=answer-option]').first().click({ timeout: 8000 });
    await checkBtn.click({ timeout: 8000 });
    await page.waitForTimeout(150);
    const next = page.getByRole('button', { name: /Câu tiếp theo|Xem kết quả bài học/ });
    const nextCount = await next.count();
    const nextLabel = nextCount ? await next.first().innerText() : 'none';
    if (nextCount) await next.first().click({ timeout: 8000 });
    await page.waitForTimeout(150);
    log.push(`step ${i}: type=${type} opts=${optCount} next=${nextLabel}`);
  }

  out.log = log;
  out.final = (await page.evaluate(() => document.body.innerText)).slice(0, 300).replace(/\n/g, ' | ');
  out.hasCompletion = await page.getByText('CHÚC MỪNG BÉ HOÀN THÀNH!').count();
  return out;
}
