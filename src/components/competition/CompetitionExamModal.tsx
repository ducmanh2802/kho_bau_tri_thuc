import React, { useState, useEffect, useRef } from 'react';
import {
  CompetitionExamResult,
  CompetitionQuestion,
  ExamBlueprint,
  QuestionResponse,
} from '../../types/competition';
import { CompetitionEngine } from '../../services/competitionEngine';
import { StorageService } from '../../services/storage';
import { sound } from '../../services/sound';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  X,
  Send,
  Flag,
} from 'lucide-react';

interface CompetitionExamModalProps {
  blueprint: ExamBlueprint;
  questions: CompetitionQuestion[];
  isOpen: boolean;
  onClose: () => void;
  onFinish: (result: CompetitionExamResult) => void;
}

export const CompetitionExamModal: React.FC<CompetitionExamModalProps> = ({
  blueprint,
  questions,
  isOpen,
  onClose,
  onFinish,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [questionStartTimes, setQuestionStartTimes] = useState<Record<string, number>>({});
  const [questionDurations, setQuestionDurations] = useState<Record<string, number>>({});

  // Monotonic Timer
  const [secondsRemaining, setSecondsRemaining] = useState(blueprint.durationSeconds);
  const deadlineRef = useRef<number>(Date.now() + blueprint.durationSeconds * 1000);
  const startTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<any>(null);

  // Submit confirmation state
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Initialize question timing on open
  useEffect(() => {
    if (isOpen && questions.length > 0) {
      startTimeRef.current = Date.now();
      deadlineRef.current = Date.now() + blueprint.durationSeconds * 1000;
      setSecondsRemaining(blueprint.durationSeconds);
      setCurrentIndex(0);
      setUserAnswers({});
      setShowSubmitConfirm(false);
      setShowExitConfirm(false);

      const starts: Record<string, number> = {};
      starts[questions[0].id] = Date.now();
      setQuestionStartTimes(starts);
      setQuestionDurations({});

      // Monotonic timer tick
      timerIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const diff = Math.max(0, Math.ceil((deadlineRef.current - now) / 1000));
        setSecondsRemaining(diff);

        if (diff <= 0) {
          clearInterval(timerIntervalRef.current);
          handleFinalSubmit(true);
        }
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isOpen, blueprint, questions]);

  // Track time spent per question on index change
  const recordCurrentQuestionDuration = () => {
    const q = questions[currentIndex];
    if (!q) return;
    const start = questionStartTimes[q.id] || Date.now();
    const elapsed = Math.round((Date.now() - start) / 1000);
    setQuestionDurations((prev) => ({
      ...prev,
      [q.id]: (prev[q.id] || 0) + elapsed,
    }));
  };

  const handleSelectOption = (option: string) => {
    sound.playClick();
    const q = questions[currentIndex];
    setUserAnswers((prev) => ({ ...prev, [q.id]: option }));
  };

  const handleNavigate = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= questions.length) return;
    recordCurrentQuestionDuration();
    const nextQ = questions[newIndex];
    setQuestionStartTimes((prev) => ({ ...prev, [nextQ.id]: Date.now() }));
    setCurrentIndex(newIndex);
  };

  const handleFinalSubmit = (isAutoTimeout: boolean = false) => {
    recordCurrentQuestionDuration();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const timeUsedSeconds = Math.min(
      blueprint.durationSeconds,
      Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
    );

    // Build question responses
    const responses: QuestionResponse[] = questions.map((q) => {
      const ans = userAnswers[q.id] || null;
      const isCorrect =
        ans !== null &&
        (Array.isArray(q.correctAnswer)
          ? q.correctAnswer.join(', ') === ans
          : q.correctAnswer.trim().toLowerCase() === ans.trim().toLowerCase());

      const timeSpent = questionDurations[q.id] || 15;
      return {
        questionId: q.id,
        userAnswer: ans,
        isCorrect,
        timeSpentSeconds: timeSpent,
      };
    });

    const existingHistory = StorageService.getCompetitionHistory().examResults;
    const scoredResult = CompetitionEngine.scoreSession(
      blueprint,
      questions,
      responses,
      timeUsedSeconds,
      existingHistory
    );

    // Save result with profile rewards
    StorageService.recordCompetitionResult(
      scoredResult,
      blueprint.rewardXp,
      blueprint.rewardStars
    );

    if (isAutoTimeout) {
      sound.speak('Đã hết giờ làm bài! Cùng xem kết quả nhé.');
    }

    onFinish(scoredResult);
  };

  if (!isOpen || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(userAnswers).length;
  const unansweredCount = questions.length - answeredCount;

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const isLowTime = secondsRemaining <= 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-6 bg-slate-950/85 backdrop-blur-md select-none animate-pop">
      <div className="relative w-full max-w-4xl h-[95vh] md:h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-slate-300">
        {/* Top Arena Bar */}
        <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-xl md:text-2xl">{blueprint.badgeEmoji}</span>
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                {blueprint.subject === 'tieng-viet'
                  ? 'Tiếng Việt'
                  : blueprint.subject === 'toan'
                  ? 'Toán Học'
                  : 'English'}
              </span>
              <h3 className="text-sm md:text-base font-black text-white truncate max-w-[200px] md:max-w-md">
                {blueprint.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Countdown Timer */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono font-black text-sm md:text-base border transition-all ${
                isLowTime
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse'
                  : 'bg-slate-800 text-amber-300 border-slate-700'
              }`}
            >
              <Clock className={`w-4 h-4 ${isLowTime ? 'text-rose-400' : 'text-amber-300'}`} />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            <button
              onClick={() => setShowExitConfirm(true)}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all cursor-pointer"
              title="Thoát bài thi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress & Question Numbers Pill Tracker */}
        <div className="px-4 py-2 bg-amber-50/70 border-b border-amber-200/80 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-xs font-bold text-amber-900 shrink-0">
            Câu {currentIndex + 1}/{questions.length}
          </span>

          <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
            {questions.map((q, idx) => {
              const isAnswered = Boolean(userAnswers[q.id]);
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => handleNavigate(idx)}
                  className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-500 text-white ring-2 ring-amber-400 ring-offset-1 scale-105'
                      : isAnswered
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="text-xs font-bold text-slate-500 shrink-0 hidden sm:block">
            Đã làm: {answeredCount}/{questions.length}
          </div>
        </div>

        {/* Main Question Viewport */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col justify-center max-w-3xl mx-auto w-full">
          <div className="space-y-6">
            {/* Question Prompt Card */}
            <div className="p-6 md:p-8 bg-amber-50/50 border-2 border-amber-200 rounded-3xl shadow-sm text-center space-y-3">
              {currentQ.mediaEmoji && (
                <div className="text-5xl md:text-6xl animate-bounce-slow">
                  {currentQ.mediaEmoji}
                </div>
              )}
              <h2 className="text-lg md:text-2xl font-black text-slate-800 font-display leading-relaxed">
                {currentQ.prompt}
              </h2>
            </div>

            {/* Answer Choices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = userAnswers[currentQ.id] === option;
                const letter = ['A', 'B', 'C', 'D'][optIdx] || '';

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(option)}
                    className={`p-4 md:p-5 rounded-2xl border-2 text-left font-bold text-sm md:text-base flex items-center gap-3 transition-all active:scale-[0.98] cursor-pointer ${
                      isSelected
                        ? 'bg-amber-100 border-amber-500 text-amber-950 ring-2 ring-amber-400/40 shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        isSelected
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="flex-1">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Navigation & Submit Bar */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={() => handleNavigate(currentIndex - 1)}
            disabled={currentIndex === 0}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs md:text-sm border transition-all ${
              currentIndex === 0
                ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400'
                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 cursor-pointer active:scale-95'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Câu trước</span>
          </button>

          <div className="flex items-center gap-2">
            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => handleNavigate(currentIndex + 1)}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-xs md:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>Câu tiếp</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitConfirm(true)}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs md:text-sm shadow-md transition-all active:scale-95 cursor-pointer animate-pulse"
              >
                <Send className="w-4 h-4" />
                <span>Nộp Bài</span>
              </button>
            )}

            {currentIndex < questions.length - 1 && (
              <button
                onClick={() => setShowSubmitConfirm(true)}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-2xl font-bold text-xs transition-all cursor-pointer"
              >
                Nộp sớm
              </button>
            )}
          </div>
        </div>

        {/* Submit Confirmation Overlay */}
        {showSubmitConfirm && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-pop">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-slate-200 text-center space-y-4">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl mx-auto flex items-center justify-center text-3xl">
                📝
              </div>
              <h4 className="text-lg font-black text-slate-800">Bé đã sẵn sàng nộp bài chưa?</h4>
              {unansweredCount > 0 ? (
                <p className="text-xs md:text-sm text-rose-700 font-bold bg-rose-50 p-3 rounded-2xl border border-rose-200">
                  ⚠️ Bé còn {unansweredCount} câu chưa chọn đáp án! Bé có muốn quay lại kiểm tra không?
                </p>
              ) : (
                <p className="text-xs md:text-sm text-emerald-700 font-bold bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                  ✨ Bé đã hoàn thành trả lời đủ {questions.length} câu hỏi!
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 py-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-2xl text-xs cursor-pointer"
                >
                  Kiểm tra tiếp
                </button>
                <button
                  onClick={() => {
                    setShowSubmitConfirm(false);
                    handleFinalSubmit(false);
                  }}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs shadow-md cursor-pointer"
                >
                  Xác nhận Nộp Bài
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Exit Confirmation Overlay */}
        {showExitConfirm && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-pop">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border-2 border-slate-200 text-center space-y-3">
              <h4 className="text-base font-black text-slate-800">Rời khỏi bài thi?</h4>
              <p className="text-xs text-slate-500 font-medium">
                Kết quả bài thi này sẽ không được lưu nếu bé dừng lại giữa chừng.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs cursor-pointer"
                >
                  Làm tiếp
                </button>
                <button
                  onClick={() => {
                    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                    onClose();
                  }}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl text-xs cursor-pointer"
                >
                  Thoát ra
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
