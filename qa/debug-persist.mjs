function readProfile() {
  const raw = localStorage.getItem('kho_bau_child_profile');
  if (!raw) return { exists: false };
  const p = JSON.parse(raw);
  return {
    exists: true,
    xp: p.xp,
    lessons: (p.completedLessons || []).length,
    lastActiveDate: p.lastActiveDate,
  };
}

export default async function run(page) {
  const out = {};
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('text=Xin chào', { timeout: 20000 });
  out.afterClear = await page.evaluate(readProfile);

  await page.getByRole('button', { name: /Tiếng Việt/ }).first().click({ timeout: 15000 });
  await page.waitForSelector('text=Vương Quốc Tiếng Việt', { timeout: 20000 });
  await page.getByRole('button', { name: /Vào học/ }).first().click({ timeout: 15000 });
  await page.waitForSelector('text=Câu hỏi 1', { timeout: 20000 });

  for (let i = 0; i < 12; i += 1) {
    const check = page.getByRole('button', { name: /Kiểm tra câu trả lời/ });
    if (!(await check.count())) break;
    const opt = page.locator('[data-testid=answer-option]').first();
    if (await opt.count()) await opt.click({ timeout: 15000 });
    await check.click({ timeout: 15000 });
    await page.waitForTimeout(150);
    const next = page.getByRole('button', { name: /Câu tiếp theo|Xem kết quả bài học/ });
    if (await next.count()) await next.first().click({ timeout: 15000 });
    await page.waitForTimeout(150);
    if (await page.getByText('CHÚC MỪNG BÉ HOÀN THÀNH!').count()) break;
  }
  await page.waitForTimeout(600);
  out.afterLesson = await page.evaluate(readProfile);

  await page.reload();
  await page.waitForSelector('text=Xin chào', { timeout: 20000 });
  await page.waitForTimeout(600);
  out.afterReload = await page.evaluate(readProfile);
  out.lessonId = await page.evaluate(() => {
    const p = JSON.parse(localStorage.getItem('kho_bau_child_profile') || '{}');
    return (p.completedLessons || [])[0] || null;
  });
  return out;
}
