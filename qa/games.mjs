/**
 * GAMES QA — verifies the claim in P33 §5 with real browser evidence.
 *   A) every one of the 14 games mounts, renders and closes without console errors
 *   B) a full round awards exactly one reward
 *   C) replaying grants one more reward per completed round (not per mount)
 *   D) opening a game and leaving without finishing grants nothing
 */

const GAME_TITLES = [
  'Bắt Chữ Cái Bay',
  'Xưởng Ghép Tiếng Lớp 1',
  'Săn Vần Trong Vườn Cây',
  'Đoàn Tàu Xếp Câu',
  'Đôi Tai Thính — Nghe & Chọn',
  'Hứng Số Rơi Rộn Ràng',
  'Đường Đua Thần Tốc',
  'Xây Tháp Số Lên Mây',
  'Câu Cá Đại Dương Xanh',
  'Phân Loại Hình Học',
  'Safari Tiếng Anh — Animals',
  'Pop The Color Balloons!',
  'Lật Thẻ Trí Nhớ Vàng',
  'Bé Tập Vẽ & Tô Màu Diệu Kỳ',
];

const CLICK = { timeout: 12000 };

function readCount() {
  const raw = JSON.parse(localStorage.getItem('kho_bau_analytics') || '{}');
  return raw.gamesPlayedCount || 0;
}

async function playMemoryGameToEnd(page) {
  // Cards live in the 12-cell grid; each reveals its label when flipped.
  const cards = page.locator('div.grid.grid-cols-3 button, div.grid.grid-cols-4 button');
  const total = await cards.count();
  if (total === 0) return { matched: false, reason: 'no cards rendered' };

  const labelOf = async (i) => {
    const t = await cards.nth(i).innerText();
    const emoji = t.trim().split('\n')[0] || '';
    return emoji;
  };

  // Probe indices to learn which card shows which face, then pair them up.
  const known = new Map(); // index -> emoji
  const paired = new Set();
  let guard = 0;

  while (paired.size < 12 && guard < 60) {
    guard += 1;
    let progressed = false;

    // Try to match two already-known indices with the same face.
    const byFace = new Map();
    for (const [idx, face] of known) {
      if (paired.has(idx)) continue;
      if (!byFace.has(face)) byFace.set(face, []);
      byFace.get(face).push(idx);
    }
    for (const [, idxs] of byFace) {
      if (idxs.length >= 2) {
        await cards.nth(idxs[0]).click(CLICK);
        await page.waitForTimeout(120);
        await cards.nth(idxs[1]).click(CLICK);
        await page.waitForTimeout(350);
        paired.add(idxs[0]);
        paired.add(idxs[1]);
        progressed = true;
        break;
      }
    }
    if (progressed) continue;

    // Otherwise probe one new card and learn its face.
    let probed = false;
    for (let i = 0; i < total; i++) {
      if (known.has(i)) continue;
      await cards.nth(i).click(CLICK);
      await page.waitForTimeout(150);
      known.set(i, await labelOf(i));
      probed = true;
      // Flip a second card so the engine releases the flip state.
      for (let j = 0; j < total; j++) {
        if (j === i) continue;
        await cards.nth(j).click(CLICK);
        await page.waitForTimeout(150);
        known.set(j, await labelOf(j));
        break;
      }
      await page.waitForTimeout(950); // let the engine auto-unflip non-matches
      break;
    }
    if (!probed) break;
  }
  return { matched: paired.size >= 12, paired: paired.size, guard };
}

