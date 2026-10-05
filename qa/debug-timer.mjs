export default async function run(page, ui) {
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('text=Xin chào', { timeout: 20000 });

  await page.getByRole('button', { name: /^🏆 Đấu Trường/ }).first().click({ timeout: 12000 });
  await page.waitForSelector('text=Kho Báu Đấu Trường Tri Thức', { timeout: 20000 });
  await page.getByRole('button', { name: /Vào Thi Thử/ }).first().click({ timeout: 12000 });
  await page.waitForSelector('role=dialog', { timeout: 20000 });
  await page.waitForTimeout(1500);

  const dialogText = await page.locator('[role=dialog]').innerText();
  const timerInfo = await page.evaluate(() => {
    const el = document.querySelector('[role=timer]');
    if (!el) return { found: false };
    const cs = getComputedStyle(el);
    return {
      found: true,
      textContent: el.textContent,
      innerText: el.innerText,
      visibility: cs.visibility,
      display: cs.display,
      opacity: cs.opacity,
      rect: el.getBoundingClientRect().toJSON(),
    };
  });

  return {
    dialogFirstLines: dialogText.split('\n').slice(0, 14),
    timerInfo,
    bodyHasDigits: /\d\d:\d\d/.test(await page.evaluate(() => document.body.innerText)),
  };
}
