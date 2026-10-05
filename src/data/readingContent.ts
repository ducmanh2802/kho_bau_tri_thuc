import {
  ReadingQuestion,
  ReadingPassage,
  ReadingSkillDefinition,
  ReadingSkillId,
  ReadingStage,
} from '../types/reading';

/**
 * READING FLUENCY SKILL TAXONOMY (§6.1)
 *
 * Speed is tracked, but never used as a proxy for ability. Accuracy and
 * comprehension are the primary signals; fluency and speed are modifiers that
 * only become visible once accuracy is established.
 */
export const READING_SKILLS: ReadingSkillDefinition[] = [
  {
    skillId: 'RF-WORD-RECOGNITION',
    skillName: 'Nhận Diện Từ',
    category: 'ACCURACY',
    stage: 'ACCURACY',
    description: 'Đọc và nhận ra đúng từ đơn, kể cả từ có dấu thanh.',
  },
  {
    skillId: 'RF-SYLLABLE-FLUENCY',
    skillName: 'Ghép Âm Đều Nhịp',
    category: 'ACCURACY',
    stage: 'ACCURACY',
    description: 'Đọc đúng tiếng theo từng âm tiết một cách rõ ràng.',
  },
  {
    skillId: 'RF-READ-ALOUD-ACCURACY',
    skillName: 'Đọc To Chính Xác',
    category: 'ACCURACY',
    stage: 'ACCURACY',
    description: 'Đọc to câu văn đúng từng chữ, không bỏ sót, không thêm tiếng.',
  },
  {
    skillId: 'RF-PHRASE-FLUENCY',
    skillName: 'Đọc Cụm Từ',
    category: 'FLUENCY',
    stage: 'FLUENCY',
    description: 'Đọc liền mạch các cụm từ quen thuộc trong một nhịp thở.',
  },
  {
    skillId: 'RF-SENTENCE-FLUENCY',
    skillName: 'Đọc Câu Mạch Lạc',
    category: 'FLUENCY',
    stage: 'FLUENCY',
    description: 'Đọc trọn câu có chủ ngữ và vị ngữ rõ ràng, không ngập ngừng giữa chừng.',
  },
  {
    skillId: 'RF-PUNCTUATION-PAUSE',
    skillName: 'Ngắt Hơi Theo Dấu Câu',
    category: 'FLUENCY',
    stage: 'FLUENCY',
    description: 'Biết dừng lại đúng chỗ khi gặp dấu chấm, phẩy, chấm hỏi.',
  },
  {
    skillId: 'RF-READ-ALOUD-SPEED',
    skillName: 'Đọc Nhanh Mà Rõ',
    category: 'FLUENCY',
    stage: 'PROCESSING_SPEED',
    description: 'Tăng tốc độ đọc mà vẫn giữ độ chính xác cao.',
  },
  {
    skillId: 'RF-READING-COMPREHENSION',
    skillName: 'Hiểu Nội Dung Đoạn Đọc',
    category: 'COMPREHENSION',
    stage: 'COMPREHENSION',
    description: 'Hiểu ai làm gì, ở đâu, khi nào, vì sao và như thế nào trong đoạn văn.',
  },
  {
    skillId: 'RF-KEYWORD-FINDING',
    skillName: 'Tìm Từ Khóa',
    category: 'COMPREHENSION',
    stage: 'COMPREHENSION',
    description: 'Tìm nhanh từ trong đoạn văn chứa thông tin cần thiết.',
  },
  {
    skillId: 'RF-QUESTION-UNDERSTANDING',
    skillName: 'Hiểu Câu Hỏi',
    category: 'PROCESSING_SPEED',
    stage: 'PROCESSING_SPEED',
    description: 'Đọc câu hỏi và xác định đúng thông tin cần tìm trước khi chọn đáp án.',
  },
  {
    skillId: 'RF-ANSWER-SELECTION-SPEED',
    skillName: 'Chọn Đáp Án Nhanh',
    category: 'PROCESSING_SPEED',
    stage: 'COMPETITION_SPEED',
    description: 'Chọn đáp án đúng nhanh chóng sau khi đã hiểu câu hỏi.',
  },
];

