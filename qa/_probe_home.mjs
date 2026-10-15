export default async function run(page, ui) {
  const out = { consoleErrors: [], failedRequests: [], body: '', title: '' };
  page.on('console', (m) => {
    if (m.type() === 'error') out.consoleErrors.push(m.text());
  });
  page.on('requestfailed', (r) => out.failedRequests.push(`${r.url()} ${r.failure()?.errorText}`));
  page.on('response', (r) => {
    if (r.status() >= 400) out.failedRequests.push(`${r.status()} ${r.url()}`);
  });
  await page.goto(ui.origin + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  out.title = await page.title();
  out.body = (await page.evaluate(() => document.body.innerText)).slice(0, 3000);
  out.htmlLen = await page.evaluate(() => document.body.innerHTML.length);
  out.hasRoot = await page.evaluate(() => !!document.getElementById('root'));
  return out;
}
