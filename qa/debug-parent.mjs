export default async function run(page, ui) {
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('text=Xin chào', { timeout: 20000 });
  await page.getByRole('navigation', { name: 'Điều hướng nhanh' }).getByRole('button', { name: 'Ba Mẹ', exact: true }).click({ timeout: 12000 }).catch(async () => {
    await page.getByRole('button', { name: 'Khu vực dành cho Ba Mẹ' }).click({ timeout: 12000 });
  });
  await page.waitForSelector('text=Cổng Xác Nhận Phụ Huynh', { timeout: 20000 });
  const gate = await page.evaluate(() => {
    const el = document.querySelector('.bg-slate-100.rounded-2xl');
    return el ? el.textContent.trim() : null;
  });
  const m = gate && gate.match(/(\d+)\s*\+\s*(\d+)/);
  await page.getByRole('spinbutton').fill(String(Number(m[1]) + Number(m[2])), { timeout: 12000 });
  await page.getByRole('button', { name: 'Mở Bảng Phụ Huynh' }).click({ timeout: 12000 });
  await page.waitForTimeout(1200);

  const modalCount = await page.locator('.fixed.inset-0.z-50').count();
  const modal = page.locator('.fixed.inset-0.z-50').last();
  const tabCount = await modal.getByRole('button', { name: 'Luyện Đọc', exact: true }).count();
  const btnNames = await modal.evaluate((el) => Array.from(el.querySelectorAll('button')).map(b => (b.getAttribute('aria-label') || b.textContent || '').trim().slice(0,24)).slice(0,24));
  return { modalCount, tabCount, btnNames };
}
