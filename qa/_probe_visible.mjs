export default async function run(page, ui) {
  const out = {};
  try {
    await page.waitForSelector('[data-testid="nav-home"]:visible', { timeout: 4000 });
    out.visibleSelectorWorks = true;
  } catch {
    out.visibleSelectorWorks = false;
  }
  try {
    await page.locator('[data-testid="nav-home"]:visible').first().waitFor({ state: 'visible', timeout: 4000 });
    out.locatorVisibleWorks = true;
  } catch {
    out.locatorVisibleWorks = false;
  }
  out.count = await page.locator('[data-testid="nav-home"]').count();
  out.visibleCount = await page.locator('[data-testid="nav-home"]:visible').count();
  return out;
}
