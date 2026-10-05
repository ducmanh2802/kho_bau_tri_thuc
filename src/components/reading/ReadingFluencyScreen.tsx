import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReadingMetrics,
  ReadingPassage,
  ReadingQuestion,
  ReadingResponse,
  ReadingSessionResult,
  ReadingStage,
} from '../../types/reading';
import { ReadingEngine } from '../../services/readingEngine';
import { READING_POLICY } from '../../config/policy';
import { StorageService } from '../../services/storage';
import { sound } from '../../services/sound';
import { fireCelebrationConfetti } from '../../services/confetti';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Lock,
  Play,
  RotateCcw,
  Sparkles,
  Timer,
  Volume2,
  XCircle,
  Zap,
} from 'lucide-react';

interface ReadingFluencyScreenProps {
  onBack: () => void;
  onProfileUpdate: () => void;
}

const STAGE_ORDER: ReadingStage[] = [...READING_POLICY.STAGES];

const STAGE_META: Record<
  ReadingStage,
  { label: string; emoji: string; blurb: string; focus: string[] }
> = {
  ACCURACY: {
    label: 'Đọc Chính Xác',
    emoji: '🎯',
    blurb: 'Đọc đúng từ, đúng tiếng, không bỏ sót chữ.',
    focus: ['Nhận diện từ', 'Ghép âm đều nhịp', 'Đọc to chuẩn'],
  },
  FLUENCY: {
    label: 'Đọc Lưu Loát',
    emoji: '🌊',
    blurb: 'Đọc liền mạnh cụm từ và câu, ngắt hơi đúng chỗ.',
    focus: ['Cụm từ', 'Câu mạch lạc', 'Dấu câu'],
  },
  COMPREHENSION: {
    label: 'Hiểu Nội Dung',
    emoji: '🧠',
    blurb: 'Đọc xong hiểu ai, gì, ở đâu, khi nào, vì sao, như thế nào.',
    focus: ['Ai? Cái gì?', 'Ở đâu? Khi nào?', 'Từ khóa'],
  },
  PROCESSING_SPEED: {
    label: 'Hiểu Nhanh',
    emoji: '⚡',
    blurb: 'Đọc câu hỏi, tìm đúng thông tin và loại đáp án nhiễu.',
    focus: ['Hiểu câu hỏi', 'Tìm từ khóa', 'Loại đáp án nhiễu'],
  },
  COMPETITION_SPEED: {
    label: 'Tốc Độ Thi',
    emoji: '🏆',
    blurb: 'Bài nhỏ có đồng hồ để luyện tốc độ dưới áp lực nhẹ nhàng.',
    focus: ['Chọn đáp án nhanh', 'Giữ độ chính xác'],
  },
};

