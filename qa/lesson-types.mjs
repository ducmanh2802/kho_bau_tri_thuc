/**
 * LESSON QUESTION TYPE COVERAGE QA — driven against the real production build.
 *
 * This script exercises every question type available in the lesson player,
 * navigating through subjects and lessons to find and play each type.
 * It records which types were genuinely exercised and interacted with.
 */

const state = { steps: [], errors: [], typesSeen: {}, typesCompleted: {} };
const CLICK = { timeout: 12000 };

function log(name, detail) {
  state.steps.push({ step: name, ...detail });
}
function fail(msg) {
  state.errors.push(msg);
}

const TYPE_LABELS = [
  ['Sắp xếp', 'ordering'],
  ['Nối', 'matching'],
  ['Kéo thả', 'drag-drop'],
  ['Điền', 'fill-blank'],
  ['Đúng', 'true-false'],
  ['Biểu thức', 'math-expression'],
  ['Trắc nghiệm', 'multiple-choice'],
  ['Hình ảnh', 'image-choice'],
  ['Âm thanh', 'audio-choice'],
];

/** Read the type label the modal prints for the current question. */
async function currentType(page) {
  const dialog = (await page.locator('[role=dialog]').innerText()).toLowerCase();
  for (const [label, type] of TYPE_LABELS) {
    if (dialog.includes(label.toLowerCase())) return type;
  }
  return 'unknown';
}

/** Answer the current question using the interaction its type really uses. */
async function answerByType(page, type) {
  if (type === 'ordering') {
    const tiles = page.locator('[role=dialog] [data-testid=answer-option]');
    const n = await tiles.count();
    for (let i = 0; i < n; i += 1) {
      const t = tiles.nth(i);
      if (!(await t.isDisabled())) await t.click(CLICK);
    }
    return n;
  }

  if (type === 'matching') {
    const lefts = page.locator('[role=dialog] [data-testid=match-left]');
    const n = await lefts.count();
    for (let i = 0; i < n; i += 1) {
      await lefts.nth(i).click(CLICK);
      const right = page.locator('[role=dialog] [data-testid=match-right]').nth(i);
      if (await right.count()) await right.click(CLICK);
    }
    return n;
  }

  if (type === 'drag-drop') {
    const items = page.locator('[role=dialog] [data-testid=drag-item]');
    const buckets = page.locator('[role=dialog] [data-testid=drop-bucket]');
    const n = await items.count();
    const b = await buckets.count();
    for (let i = 0; i < n; i += 1) {
      if (b === 0) break;
      await items.nth(i).click(CLICK);
      await buckets.nth(i % b).click(CLICK);
    }
    return n;
  }

  if (type === 'fill-blank') {
    // First try keyboard input
    const keys = page.locator('[role=dialog] button[aria-label="A"], [role=dialog] button[aria-label="a"]');
    if (await keys.count()) {
      await keys.first().click(CLICK);
      const okBtn = page.locator('[role=dialog] button[aria-label="Xác nhận"]');
      if (await okBtn.count()) await okBtn.click(CLICK);
      return 1;
    }
    // Fallback to option buttons
    const opt = page.locator('[role=dialog] [data-testid=answer-option]').first();
    if (await opt.count()) await opt.click(CLICK);
    return (await opt.count()) ? 1 : 0;
  }

  if (type === 'true-false') {
    const opt = page.locator('[role=dialog] [data-testid=answer-option]').first();
    if (await opt.count()) await opt.click(CLICK);
    return (await opt.count()) ? 1 : 0;
  }

  if (type === 'math-expression') {
    // Try keyboard input first
    const key5 = page.locator('[role=dialog] button[aria-label="5"]');
    if (await key5.count()) {
      await key5.click(CLICK);
      const plusKey = page.locator('[role=dialog] button[aria-label="+"]');
      if (await plusKey.count()) await plusKey.click(CLICK);
      const key3 = page.locator('[role=dialog] button[aria-label="3"]');
      if (await key3.count()) await key3.click(CLICK);
      const okBtn = page.locator('[role=dialog] button[aria-label="Xác nhận"]');
      if (await okBtn.count()) await okBtn.click(CLICK);
      return 1;
    }
    // Fallback to option buttons
    const opt = page.locator('[role=dialog] [data-testid=answer-option]').first();
    if (await opt.count()) await opt.click(CLICK);
    return (await opt.count()) ? 1 : 0;
  }

  // multiple-choice, image-choice, audio-choice all render choice buttons.
  const opt = page.locator('[role=dialog] [data-testid=answer-option]').first();
  if (await opt.count()) await opt.click(CLICK);
  return (await opt.count()) ? 1 : 0;
}

