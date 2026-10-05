export default async function run(page, ui) {
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('text=Xin chào', { timeout: 20000 });
  await page.getByRole('button', { name: /Tiếng Việt/ }).first().click({ timeout: 12000 });
  await page.waitForSelector('text=Vương Quốc Tiếng Việt', { timeout: 20000 });
  await page.getByRole('button', { name: /Vào học/ }).first().click({ timeout: 12000 });
  await page.waitForSelector('text=Câu hỏi 1', { timeout: 20000 });

  for (let i = 0; i < 12; i += 1) {
    const check = page.getByRole('button', { name: /Kiểm tra câu trả lời/ });
    if (!(await check.count())) break;
    const opt = page.locator('[data-testid=answer-option]').first();
    if (await opt.count()) await opt.click({ timeout: 12000 });
    await check.click({ timeout: 12000 });
    await page.waitForTimeout(100);
    const next = page.getByRole('button', { name: /Câu tiếp theo|Xem kết quả bài học/ });
    if (await next.count()) await next.first().click({ timeout: 12000 });
    await page.waitForTimeout(100);
    if (await page.getByText('CHÚC MỪNG BÉ HOÀN THÀNH!').count()) break;
  }

  const target = page.getByRole('button', { name: 'Về bản đồ' });
  const count = await target.count();
  const info = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find((x) => (x.textContent || '').trim() === 'Về bản đồ');
    if (!b) return { found: false };
    const r = b.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const top = document.elementFromPoint(cx, cy);
    const modal = document.querySelector('[role=dialog], .fixed.inset-0');
    return {
      found: true,
      rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      viewport: { w: window.innerWidth, h: window.innerHeight },
      centerPoint: { cx: Math.round(cx), cy: Math.round(cy) },
      topElementAtCenter: top ? top.tagName.toLowerCase() + '.' + String(top.className || '').slice(0, 70) : null,
      hasRoleDialog: !!document.querySelector('[role=dialog]'),
      modalZ: modal ? getComputedStyle(modal).zIndex : null,
      btnZ: getComputedStyle(b).zIndex,
    };
  });

  let clickErr = null;
  try {
    await target.click({ timeout: 6000 });
  } catch (e) {
    clickErr = String(e.message).split('\n').slice(0, 10).join(' || ');
  }

  return { count, info, clickErr };
}
