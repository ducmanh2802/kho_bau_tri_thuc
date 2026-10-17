export interface IoeQuestion {
  id: string;
  skill: string;
  difficulty: 1 | 2 | 3;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface IoeLesson {
  id: string;
  title: string;
  objective: string;
  vocab: { en: string; vi: string; emoji: string }[];
  questions: IoeQuestion[];
}

export interface IoeWeek {
  id: string;
  week: number;
  title: string;
  topics: string[];
  lessons: IoeLesson[];
}

export const IOE_WEEKS: IoeWeek[] = [
  {
    id: 'ioe-w1',
    week: 1,
    title: 'Tuần 1 — Ôn từ vựng cơ bản',
    topics: ['Colors', 'Numbers 1–10', 'School things', 'Animals'],
    lessons: [
      {
        id: 'ioe-w1-l1',
        title: 'Bài 1: Màu sắc và số đếm',
        objective: 'Nhận biết màu sắc và số 1–10.',
        vocab: [
          { en: 'red', vi: 'màu đỏ', emoji: '🔴' },
          { en: 'blue', vi: 'màu xanh', emoji: '🔵' },
          { en: 'green', vi: 'màu xanh lá', emoji: '🟢' },
          { en: 'one', vi: 'một', emoji: '1️⃣' },
          { en: 'two', vi: 'hai', emoji: '2️⃣' },
        ],
        questions: [
          { id: 'ioe-w1-l1-q1', skill: 'vocabulary', difficulty: 1, prompt: 'What color is this? 🔴', options: ['red', 'blue', 'green'], answer: 0, explanation: '🔴 là màu đỏ: red.' },
          { id: 'ioe-w1-l1-q2', skill: 'vocabulary', difficulty: 1, prompt: 'What number is this? 3', options: ['one', 'two', 'three'], answer: 2, explanation: '3 là three.' },
          { id: 'ioe-w1-l1-q3', skill: 'spelling', difficulty: 2, prompt: 'Chọn từ đúng chính tả:', options: ['blu', 'blue', 'bloo'], answer: 1, explanation: 'blue là cách viết đúng.' },
          { id: 'ioe-w1-l1-q4', skill: 'reading', difficulty: 2, prompt: 'I have two red apples. Có mấy quả táo?', options: ['1', '2', '3'], answer: 1, explanation: 'two = 2.' },
        ],
      },
      {
        id: 'ioe-w1-l2',
        title: 'Bài 2: Đồ dùng học tập và động vật',
        objective: 'Nhận biết đồ dùng và động vật.',
        vocab: [
          { en: 'book', vi: 'sách', emoji: '📘' },
          { en: 'pen', vi: 'bút', emoji: '🖊️' },
          { en: 'cat', vi: 'mèo', emoji: '🐱' },
          { en: 'dog', vi: 'chó', emoji: '🐶' },
        ],
        questions: [
          { id: 'ioe-w1-l2-q1', skill: 'vocabulary', difficulty: 1, prompt: 'What is this? 📘', options: ['book', 'pen', 'cat'], answer: 0, explanation: '📘 là book.' },
          { id: 'ioe-w1-l2-q2', skill: 'vocabulary', difficulty: 1, prompt: 'What is this? 🐱', options: ['dog', 'cat', 'book'], answer: 1, explanation: '🐱 là cat.' },
          { id: 'ioe-w1-l2-q3', skill: 'grammar', difficulty: 2, prompt: 'Choose the correct sentence:', options: ['This is a book.', 'This are a book.', 'This is an book.'], answer: 0, explanation: 'This is a book.' },
          { id: 'ioe-w1-l2-q4', skill: 'spelling', difficulty: 2, prompt: 'Điền chữ còn thiếu: d_g', options: ['o', 'a', 'u'], answer: 0, explanation: 'dog.' },
        ],
      },
    ],
  },
  {
    id: 'ioe-w2',
    week: 2,
    title: 'Tuần 2 — Đánh vần và nhận diện từ',
    topics: ['Family', 'Toys', 'Body parts', 'Ôn từ tuần 1'],
    lessons: [
      {
        id: 'ioe-w2-l1',
        title: 'Bài 1: Gia đình',
        objective: 'Nhận biết từ về gia đình.',
        vocab: [
          { en: 'mother', vi: 'mẹ', emoji: '👩' },
          { en: 'father', vi: 'bố', emoji: '👨' },
          { en: 'sister', vi: 'chị/em gái', emoji: '👧' },
          { en: 'brother', vi: 'anh/em trai', emoji: '👦' },
        ],
        questions: [
          { id: 'ioe-w2-l1-q1', skill: 'vocabulary', difficulty: 1, prompt: 'Who is this? 👩', options: ['father', 'mother', 'sister'], answer: 1, explanation: '👩 là mother.' },
          { id: 'ioe-w2-l1-q2', skill: 'grammar', difficulty: 2, prompt: 'Choose: ___ is my father.', options: ['He', 'She', 'It'], answer: 0, explanation: 'father dùng He.' },
          { id: 'ioe-w2-l1-q3', skill: 'spelling', difficulty: 2, prompt: 'Sắp xếp chữ cái: r e h t o m', options: ['mother', 'father', 'brother'], answer: 0, explanation: 'mother.' },
        ],
      },
    ],
  },
];

export function getAllIoeQuestions() {
  return IOE_WEEKS.flatMap((w) => w.lessons.flatMap((l) => l.questions));
}