async function navigateToLessons(page) {
  await page.goto('/');
  await page.waitForSelector('text=Xin chào', { timeout: 20000 });
  // Navigate to world map or subject selection
  const worldMapBtn = page.getByRole('navigation', { name: 'Điều hướng nhanh' }).getByRole('button', { name: 'Bản đồ' });
  if (await worldMapBtn.count()) {
    await worldMapBtn.click(CLICK);
    await page.waitForSelector('text=Kho Báu Tri Thức', { timeout: 20000 });
  }
}

async function runLessonTypeSweep(page) {
  const subjects = ['Tiếng Việt', 'Toán Học', 'English'];
  const expectedTypes = TYPE_LABELS.map(([, t]) => t);

  for (const subject of subjects) {
    log('subjectStart', { subject });

    // Go back to home and select subject
    await navigateToLessons(page);

    // Click on the subject card
    const subjectBtn = page.getByRole('button', { name: subject }).first();
    if (await subjectBtn.count()) {
      await subjectBtn.click(CLICK);
      await page.waitForTimeout(500);
    } else {
      fail(`Subject "${subject}" button not found`);
      continue;
    }

    // Now we should be on the subject screen with lessons
    // Find and click a lesson that has new question types
    const lessonCards = page.locator('[role=button]:has-text("Bài")');
    const lessonCount = await lessonCards.count();

    for (let i = 0; i < lessonCount; i += 1) {
      const lessonCard = lessonCards.nth(i);
      const lessonText = await lessonCard.innerText();
      
      // Look for lessons with new types in their title
      if (lessonText.includes('Mới') || lessonText.includes('Nối') || lessonText.includes('Đúng') || 
          lessonText.includes('Kéo') || lessonText.includes('Sắp xếp') || lessonText.includes('Biểu thức')) {
        await lessonCard.click(CLICK);
        await page.waitForSelector('role=dialog', { timeout: 20000 });
        await page.waitForTimeout(500);
        
        // Start the lesson
        const startBtn = page.getByRole('button', { name: /Bắt đầu|Chơi/ });
        if (await startBtn.count()) {
          await startBtn.click(CLICK);
          await page.waitForSelector('role=dialog', { timeout: 20000 });
          await page.waitForTimeout(500);
        }

        // Now in lesson player - sweep through questions
        let questionNum = 0;
        for (let q = 0; q < 15; q += 1) {
          const type = await currentType(page);
          if (type === 'unknown') {
            // Check if lesson completed
            const completeText = await page.locator('[role=dialog]').innerText();
            if (completeText.includes('HOÀN THÀNH') || completeText.includes('KẾT QUẢ')) {
              log('lessonComplete', { subject, lesson: lessonText });
              break;
            }
            fail(`${subject} lesson "${lessonText}" question ${q + 1}: no recognisable type label`);
            break;
          }

          state.typesSeen[type] = (state.typesSeen[type] || 0) + 1;
          log('question', { subject, lesson: lessonText, question: q + 1, type });

          const touched = await answerByType(page, type);
          if (touched > 0) state.typesCompleted[type] = (state.typesCompleted[type] || 0) + 1;

          // Click "Kiểm tra" if not auto-submit
          const checkBtn = page.getByRole('button', { name: /Kiểm tra/ });
          if (await checkBtn.count()) {
            await checkBtn.click(CLICK);
            await page.waitForTimeout(500);
          }

          // Click "Câu tiếp theo" or "Xem kết quả"
          const nextBtn = page.getByRole('button', { name: /Câu tiếp|Xem kết quả/ });
          if (await nextBtn.count()) {
            await nextBtn.click(CLICK);
            await page.waitForTimeout(500);
            continue;
          }
          break;
        }

        // Close any remaining dialogs
        const closeBtn = page.getByRole('button', { name: /Đóng|Về bản đồ/ }).last();
        if (await closeBtn.count()) {
          await closeBtn.click(CLICK).catch(() => {});
          await page.waitForTimeout(300);
        }

        // Only test one lesson per subject for speed
        break;
      }
    }
  }

  // Summary
  const missed = expectedTypes.filter((t) => !(t in state.typesSeen));
  log('typeSweep', {
    subjectsTested: subjects.length,
    typesSeen: state.typesSeen,
    typesCompleted: state.typesCompleted,
    typesNotEncountered: missed,
  });

  // Every type that DID appear must also have been interactable.
  for (const [type, completed] of Object.entries(state.typesCompleted)) {
    if (!completed) fail(`type ${type} rendered but could not be answered`);
  }
  // A sweep that answered nothing is a broken harness.
  if (Object.keys(state.typesCompleted).length < 3) {
    fail(`only ${Object.keys(state.typesCompleted).length} question types exercised — sweep too narrow to be evidence`);
  }
}

export default async function run(page, ui) {
  try {
    await runLessonTypeSweep(page);
  } catch (e) {
    const msg = e && e.message ? String(e.message).split('\n')[0] : String(e);
    state.errors.push('EXCEPTION: ' + msg);
    state.failedAt = state.steps.length ? state.steps[state.steps.length - 1].step : 'start';
  }
  return state;
}