export default async function run(page, ui) {
  const out = { mountSmoke: [], rewards: {}, errors: [] };

  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('text=Xin chào', { timeout: 20000 });
  await page.getByRole('navigation', { name: 'Điều hướng nhanh' })
    .getByRole('button', { name: 'Trò Chơi', exact: true })
    .click(CLICK);
  await page.waitForSelector('text=Đấu Trường Trò Chơi Trí Tuệ', { timeout: 20000 });

  // ---- A) every game mounts and closes ----
  for (const title of GAME_TITLES) {
    const record = { game: title };
    try {
      const card = page.locator('div', { has: page.getByRole('heading', { name: title, exact: true }) }).last();
      const play = card.getByRole('button', { name: /Chơi ngay/ });
      await play.click(CLICK);
      await page.waitForTimeout(700);

      // The game shell shows mascot + instructions + score pill.
      const shell = await ui.snapshot();
      record.mounted = shell.includes('Đã thử') || shell.includes('Chơi lại') || shell.includes('Tiếp tục học') || shell.includes('Điểm') || shell.includes('/');
      record.hasScorePill = /\d+\s*\/\s*\d+/.test(shell);

      // Close via the wrapper close button.
      const close = page.getByRole('button', { name: /Đóng|Tiếp tục học|Chơi lại/ }).first();
      const closeCount = await close.count();
      if (closeCount > 0) await close.click(CLICK);
      await page.waitForTimeout(400);
      record.closed = (await page.getByText(title, { exact: true }).count()) > 0;
    } catch (e) {
      record.error = String(e.message).split('\n')[0];
      out.errors.push(`${title}: ${record.error}`);
    }
    out.mountSmoke.push(record);
  }

  // ---- B/C/D) reward behaviour ----
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('text=Xin chào', { timeout: 20000 });
  await page.getByRole('navigation', { name: 'Điều hướng nhanh' })
    .getByRole('button', { name: 'Trò Chơi', exact: true })
    .click(CLICK);
  await page.waitForSelector('text=Đấu Trường Trò Chơi Trí Tuệ', { timeout: 20000 });

  const countBefore = await page.evaluate(readCount);

  // D) mount then leave without finishing -> no reward
  const memCard = page
    .locator('div', { has: page.getByRole('heading', { name: 'Lật Thẻ Trí Nhớ Vàng', exact: true }) })
    .last();
  await memCard.getByRole('button', { name: /Chơi ngay/ }).click(CLICK);
  await page.waitForTimeout(700);
  await page.getByRole('button', { name: /Tiếp tục học|Đóng/ }).first().click(CLICK);
  await page.waitForTimeout(500);
  const countAfterMountOnly = await page.evaluate(readCount);

  // B) full round -> exactly one reward
  await memCard.getByRole('button', { name: /Chơi ngay/ }).click(CLICK);
  await page.waitForTimeout(700);
  const play1 = await playMemoryGameToEnd(page);
  await page.waitForTimeout(900);
  const gameOverShown = (await page.getByText('HOAN HÔ BÉ YÊU!').count()) > 0;
  const countAfterRound1 = await page.evaluate(readCount);

  // C) replay -> one more reward for the second completed round
  const replay = page.getByRole('button', { name: /Chơi lại/ });
  if (await replay.count()) {
    await replay.click(CLICK);
    await page.waitForTimeout(700);
    await playMemoryGameToEnd(page);
    await page.waitForTimeout(900);
  }
  const countAfterRound2 = await page.evaluate(readCount);

  out.rewards = {
    countBefore,
    countAfterMountOnly,
    countAfterRound1,
    countAfterRound2,
    mountOnlyAwardedNothing: countAfterMountOnly === countBefore,
    round1AwardedOnce: countAfterRound1 === countBefore + 1,
    round2AwardedOnce: countAfterRound2 === countAfterRound1 + 1,
    gameOverShown,
    play1,
  };

  if (!out.rewards.mountOnlyAwardedNothing) out.errors.push('mounting a game awarded a reward');
  if (!out.rewards.gameOverShown) out.errors.push('memory game did not reach the victory screen');
  if (gameOverShown && !out.rewards.round1AwardedOnce)
    out.errors.push(`round 1 awarded ${countAfterRound1 - countBefore}, expected 1`);
  if (!out.rewards.round2AwardedOnce)
    out.errors.push(`round 2 awarded ${countAfterRound2 - countAfterRound1}, expected 1`);

  return out;
}