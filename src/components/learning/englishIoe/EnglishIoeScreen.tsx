import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { sound } from '../../../services/sound';
import { IOE_WEEKS, type IoeQuestion } from '../../../data/englishIoe';

export const EnglishIoeScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [weekIdx, setWeekIdx] = useState(0);
  const [lessonIdx, setLessonIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const week = IOE_WEEKS[weekIdx];
  const lesson = week.lessons[lessonIdx];
  const q: IoeQuestion = lesson.questions[qIdx];

  const resetLesson = () => {
    setQIdx(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  const handlePick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) {
      setScore((s) => s + 1);
      sound.playCorrect();
    } else {
      sound.playWrong();
    }
  };

  const next = () => {
    setPicked(null);
    if (qIdx + 1 >= lesson.questions.length) setDone(true);
    else setQIdx((i) => i + 1);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => { sound.playClick(); onBack(); }} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
        <h1 className="text-2xl font-black font-display text-slate-900">🇬🇧 Tiếng Anh IOE</h1>
      </div>

      <div className="flex gap-2 flex-wrap">
        {IOE_WEEKS.map((w, i) => (
          <button
            key={w.id}
            onClick={() => { sound.playClick(); setWeekIdx(i); setLessonIdx(0); resetLesson(); }}
            className={`px-3 py-1 rounded-xl font-bold text-sm ${weekIdx === i ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            Tuần {w.week}
          </button>
        ))}
      </div>

      <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 space-y-2">
        <div className="font-black text-slate-800">{week.title}</div>
        <div className="text-sm text-slate-500">{week.topics.join(' · ')}</div>
        <div className="flex gap-2 flex-wrap mt-2">
          {week.lessons.map((l, i) => (
            <button
              key={l.id}
              onClick={() => { sound.playClick(); setLessonIdx(i); resetLesson(); }}
              className={`px-3 py-1 rounded-xl font-bold text-sm ${lessonIdx === i ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-700'}`}
            >
              {l.title}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 space-y-3">
        <div className="font-black text-slate-800">{lesson.title}</div>
        <div className="text-sm text-slate-600">{lesson.objective}</div>
        <div className="flex gap-2 flex-wrap">
          {lesson.vocab.map((v) => (
            <span key={v.en} className="px-2 py-1 bg-slate-100 rounded-lg text-sm font-bold">{v.emoji} {v.en} — {v.vi}</span>
          ))}
        </div>
      </div>

      {!done ? (
        <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 space-y-3">
          <div className="text-sm font-bold text-slate-500">Câu {qIdx + 1}/{lesson.questions.length} · Điểm: {score}</div>
          <h3 className="font-black text-lg">{q.prompt}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {q.options.map((opt, i) => {
              const isCorrect = picked !== null && i === q.answer;
              const isWrong = picked === i && i !== q.answer;
              return (
                <button
                  key={opt}
                  onClick={() => handlePick(i)}
                  disabled={picked !== null}
                  className={`p-3 rounded-xl border-2 font-bold flex items-center gap-2 ${isCorrect ? 'border-emerald-500 bg-emerald-50' : isWrong ? 'border-rose-500 bg-rose-50' : 'border-slate-200 bg-white'}`}
                >
                  {picked !== null && (isCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : isWrong ? <XCircle className="w-5 h-5 text-rose-600" /> : null)}
                  {opt}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <div className="space-y-2">
              <div className="text-sm text-slate-600">{q.explanation}</div>
              <button onClick={next} className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl">Tiếp theo →</button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-2 text-center">
          <div className="text-2xl font-black">Hoàn thành bài!</div>
          <div className="font-bold text-emerald-700">Điểm: {score}/{lesson.questions.length}</div>
          <button onClick={resetLesson} className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl">Làm lại</button>
        </div>
      )}
    </div>
  );
};

export default EnglishIoeScreen;