export function getReadingSkillById(id: string): ReadingSkillDefinition | undefined {
  return READING_SKILLS.find((s) => s.skillId === id);
}

/**
 * ORIGINAL READING PASSAGES written for this application.
 *
 * These are NOT copied from any official exam paper. They are short, original
 * Grade-1 texts with a picture bank so pre-readers can decode meaning first.
 */
export const READING_PASSAGES: ReadingPassage[] = [
  {
    id: 'rp-sun-morning',
    title: 'Buổi Sáng Của Bé',
    level: 1,
    subject: 'tieng-viet',
    mediaEmoji: '🌅',
    paragraphs: [
      'Nắng sớm chiếu qua cửa sổ.',
      'Bé Lan đánh răng, rửa mặt và mặc đồng phục.',
      'Mẹ cho Bé ăn cháo rồi đưa Bé đến trường.',
    ],
    pictureBank: [
      { emoji: '🌞', label: 'nắng sớm' },
      { emoji: '🪥', label: 'đánh răng' },
      { emoji: '🍚', label: 'ăn cháo' },
      { emoji: '🎒', label: 'đến trường' },
    ],
    questionIds: ['rq-01-1', 'rq-01-2', 'rq-01-3', 'rq-01-4'],
    wordCount: 24,
  },
  {
    id: 'rp-birds-nest',
    title: 'Chim Và Tổ',
    level: 1,
    subject: 'tieng-viet',
    mediaEmoji: '🐦',
    paragraphs: [
      'Trên cành cây, có một chiếc tổ nhỏ.',
      'Đó là tổ của gia đình chim sẻ.',
      'Chim bố và chim mẹ lấy cỏ khô và lông mềm để làm tổ.',
      'Sáng sớm, chim sẻ kêu líu lo khi đi kiếm ăn.',
    ],
    pictureBank: [
      { emoji: '🌳', label: 'cành cây' },
      { emoji: '🪹', label: 'tổ' },
      { emoji: '🌾', label: 'cỏ khô' },
      { emoji: '🐣', label: 'chim non' },
    ],
    questionIds: ['rq-02-1', 'rq-02-2', 'rq-02-3', 'rq-02-4'],
    wordCount: 32,
  },
  {
    id: 'rp-rain-puddle',
    title: 'Mưa Rào',
    level: 2,
    subject: 'tieng-viet',
    mediaEmoji: '🌧️',
    paragraphs: [
      'Trưa hôm, mây đen kéo đến che kín mặt trời.',
      'Mưa rào lại rào, hạt nước lăn trên mái nhà.',
      'Bé chạy ra sân, đưa tay hứng mưa rồi cười toe toét.',
      'Sau cơn mưa, vũng nước nhỏ lấp loáng dưới nắng.',
    ],
    pictureBank: [
      { emoji: '☁️', label: 'mây đen' },
      { emoji: '🌧️', label: 'mưa rào' },
      { emoji: '🤲', label: 'hứng mưa' },
      { emoji: '🌈', label: 'nắng sau mưa' },
    ],
    questionIds: ['rq-03-1', 'rq-03-2', 'rq-03-3', 'rq-03-4'],
    wordCount: 36,
  },
  {
    id: 'rp-helping-mother',
    title: 'Bé Giúp Mẹ',
    level: 2,
    subject: 'tieng-viet',
    mediaEmoji: '🧹',
    paragraphs: [
      'Cuối tuần, mẹ dọn nhà thấy tấm thảm bị bẩn.',
      'Bé Liên hỏi: "Mẹ ơi, con giúp mẹ lau thảm nhé!"',
      'Bé lấy khăn ướt lau dọc theo sọc của thảm.',
      'Mẹ khen: "Con làm việc chăm chí quá!"',
    ],
    pictureBank: [
      { emoji: '🧹', label: 'dọn nhà' },
      { emoji: '🧽', label: 'lau thảm' },
      { emoji: '🧻', label: 'khăn ướt' },
      { emoji: '👍', label: 'chăm chỉ' },
    ],
    questionIds: ['rq-04-1', 'rq-04-2', 'rq-04-3', 'rq-04-4'],
    wordCount: 37,
  },
  {
    id: 'rp-school-garden',
    title: 'Vườn Trường',
    level: 3,
    subject: 'tieng-viet',
    mediaEmoji: '🌻',
    paragraphs: [
      'Góc sân trường có một vườn nhỏ do các lớp cùng chăm sóc.',
      'Lớp Một trồng cà chua, lớp Hai trồng ớt, lớp Ba trồng đậu.',
      'Mỗi sáng, học sinh tưới cây rồi ghi vào sổ tay nhận việc.',
      'Đến cuối tháng, vườn xanh tốt và ai cũng háo hức khoe rau của lớp mình.',
    ],
    pictureBank: [
      { emoji: '🍅', label: 'cà chua' },
      { emoji: '🌶️', label: 'ớt' },
      { emoji: '🫘', label: 'đậu' },
      { emoji: '📓', label: 'sổ tay' },
    ],
    questionIds: ['rq-05-1', 'rq-05-2', 'rq-05-3', 'rq-05-4'],
    wordCount: 43,
  },
];