export const ReadingFluencyScreen: React.FC<ReadingFluencyScreenProps> = ({
  onBack,
  onProfileUpdate,
}) => {
  const [profile, setProfile] = useState(() => StorageService.getReadingProfile());
  const [stage, setStage] = useState<ReadingStage>(profile.currentStage);
  const [items, setItems] = useState<ReadingQuestion[]>([]);
  const [passage, setPassage] = useState<ReadingPassage | null>(null);
  const [phase, setPhase] = useState<'lobby' | 'reading' | 'questions' | 'result'>('lobby');
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<ReadingResponse[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<ReadingSessionResult | null>(null);
  const [showPassage, setShowPassage] = useState(true);

  // Real timestamps: the UI never fabricates timing (§1.2).
  const sessionStartRef = useRef<number>(0);
  const itemStartRef = useRef<number>(0);
  const sessionIdRef = useRef<string>('');
  const committedRef = useRef(false);

  useEffect(() => {
    sessionIdRef.current = `rds_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStartRef.current = Date.now();
  }, []);

  const stageState = profile.stageStates[stage];
  const current = items[index];

  const startStage = useCallback(
    (target: ReadingStage) => {
      const seed = ReadingEngine.seedForDate();
      const nextItems = ReadingEngine.assembleStageItems(target, seed, 6);
      if (nextItems.length === 0) return;
      const nextPassage = ReadingEngine.passagesForStage(target, seed)[0] ?? null;
      setStage(target);
      setItems(nextItems);
      setPassage(nextPassage);
      setResponses([]);
      setIndex(0);
      setPicked(null);
      setChecked(false);
      setResult(null);
      setShowPassage(true);
      setPhase('questions');
      sessionStartRef.current = Date.now();
      itemStartRef.current = Date.now();
      sessionIdRef.current = `rds_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      committedRef.current = false;
    },
    []
  );

  const speak = (text: string) => {
    sound.speak(text, 'vi-VN');
  };

  const handleCheck = () => {
    if (!current || !picked || checked) return;
    const now = Date.now();
    const responseTimeMs = Math.max(1, now - itemStartRef.current);
    const isCorrect = picked === current.correctAnswer;
    const response: ReadingResponse = {
      questionId: current.id,
      skillId: current.skillId,
      questionType: current.questionType,
      difficulty: current.difficulty,
      correct: isCorrect,
      responseTimeMs,
      wordsProcessed: isSpokenItem(current) ? current.wordCount : 0,
      hesitation:
        responseTimeMs > READING_POLICY.HESITATION_SECONDS * 1000 &&
        isCorrect === false,
      answeredAt: now,
    };
    setResponses((prev) => [...prev, response]);
    setChecked(true);
    if (isCorrect) {
      sound.playCorrect();
    } else {
      sound.playWrong();
      sound.speak(current.explanation);
    }
  };

  const handleNext = () => {
    if (!current) return;
    if (index + 1 < items.length) {
      setIndex((i) => i + 1);
      setPicked(null);
      setChecked(false);
      itemStartRef.current = Date.now();
      return;
    }
    finish();
  };

  const finish = () => {
    if (committedRef.current) return;
    committedRef.current = true;
    const endedAt = Date.now();
    const session = ReadingEngine.finishSession(
      sessionIdRef.current,
      stage,
      responses,
      sessionStartRef.current,
      endedAt,
      true
    );
    setResult(session);
    setProfile(session.profile);
    setPhase('result');
    sound.playLevelUp();
    fireCelebrationConfetti();
    onProfileUpdate();
  };

  const backToLobby = () => {
    setPhase('lobby');
    setResult(null);
    setProfile(StorageService.getReadingProfile());
  };

  const history = useMemo(() => StorageService.getReadingMetricsHistory().slice(0, 5), [phase]);

  // ==========================================================
  // Render: Result
  // ==========================================================
  if (phase === 'result' && result) {
    const m: ReadingMetrics = result.metrics;
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-8 space-y-5">
        <ResultHeader metrics={m} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Độ chính xác" value={`${m.accuracy}%`} tone="emerald" />
          <MetricCard
            label="Hiểu nội dung"
            value={m.comprehensionAccuracy < 0 ? 'Chưa đo' : `${m.comprehensionAccuracy}%`}
            tone="sky"
          />
          <MetricCard label="Số câu đã đọc" value={`${m.itemsProcessed}`} tone="amber" />
          <MetricCard
            label="Tốc độ đọc"
            value={m.wordsPerMinute > 0 ? `${m.wordsPerMinute} từ/phút` : 'Chưa đo'}
            tone="violet"
          />
          <MetricCard label="Từ đã xử lý" value={`${m.wordsProcessed}`} tone="amber" />
          <MetricCard label="Thời gian mỗi câu" value={`${(m.averageResponseMs / 1000).toFixed(1)}s`} tone="slate" />
          <MetricCard label="Lần ngần ngại" value={`${m.hesitationCount}`} tone="slate" />
          <MetricCard
            label="Hiểu câu hỏi"
            value={m.questionInterpretationAccuracy < 0 ? 'Chưa đo' : `${m.questionInterpretationAccuracy}%`}
            tone="sky"
          />
        </div>

        <section className="bg-white rounded-3xl border-2 border-amber-200 p-5 space-y-3">
          <h3 className="font-black text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Bé đang mạnh ở đâu
          </h3>
          {Object.entries(m.skillPerformance).length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có dữ liệu.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(m.skillPerformance).map(([skillId, stat]) => (
                <li
                  key={skillId}
                  className="flex items-center justify-between text-xs font-bold bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2"
                >
                  <span>{skillLabel(skillId)}</span>
                  <span className="tabular-nums">
                    {stat.correct}/{stat.total}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {m.errors.length > 0 && (
          <section className="bg-white rounded-3xl border-2 border-rose-200 p-5 space-y-2">
            <h3 className="font-black text-slate-800">Những chỗ bé cần luyện thêm</h3>
            <ul className="flex flex-wrap gap-2">
              {m.errors.map((e) => (
                <li
                  key={e.category}
                  className="text-xs font-bold bg-amber-50 border border-amber-300 text-amber-900 rounded-xl px-3 py-1.5"
                >
                  {errorLabel(e.category)} ({e.count})
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="bg-white rounded-3xl border-2 border-amber-200 p-5 space-y-2">
          <h3 className="font-black text-slate-800">Bước tiếp theo của bé</h3>
          <ul className="space-y-2">
            {result.nextActions.map((a) => (
              <li key={a.stage} className="text-xs md:text-sm">
                <span className="font-black text-amber-900">
                  {STAGE_META[a.stage].emoji} {a.label}
                </span>
                <span className="block text-slate-600">{a.reason}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => startStage(result.profile.currentStage)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Luyện tiếp bước {STAGE_META[result.profile.currentStage].label}
          </button>
          <button
            onClick={backToLobby}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-black text-sm active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            Về thang luyện đọc
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // Render: Question runner
  // ==========================================================
  if ((phase === 'questions' || phase === 'reading') && current && passage) {
    const correct = checked && picked === current.correctAnswer;
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-amber-50">
        {/* Top bar */}
        <div className="px-4 py-3 bg-white border-b-2 border-amber-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl">{STAGE_META[stage].emoji}</span>
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-wider text-amber-700 truncate">
                {STAGE_META[stage].label}
              </p>
              <p className="text-sm font-black text-slate-800 truncate">
                Câu {index + 1}/{items.length} · {passage.title}
              </p>
            </div>
          </div>
          <button
            onClick={backToLobby}
            aria-label="Thoát buổi luyện đọc"
            className="min-h-[44px] px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs shrink-0"
          >
            Thoát
          </button>
        </div>

        <div className="w-full bg-amber-100 h-2 shrink-0">
          <div
            className="bg-amber-500 h-full transition-all"
            style={{ width: `${Math.round(((index + 1) / items.length) * 100)}%` }}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-40">
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Passage panel */}
            <section className="bg-white rounded-3xl border-2 border-amber-200 p-4 md:p-5">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h2 className="font-black text-slate-800 flex items-center gap-2 text-sm md:text-base">
                  <span className="text-xl">{passage.mediaEmoji}</span>
                  Đoạn đọc: {passage.title}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => speak(passage.paragraphs.join(' '))}
                    className="min-h-[44px] px-3 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-xs flex items-center gap-1"
                  >
                    <Volume2 className="w-4 h-4" /> Nghe đoạn đọc
                  </button>
                  <button
                    onClick={() => setShowPassage((v) => !v)}
                    className="min-h-[44px] px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    {showPassage ? 'Ẩn chữ' : 'Hiện chữ'}
                  </button>
                </div>
              </div>

              {showPassage && (
                <div className="space-y-2">
                  {passage.paragraphs.map((p, i) => (
                    <p key={i} className="text-base md:text-lg font-semibold text-slate-800 leading-relaxed">
                      {p}
                    </p>
                  ))}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-amber-100">
                    {passage.pictureBank.map((p) => (
                      <span
                        key={p.label}
                        className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 border border-amber-200 rounded-xl px-2 py-1"
                      >
                        <span>{p.emoji}</span>
                        {p.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Question card */}
            <section className="bg-white rounded-3xl border-2 border-amber-300 p-4 md:p-6 space-y-4">
              <div className="text-center space-y-2">
                {current.mediaEmoji && <div className="text-4xl md:text-5xl">{current.mediaEmoji}</div>}
                <h3 className="text-base md:text-xl font-black text-slate-800 font-display leading-relaxed">
                  {current.prompt}
                </h3>
                {current.stimulus && (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-xl md:text-3xl font-black text-amber-800 bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-2">
                      {current.stimulus}
                    </p>
                    <button
                      onClick={() => speak(current.stimulus!)}
                      className="min-h-[44px] px-4 rounded-2xl bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-xs flex items-center gap-1"
                    >
                      <Volume2 className="w-4 h-4" /> Nghe mình đọc
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {current.options.map((opt, optIdx) => {
                  const selected = picked === opt;
                  const isAnswer = opt === current.correctAnswer;
                  let cls = 'bg-white border-slate-200 hover:bg-amber-50';
                  if (checked) {
                    if (isAnswer) cls = 'bg-emerald-50 border-emerald-500 text-emerald-900';
                    else if (selected) cls = 'bg-rose-50 border-rose-500 text-rose-900';
                    else cls = 'bg-white border-slate-200 opacity-50';
                  } else if (selected) {
                    cls = 'bg-amber-100 border-amber-500 text-amber-950';
                  }
                  return (
                    <button
                      key={optIdx}
                      data-testid="answer-option"
                      onClick={() => {
                        if (checked) return;
                        sound.playClick();
                        setPicked(opt);
                      }}
                      disabled={checked}
                      aria-pressed={selected}
                      className={`min-h-[56px] p-4 rounded-2xl border-2 font-bold text-sm md:text-base flex items-center gap-3 text-left active:scale-[0.99] ${cls}`}
                    >
                      <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-black text-xs shrink-0">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {checked && (
                <div
                  role="status"
                  className={`rounded-2xl border-2 p-3 flex items-start gap-3 ${
                    correct
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                      : 'bg-amber-100 border-amber-300 text-amber-900'
                  }`}
                >
                  {correct ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-amber-600 shrink-0" />
                  )}
                  <div className="text-xs md:text-sm font-bold">
                    {correct ? 'Đúng rồi! ' : `Đáp án là: ${current.correctAnswer}. `}
                    {current.explanation}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Action bar */}
        <div className="px-4 py-3 bg-white border-t-2 border-amber-200 shrink-0">
          <div className="max-w-3xl mx-auto">
            {!checked ? (
              <button
                onClick={handleCheck}
                disabled={!picked}
                className="w-full min-h-[56px] rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 text-white font-black text-base md:text-lg active:scale-[0.99]"
              >
                Kiểm tra câu trả lời
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full min-h-[56px] rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-base md:text-lg active:scale-[0.99]"
              >
                {index + 1 < items.length ? 'Câu tiếp theo' : 'Xem kết quả'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // Render: Lobby (ladder)
  // ==========================================================
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 min-h-[44px] px-4 py-2 bg-white hover:bg-amber-50 border-2 border-amber-300 rounded-2xl font-bold text-xs md:text-sm text-amber-950 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Về Trang Chủ
        </button>
        <span className="text-xs font-black text-amber-900 bg-amber-100/80 px-4 py-1.5 rounded-full border border-amber-300">
          Luyện Đọc Lưu Loát
        </span>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 rounded-3xl p-6 md:p-8 text-white shadow-lg border-4 border-cyan-200">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-black">
            <span>📚</span> CHUYÊN ĐỀ ĐỌC CHẮC – ĐỌC LƯU LOÁT
          </span>
          <h1 className="text-2xl md:text-3xl font-black font-display">{profile.headline}</h1>
          <p className="text-xs md:text-sm text-cyan-50 font-semibold leading-relaxed">
            {profile.encouragement}
          </p>
        </div>
      </section>

      {/* Index cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <IndexCard label="Chỉ số đọc" value={`${profile.readingIndex}`} suffix="/100" tone="sky" />
        <IndexCard label="Độ chính xác" value={`${profile.accuracyIndex}`} suffix="%" tone="emerald" />
        <IndexCard label="Hiểu nội dung" value={`${profile.comprehensionIndex}`} suffix="%" tone="violet" />
        <IndexCard label="Mượt mà" value={`${profile.fluencyIndex}`} suffix="%" tone="amber" />
      </section>

      {/* Ladder */}
      <section className="space-y-3">
        <h2 className="text-lg md:text-xl font-black text-amber-950 font-display flex items-center gap-2">
          <span>🪜</span> Thang Luyện Đọc Của Bé
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Bé chỉ mở được bước mới khi đã đạt chuẩn bước trước. Bước tốc độ chỉ mở khi bé hiểu nội
          dung đã — nhờ vậy bé đọc chậm mà đúng vẫn được đánh giá cao.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {STAGE_ORDER.map((s) => {
            const st = profile.stageStates[s];
            const meta = STAGE_META[s];
            const locked = !st.isUnlocked;
            const pct = Math.min(100, st.accuracy);
            return (
              <div
                key={s}
                className={`p-4 rounded-3xl border-2 flex flex-col gap-3 ${
                  locked
                    ? 'bg-slate-50 border-slate-200'
                    : st.isCompleted
                    ? 'bg-emerald-50 border-emerald-300'
                    : 'bg-white border-amber-300 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{meta.emoji}</span>
                    <div>
                      <h3 className={`font-black text-sm md:text-base ${locked ? 'text-slate-500' : 'text-slate-800'}`}>
                        {meta.label}
                      </h3>
                      <p className="text-[11px] text-slate-500">{meta.blurb}</p>
                    </div>
                  </div>
                  {locked ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black bg-slate-200 text-slate-600 rounded-lg px-2 py-1 shrink-0">
                      <Lock className="w-3 h-3" /> Đang khóa
                    </span>
                  ) : st.isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black bg-emerald-500 text-white rounded-lg px-2 py-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3" /> Đạt chuẩn
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black bg-amber-100 text-amber-800 rounded-lg px-2 py-1 shrink-0">
                      <Zap className="w-3 h-3" /> Đang luyện
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {meta.focus.map((f) => (
                    <span
                      key={f}
                      className="text-[11px] font-bold bg-slate-50 border border-slate-200 text-slate-600 rounded-lg px-2 py-0.5"
                    >
                      {f}
                    </span>
                  ))}
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] font-black text-slate-600 mb-1">
                    <span>
                      Chuẩn mở bước sau: {st.accuracyGate}%
                    </span>
                    <span className="tabular-nums">{st.accuracy}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        st.isCompleted ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => startStage(s)}
                  disabled={locked}
                  className={`min-h-[48px] w-full rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 active:scale-95 ${
                    locked
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  {locked ? 'Hoàn thành bước trước để mở' : st.isCompleted ? 'Luyện lại bước này' : 'Bắt đầu luyện'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent sessions */}
      {history.length > 0 && (
        <section className="bg-white rounded-3xl border-2 border-amber-200 p-5 space-y-3">
          <h3 className="font-black text-slate-800 flex items-center gap-2">
            <Timer className="w-5 h-5 text-amber-600" />
            Lần luyện gần đây
          </h3>
          <ul className="space-y-2">
            {history.map((m) => (
              <li
                key={m.sessionId}
                className="flex items-center justify-between gap-2 text-xs bg-amber-50/60 border border-amber-200 rounded-xl px-3 py-2"
              >
                <span className="font-black text-amber-900">
                  {STAGE_META[m.stage].emoji} {STAGE_META[m.stage].label}
                </span>
                <span className="text-slate-600">
                  {m.itemsProcessed} câu · chính xác {m.accuracy}%
                  {m.wordsPerMinute > 0 ? ` · ${m.wordsPerMinute} từ/phút` : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

// ==========================================================
// Small presentational helpers
// ==========================================================

const TONE_CLASSES: Record<string, string> = {
  emerald: 'bg-emerald-50 border-emerald-200',
  sky: 'bg-sky-50 border-sky-200',
  amber: 'bg-amber-50 border-amber-200',
  violet: 'bg-violet-50 border-violet-200',
  slate: 'bg-slate-50 border-slate-200',
};

const MetricCard: React.FC<{ label: string; value: string; tone: string }> = ({
  label,
  value,
  tone,
}) => (
  <div className={`p-3.5 rounded-2xl border-2 text-center ${TONE_CLASSES[tone] ?? TONE_CLASSES.slate}`}>
    <span className="text-[11px] font-bold text-slate-600 block">{label}</span>
    <span className="text-lg md:text-2xl font-black text-slate-800 font-display tabular-nums">
      {value}
    </span>
  </div>
);

const IndexCard: React.FC<{ label: string; value: string; suffix: string; tone: string }> = ({
  label,
  value,
  suffix,
  tone,
}) => (
  <div className={`p-4 rounded-2xl border-2 ${TONE_CLASSES[tone] ?? TONE_CLASSES.slate}`}>
    <span className="text-xs font-bold text-slate-600 block">{label}</span>
    <span className="text-2xl font-black text-slate-900 font-display tabular-nums">
      {value}
      <span className="text-sm text-slate-500">{suffix}</span>
    </span>
  </div>
);

const ResultHeader: React.FC<{ metrics: ReadingMetrics }> = ({ metrics }) => (
  <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-6 text-white shadow-lg border-4 border-emerald-200">
    <h1 className="text-2xl md:text-3xl font-black font-display">Kết quả luyện đọc</h1>
    <p className="text-sm text-emerald-50 font-semibold mt-1">
      Bé đọc {metrics.itemsProcessed} câu · đúng {Math.round((metrics.accuracy / 100) * metrics.itemsProcessed)}/{' '}
      {metrics.itemsProcessed} câu.
    </p>
  </div>
);

function isSpokenItem(q: ReadingQuestion): boolean {
  return q.questionType === 'read-aloud' || q.questionType === 'phrase-repeat';
}

function skillLabel(skillId: string): string {
  const map: Record<string, string> = {
    'RF-WORD-RECOGNITION': 'Nhận diện từ',
    'RF-SYLLABLE-FLUENCY': 'Ghép âm đều nhịp',
    'RF-PHRASE-FLUENCY': 'Đọc cụm từ',
    'RF-SENTENCE-FLUENCY': 'Đọc câu mạch lạc',
    'RF-READ-ALOUD-ACCURACY': 'Đọc to chính xác',
    'RF-READ-ALOUD-SPEED': 'Đọc nhanh mà rõ',
    'RF-PUNCTUATION-PAUSE': 'Ngắt hơi theo dấu câu',
    'RF-READING-COMPREHENSION': 'Hiểu nội dung',
    'RF-KEYWORD-FINDING': 'Tìm từ khóa',
    'RF-QUESTION-UNDERSTANDING': 'Hiểu câu hỏi',
    'RF-ANSWER-SELECTION-SPEED': 'Chọn đáp án nhanh',
  };
  return map[skillId] ?? skillId;
}

function errorLabel(category: string): string {
  const map: Record<string, string> = {
    SUBSTITUTION: 'Đọc nhầm từ',
    OMISSION: 'Bỏ sót ý',
    MISPRONUNCIATION: 'Đọc chưa rõ tiếng',
    PUNCTUATION_IGNORED: 'Quên ngắt hơi ở dấu câu',
    COMPREHENSION_GAP: 'Chưa nắm rõ ý trong đoạn',
    KEYWORD_MISSED: 'Tìm từ khóa chưa nhanh',
    CARELESS_TAP: 'Chọn đáp án chưa đọc kỹ',
  };
  return map[category] ?? category;
}
