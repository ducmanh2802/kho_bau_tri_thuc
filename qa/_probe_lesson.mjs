export default async function run(page, ui) {
  const out = {};
  await page.evaluate(() => localStorage.clear());
  await page.goto(ui.origin + '/');
  await page.waitForSelector('[data-testid="nav-home"]:visible', { timeout: 20000 });
  await page.getByRole('button', { name: /Tieng Viet|Tiếng Việt/ }).first().click({ timeout: 12000 });
  await page.waitForSelector('text=Vương Quốc Tiếng Việt', { timeout: 20000 });
  await page.waitForTimeout(1200);
  const btn = page.locator('[data-testid^="lesson-button-"]').first();
  out.count = await page.locator('[data-testid^="lesson-button-"]').count();
  const box = await btn.boundingBox();
  out.box = box;
  out.hitTest = await page.evaluate(({ x, y }) => {
    const el = document.elementFromPoint(x, y);
    const chain = [];
    let node = el;
    while (node && chain.length < 6) {
      chain.push({
        tag: node.tagName,
        id: node.id,
        testid: node.getAttribute && node.getAttribute('data-testid'),
        cls: node.className && String(node.className).slice(0, 90),
      });
      node = node.parentElement;
    }
    return chain;
  }, { x: box.x + box.width / 2, y: box.y + box.height / 2 });
  out.visible = await btn.isVisible();
  out.enabled = await btn.isEnabled();
  out.label = await btn.getAttribute('aria-label');
  return out;
}