export function getReadingPassageById(id: string): ReadingPassage | undefined {
  return READING_PASSAGES.find((p) => p.id === id);
}

export function getPassagesByLevel(level: 1 | 2 | 3): ReadingPassage[] {
  return READING_PASSAGES.filter((p) => p.level === level);
}

/**
 * READING ITEMS — one per passage per stage, mixing word/accuracy work,
 * fluency work, comprehension (who/what/where/when/why/how), keyword finding
 * and question-understanding items.
 */
export const READING_QUESTIONS: ReadingQuestion[] = [
  // ---------- rp-sun-morning (level 1) ----------
  {
    id: 'rq-01-1',
    passageId: 'rp-sun-morning',
    subject: 'tieng-viet',
    skillId: 'RF-WORD-RECOGNITION',
    questionType: 'word-recognition',
    difficulty: 1,
    prompt: 'Đọc to từ này giúp mình nhé:',
    stimulus: 'trường',
    mediaEmoji: '🎒',
    options: ['trường', 'trương', 'trèng', 'trưởng'],
    correctAnswer: 'trường',
    wordCount: 1,
    explanation: '"Trường" là nơi bé đến học chung với các bạn. Tiếng ương trong "trường" nghe như tiếng "iêu" nhẹ.',
    estimatedSeconds: 12,
  },
  {
    id: 'rq-01-2',
    passageId: 'rp-sun-morning',
    subject: 'tieng-viet',
    skillId: 'RF-SYLLABLE-FLUENCY',
    questionType: 'syllable-clap',
    difficulty: 1,
    prompt: 'Từ này có mấy tiếng? Bé đếm tiếng cho mình nhé:',
    stimulus: 'nắng',
    options: ['1 tiếng', '2 tiếng', '3 tiếng', '4 tiếng'],
    correctAnswer: '1 tiếng',
    wordCount: 1,
    explanation: '"Nắng" là tiếng đơn vì chỉ có một âm: n + ắ + ng.',
    estimatedSeconds: 12,
  },
  {
    id: 'rq-01-3',
    passageId: 'rp-sun-morning',
    subject: 'tieng-viet',
    skillId: 'RF-READING-COMPREHENSION',
    questionType: 'comprehension-who',
    difficulty: 1,
    prompt: 'Ai đánh răng và mặc đồng phục trong đoạn đọc?',
    options: ['Bé Lan', 'Bé Mít', 'Cô giáo', 'Mẹ'],
    correctAnswer: 'Bé Lan',
    wordCount: 3,
    explanation: 'Đoạn đọc ghi: "Bé Lan đánh răng, rửa mặt và mặc đồng phục."',
    estimatedSeconds: 25,
  },
  {
    id: 'rq-01-4',
    passageId: 'rp-sun-morning',
    subject: 'tieng-viet',
    skillId: 'RF-KEYWORD-FINDING',
    questionType: 'keyword-finding',
    difficulty: 2,
    prompt: 'Từ nào trong đoạn đọc chỉ đồ ăn sáng?',
    options: ['cháo', 'đồng phục', 'cửa sổ', 'trường'],
    correctAnswer: 'cháo',
    wordCount: 1,
    explanation: 'Câu "Mẹ cho Bé ăn cháo" cho biết món ăn sáng là cháo.',
    estimatedSeconds: 22,
  },

  // ---------- rp-birds-nest (level 1) ----------
  {
    id: 'rq-02-1',
    passageId: 'rp-birds-nest',
    subject: 'tieng-viet',
    skillId: 'RF-PHRASE-FLUENCY',
    questionType: 'phrase-repeat',
    difficulty: 1,
    prompt: 'Đọc cụm từ này thật mượt nhé:',
    stimulus: 'cành cây',
    options: ['cành cây', 'cành cảy', 'cánh cây', 'cang cây'],
    correctAnswer: 'cành cây',
    wordCount: 2,
    explanation: '"Cành cây" là chỗ trên cao có cành để chim đậu và làm tổ.',
    estimatedSeconds: 12,
  },
  {
    id: 'rq-02-2',
    passageId: 'rp-birds-nest',
    subject: 'tieng-viet',
    skillId: 'RF-READING-COMPREHENSION',
    questionType: 'comprehension-where',
    difficulty: 1,
    prompt: 'Chiếc tổ chim sẻ nằm ở đâu?',
    options: ['trên cành cây', 'dưới gốc cây', 'trong nhà', 'trên bờ hồ'],
    correctAnswer: 'trên cành cây',
    wordCount: 2,
    explanation: 'Câu đầu tiên: "Trên cành cây, có một chiếc tổ nhỏ."',
    estimatedSeconds: 22,
  },
  {
    id: 'rq-02-3',
    passageId: 'rp-birds-nest',
    subject: 'tieng-viet',
    skillId: 'RF-READING-COMPREHENSION',
    questionType: 'comprehension-what',
    difficulty: 2,
    prompt: 'Chim bố và chim mẹ dùng gì để làm tổ?',
    options: ['cỏ khô và lông mềm', 'lá cây và dây', 'đất và sỏi', 'vải và len'],
    correctAnswer: 'cỏ khô và lông mềm',
    wordCount: 4,
    explanation: 'Câu thứ ba: "Chim bố và chim mẹ lấy cỏ khô và lông mềm để làm tổ."',
    estimatedSeconds: 25,
  },
  {
    id: 'rq-02-4',
    passageId: 'rp-birds-nest',
    subject: 'tieng-viet',
    skillId: 'RF-PUNCTUATION-PAUSE',
    questionType: 'punctuation-pause',
    difficulty: 1,
    prompt: 'Chỗ nào trong câu này phải nghỉ hơi một chút khi đọc?',
    stimulus: 'Trời vừa rạng sáng, trời sáng rõ.',
    options: ['sau chữ "sáng"', 'sau chữ "Trời"', 'sau chữ "vừa"', 'ở cuối câu thứ nhất'],
    correctAnswer: 'sau chữ "sáng"',
    wordCount: 6,
    explanation: 'Dấu phẩy nằm ngay sau chữ "sáng", nên đến đó bé dừng hơi một nhịp rồi đọc tiếp.',
    estimatedSeconds: 25,
  },

  // ---------- rp-rain-puddle (level 2) ----------
  {
    id: 'rq-03-1',
    passageId: 'rp-rain-puddle',
    subject: 'tieng-viet',
    skillId: 'RF-SENTENCE-FLUENCY',
    questionType: 'sentence-order',
    difficulty: 2,
    prompt: 'Bé dựng lại câu cho đúng ngữ pháp:',
    stimulus: 'Sau cơn mưa, vũng nước nhỏ lấp loáng dưới nắng.',
    options: [
      'Sau cơn mưa, vũng nước nhỏ lấp loáng dưới nắng.',
      'vũng nước nhỏ Sau cơn mưa, lấp loáng dưới nắng.',
      'lấp loáng dưới nắng, vũng nước nhỏ Sau cơn mưa.',
      'Sau mưa cơn, nước nhỏ vũng lấp loáng dưới nắng.',
    ],
    correctAnswer: 'Sau cơn mưa, vũng nước nhỏ lấp loáng dưới nắng.',
    wordCount: 9,
    explanation: 'Câu bắt đầu bằng cụm "Sau cơn mưa," rồi đến chủ ngữ "vũng nước nhỏ", cuối cùng là vị ngữ "lấp loáng dưới nắng".',
    estimatedSeconds: 28,
  },
  {
    id: 'rq-03-2',
    passageId: 'rp-rain-puddle',
    subject: 'tieng-viet',
    skillId: 'RF-READING-COMPREHENSION',
    questionType: 'comprehension-when',
    difficulty: 2,
    prompt: 'Cơn mưa trong đoạn đọc rơi vào lúc nào?',
    options: ['trưa hôm', 'sáng sớm', 'chiều tà', 'nửa đêm'],
    correctAnswer: 'trưa hôm',
    wordCount: 2,
    explanation: 'Câu đầu: "Trưa hôm, mây đen kéo đến che kín mặt trời."',
    estimatedSeconds: 24,
  },
  {
    id: 'rq-03-3',
    passageId: 'rp-rain-puddle',
    subject: 'tieng-viet',
    skillId: 'RF-QUESTION-UNDERSTANDING',
    questionType: 'question-meaning',
    difficulty: 2,
    prompt: 'Câu hỏi "Bé chạy ra sân để làm gì?" muốn tìm thông tin gì?',
    options: ['Việc bé làm', 'Nơi bé ở', 'Bé thích món gì', 'Thời gian bé dậy'],
    correctAnswer: 'Việc bé làm',
    wordCount: 3,
    explanation: '"Để làm gì" là câu hỏi tìm hành động, nên bé tìm đoạn nói bé chạy ra hứng mưa.',
    estimatedSeconds: 26,
  },
  {
    id: 'rq-03-4',
    passageId: 'rp-rain-puddle',
    subject: 'tieng-viet',
    skillId: 'RF-READING-COMPREHENSION',
    questionType: 'comprehension-how',
    difficulty: 3,
    prompt: 'Bé cảm thấy thế nào khi hứng được nước mưa?',
    options: ['Vui vẻ, cười toe toét', 'Buồn, khóc', 'Sợ hãi', 'Buồn ngủ'],
    correctAnswer: 'Vui vẻ, cười toe toét',
    wordCount: 3,
    explanation: 'Đoạn đọc viết Bé "cười toe toét", đó là dấu hiệu Bé rất vui.',
    estimatedSeconds: 25,
  },

  // ---------- rp-helping-mother (level 2) ----------
  {
    id: 'rq-04-1',
    passageId: 'rp-helping-mother',
    subject: 'tieng-viet',
    skillId: 'RF-READ-ALOUD-ACCURACY',
    questionType: 'read-aloud',
    difficulty: 2,
    prompt: 'Đọc to câu này cho mình nghe nào!',
    stimulus: 'Bé Liên hỏi: Mẹ ơi, con giúp mẹ lau thảm nhé!',
    options: [
      'Bé Liên hỏi: Mẹ ơi, con giúp mẹ lau thảm nhé!',
      'Bé Liên hỏi: Mẹ ơi, con giúp mẹ lau thảm nhẹ!',
      'Bé Liên hỏi: Mẹ ơi, con giúp mẹ lâu thảm nhé!',
      'Bé Liên hở: Mẹ ơi, con giúp mẹ lau thảm nhé!',
    ],
    correctAnswer: 'Bé Liên hỏi: Mẹ ơi, con giúp mẹ lau thảm nhé!',
    targetText: 'Bé Liên hỏi: Mẹ ơi, con giúp mẹ lau thảm nhé!',
    wordCount: 10,
    explanation: 'Câu đúng là "Bé Liên hỏi: Mẹ ơi, con giúp mẹ lau thảm nhé!"',
    estimatedSeconds: 25,
  },
  {
    id: 'rq-04-2',
    passageId: 'rp-helping-mother',
    subject: 'tieng-viet',
    skillId: 'RF-READING-COMPREHENSION',
    questionType: 'comprehension-who',
    difficulty: 1,
    prompt: 'Trong đoạn đọc, ai là người lau thảm?',
    options: ['Bé Liên', 'Bé Lan', 'Mẹ', 'Cô giáo'],
    correctAnswer: 'Bé Liên',
    wordCount: 2,
    explanation: 'Câu: "Bé lấy khăn ướt lau dọc theo sọc của thảm." Đó là hành động của Bé Liên.',
    estimatedSeconds: 22,
  },
  {
    id: 'rq-04-3',
    passageId: 'rp-helping-mother',
    subject: 'tieng-viet',
    skillId: 'RF-KEYWORD-FINDING',
    questionType: 'keyword-finding',
    difficulty: 2,
    prompt: 'Từ nào trong đoạn đọc chỉ dụng cụ để lau?',
    options: ['khăn ướt', 'thảm', 'nhà', 'sổ tay'],
    correctAnswer: 'khăn ướt',
    wordCount: 2,
    explanation: '"Khăn ướt" là dụng cụ bé dùng để lau thảm.',
    estimatedSeconds: 22,
  },
  {
    id: 'rq-04-4',
    passageId: 'rp-helping-mother',
    subject: 'tieng-viet',
    skillId: 'RF-READING-COMPREHENSION',
    questionType: 'comprehension-why',
    difficulty: 3,
    prompt: 'Vì sao mẹ khen Bé Liên?',
    options: ['Vì Bé làm việc chăm chí', 'Vì Bé hát hay', 'Vì Bé chạy nhanh', 'Vì Bé ngủ dậy sớm'],
    correctAnswer: 'Vì Bé làm việc chăm chí',
    wordCount: 4,
    explanation: 'Câu cuối: Mẹ khen "Con làm việc chăm chí quá!"',
    estimatedSeconds: 25,
  },

  // ---------- rp-school-garden (level 3) ----------
  {
    id: 'rq-05-1',
    passageId: 'rp-school-garden',
    subject: 'tieng-viet',
    skillId: 'RF-READ-ALOUD-SPEED',
    questionType: 'read-aloud',
    difficulty: 3,
    prompt: 'Đọc câu này thật nhanh nhưng vẫn rõ ràng nhé!',
    stimulus: 'Mỗi sáng, học sinh tưới cây rồi ghi vào sổ tay nhận việc.',
    options: [
      'Mỗi sáng, học sinh tưới cây rồi ghi vào sổ tay nhận việc.',
      'Mỗi sáng, học sinh tưới cây rồi ghi vào sổ nhận việc.',
      'Mỗi sáng, học sinh tưới cây rồi ghi sổ tay nhận việc.',
      'Mỗi sáng, học sinh tưới rồi ghi cây vào sổ tay nhận việc.',
    ],
    correctAnswer: 'Mỗi sáng, học sinh tưới cây rồi ghi vào sổ tay nhận việc.',
    targetText: 'Mỗi sáng, học sinh tưới cây rồi ghi vào sổ tay nhận việc.',
    wordCount: 12,
    explanation: 'Câu đúng là "Mỗi sáng, học sinh tưới cây rồi ghi vào sổ tay nhận việc."',
    estimatedSeconds: 22,
  },
  {
    id: 'rq-05-2',
    passageId: 'rp-school-garden',
    subject: 'tieng-viet',
    skillId: 'RF-ANSWER-SELECTION-SPEED',
    questionType: 'question-meaning',
    difficulty: 3,
    prompt: 'Chọn nhanh đáp án đúng: Lớp Hai trồng cây gì?',
    options: ['ớt', 'cà chua', 'đậu', 'bắp cải'],
    correctAnswer: 'ớt',
    wordCount: 2,
    explanation: 'Câu thứ hai: "Lớp Một trồng cà chua, lớp Hai trồng ớt, lớp Ba trồng đậu."',
    estimatedSeconds: 15,
  },
  {
    id: 'rq-05-3',
    passageId: 'rp-school-garden',
    subject: 'tieng-viet',
    skillId: 'RF-READING-COMPREHENSION',
    questionType: 'comprehension-what',
    difficulty: 3,
    prompt: 'Các bạn học sinh làm gì mỗi sáng ở vườn trường?',
    options: ['Tưới cây rồi ghi vào sổ tay', 'Thu hoạch rau rồi về nhà', 'Quét sân rồi ăn sáng', 'Đọc truyện dưới gốc cây'],
    correctAnswer: 'Tưới cây rồi ghi vào sổ tay',
    wordCount: 5,
    explanation: 'Câu thứ ba nói rõ học sinh tưới cây rồi ghi vào sổ tay nhận việc.',
    estimatedSeconds: 26,
  },
  {
    id: 'rq-05-4',
    passageId: 'rp-school-garden',
    subject: 'tieng-viet',
    skillId: 'RF-READING-COMPREHENSION',
    questionType: 'comprehension-how',
    difficulty: 3,
    prompt: 'Các lớp cùng chăm sóc vườn bằng cách nào?',
    options: ['Mỗi lớp trồng một loại rau khác nhau', 'Mỗi lớp tưới một giờ khác nhau', 'Chỉ lớp Một chăm vườn', 'Các lớp trồng chung một loài'],
    correctAnswer: 'Mỗi lớp trồng một loại rau khác nhau',
    wordCount: 6,
    explanation: 'Đoạn đọc liệt kê: lớp Một trồng cà chua, lớp Hai trồng ớt, lớp Ba trồng đậu — mỗi lớp một loại.',
    estimatedSeconds: 28,
  },
];

export function getReadingQuestionById(id: string): ReadingQuestion | undefined {
  return READING_QUESTIONS.find((q) => q.id === id);
}

export function getQuestionsByPassage(passageId: string): ReadingQuestion[] {
  return READING_QUESTIONS.filter((q) => q.passageId === passageId);
}

export function getQuestionsBySkill(skillId: ReadingSkillId): ReadingQuestion[] {
  return READING_QUESTIONS.filter((q) => q.skillId === skillId);
}

export function getQuestionsByStage(stage: ReadingStage): ReadingQuestion[] {
  return READING_QUESTIONS.filter(
    (q) => getReadingSkillById(q.skillId)?.stage === stage
  );
}

/** Question ids assigned to each ladder stage, in teaching order. */
export const READING_STAGE_ITEM_IDS: Record<ReadingStage, string[]> = (() => {
  const stages: Record<ReadingStage, string[]> = {
    ACCURACY: [],
    FLUENCY: [],
    COMPREHENSION: [],
    PROCESSING_SPEED: [],
    COMPETITION_SPEED: [],
  };
  for (const q of READING_QUESTIONS) {
    const stage = getReadingSkillById(q.skillId)?.stage;
    if (stage) stages[stage].push(q.id);
  }
  return stages;
})();
