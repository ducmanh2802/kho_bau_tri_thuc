export default async function run(page, ui) {
  const out = {};
  await page.goto(ui.origin + '/');
  await page.waitForSelector('[data-testid="nav-home"]:visible', { timeout: 20000 });
  await page.getByRole('button', { name: /Tiếng Việt/ }).first().click({ timeout: 12000 });
  await page.waitForSelector('text=Vương Quốc Tiếng Việt', { timeout: 20000 });
  await page.waitForTimeout(1500);
  const first = page.locator('[data-testid^="lesson-button-"]').first();
  try {
    await first.click({ timeout: 6000 });
    out.plainClick = 'ok';
  } catch (e) {
    out.plainClick = String(e.message);
  }
  out.boxSamples = [];
  for (let i = 0; i < 6; i += 1) {
    out.boxSamples.push(await first.boundingBox());
    await page.waitForTimeout(120);
  }
  return out;
}
