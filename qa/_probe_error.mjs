/** T20A scratch: reproduce the React #310 pageerror against the DEV server (real stack). */
import path from 'node:path';
import { spawn } from 'node:child_process';

const port = Number(process.env.PORT || 5199);
const origin = `http://localhost:${port}`;
const viteBin = path.resolve('node_modules/vite/bin/vite.js');
const server = spawn(process.execPath, [viteBin, '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { stdio: 'ignore' });

async function waitFor() {
  const start = Date.now();
  for (;;) {
    try {
      const r = await fetch(origin);
      if (r.ok) return;
    } catch {}
    if (Date.now() - start > 90000) throw new Error('dev server did not start');
    await new Promise((r) => setTimeout(r, 500));
  }
}

let browser;
try {
  await waitFor();
  const { chromium } = await import('playwright');
  browser = await chromium.launch({
    executablePath: 'C:/Users/Windows/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe',
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('[console] ' + m.text().slice(0, 600));
  });
  page.on('pageerror', (e) => errors.push('[page] ' + String(e.stack || e).slice(0, 1500)));

  await page.goto(origin + '/', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid="nav-home"]:visible', { timeout: 30000 });
  await page.getByRole('button', { name: /Tiếng Việt/ }).first().click({ timeout: 12000 });
  await page.waitForSelector('text=Vương Quốc Tiếng Việt', { timeout: 20000 });
  await page.waitForTimeout(1000);
  await page.locator('[data-testid^="lesson-button-"]').first().focus();
  await page.keyboard.press('Enter');
  await page.waitForSelector('[role=dialog]', { timeout: 20000 });
  await page.getByRole('button', { name: /Bắt đầu/ }).first().click({ timeout: 8000 });
  await page.waitForSelector('text=Câu hỏi 1', { timeout: 20000 });

  for (let i = 0; i < 14; i += 1) {
    const checkBtn = page.getByRole('button', { name: /Kiểm tra câu trả lời/ });
    if (!(await checkBtn.count())) break;
    const opt = page.locator('[data-testid=answer-option]').first();
    if (await opt.count()) await opt.click({ timeout: 8000 });
    await checkBtn.click({ timeout: 8000 });
    await page.waitForTimeout(200);
    const next = page.getByRole('button', { name: /Câu tiếp theo|Xem kết quả bài học/ });
    if (await next.count()) await next.first().click({ timeout: 8000 });
    await page.waitForTimeout(200);
    const body = await page.evaluate(() => document.body.innerText.slice(0, 200));
    console.log(`--- step ${i}: ${body.replace(/\n/g, ' | ').slice(0, 160)}`);
  }

  await page.waitForTimeout(1500);
  const finalText = await page.evaluate(() => document.body.innerText.slice(0, 400));
  console.log('FINAL:', finalText.replace(/\n/g, ' | '));
  console.log('ERRORS:', JSON.stringify(errors, null, 1).slice(0, 3000));
} finally {
  if (browser) await browser.close().catch(() => {});
  server.kill();
}
