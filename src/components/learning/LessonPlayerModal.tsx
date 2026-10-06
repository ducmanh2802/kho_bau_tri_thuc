import React, { useState, useEffect, useRef } from 'react';
import { Lesson, Question, SubjectType } from '../../types';
import { sound } from '../../services/sound';
import {
  resolvePraise,
  speakPraise,
  toPraiseSubject,
  type PraiseResult,
} from '../../services/praiseEngine';
import { fireCelebrationConfetti } from '../../services/confetti';
import { StorageService } from '../../services/storage';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useSpeak } from '../../hooks/useSpeak';
import {
  assertQuestionAudioTarget,
  buildQuestionAudioTarget,
  getQuestionAudioLang,
  logQuestionAudioTarget,
  resolveQuestionAudioText,
} from '../../services/questionAudio';
import {
  Volume2,
  X,
  Star,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

interface LessonPlayerModalProps {
  lesson: Lesson;
  onClose: () => void;
  onComplete?: () => void;
}

export const LessonPlayerModal: React.FC<LessonPlayerModalProps> = ({
  lesson,
  onClose,
  onComplete,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[] | null>(null);
  const [orderedList, setOrderedList] = useState<string[]>([]);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const dialogRef = useFocusTrap<HTMLDivElement>(true);
  const { state: audioState, speak: speakQuestion } = useSpeak();
  // Last canonical text handed toward TTS (test hook; also rendered as
  // data-last-spoken so automation in an isolated JS world can still verify
  // routing against the real app realm).
  const [lastSpoken, setLastSpoken] = useState<string | null>(null);
  // Canonical praise for the current answer (P38): caption and TTS share ONE
  // string (praise.text === praise.ttsText). The explanation/hint stays
  // visible as learning content but is never spoken as praise.
  const [praise, setPraise] = useState<PraiseResult | null>(null);
  const praiseAttemptRef = useRef(0);

  const question: Question = lesson.questions[currentIdx];
  const progressPercent = Math.round(((currentIdx + 1) / lesson.questions.length) * 100);

  // Read prompt on demand. Auto-play is the parent-controlled accessibility mode
  // (§20): pre-readers need to hear questions, and a parent can switch it off.
  // Single source of truth: resolveQuestionAudioText (audioPrompt || prompt).
  // NEVER answers[0]/options[0]/selectedAnswer/explanation — resolver returns
  // null (AUDIO_UNAVAILABLE) instead of falling back, and we stay silent.
  const playPromptAudio = () => {
    const target = buildQuestionAudioTarget(question);
    if (!target) return;
    if (import.meta.env.DEV) {
      assertQuestionAudioTarget({
        questionId: target.questionId,
        text: target.text,
        canonicalText: resolveQuestionAudioText(question) ?? '',
        options: question.options,
        correctAnswer: question.correctAnswer,
        selectedAnswer: selectedAnswer,
        explanation: question.explanation,
        hint: question.hint,
      });
    }
    const lang = getQuestionAudioLang(question);
    logQuestionAudioTarget(target);
    setLastSpoken(target.text);
    speakQuestion(target.text, lang);
  };

  useEffect(() => {
    // Reset state for new question
    setSelectedAnswer(null);
    setLastSpoken(null);
    setPraise(null);
    setOrderedList([]);
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setShowHint(false);

    // Speak automatically only when the parent left the accessibility mode on.
    if (!StorageService.getParentSettings().questionAutoplay) return;
    const timer = setTimeout(() => {
      playPromptAudio();
    }, 300);
    return () => clearTimeout(timer);
  }, [currentIdx, question]);

  const handleSelectOption = (opt: string) => {
    if (isAnswerChecked) return;
    sound.playClick();
    setSelectedAnswer(opt);
  };

  const handleToggleOrderItem = (item: string) => {
    if (isAnswerChecked) return;
    sound.playClick();
    if (orderedList.includes(item)) {
      setOrderedList(orderedList.filter((i) => i !== item));
    } else {
      setOrderedList([...orderedList, item]);
    }
  };

  const handleCheckAnswer = () => {
    if (isAnswerChecked) return;

    let correct = false;
    if (question.type === 'ordering') {
      const targetArr = question.correctAnswer as string[];
      correct = orderedList.join(' ') === targetArr.join(' ');
    } else {
      correct = selectedAnswer === question.correctAnswer;
    }

    setIsAnswerChecked(true);
    setIsCorrect(correct);

    // Record in storage analytics for adaptive tracking
    StorageService.recordQuestionAnswer(
      question.skillId,
      correct,
      question.id,
      question.prompt,
      question.subject
    );

    if (correct) {
      sound.playCorrect();
      setScore((s) => s + 1);
    } else {
      sound.playWrong();
    }

    // P38 canonical praise: ONE resolver → ONE caption string → ONE TTS
    // request with the identical string. Language follows the question
    // subject (English lessons praise in English, en-GB), so an English
    // context can never fall back to Vietnamese praise.
    praiseAttemptRef.current += 1;
    const resolved = resolvePraise({
      subject: toPraiseSubject(question.subject),
      outcome: correct ? 'CORRECT' : 'ENCOURAGEMENT',
      eventId: `${lesson.id}:${question.id}:attempt-${praiseAttemptRef.current}`,
    });
    setPraise(resolved);
    speakPraise(resolved);
  };

  const handleNextQuestion = () => {
    sound.playClick();
    if (currentIdx + 1 < lesson.questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Completed lesson!
      setIsFinished(true);
      sound.playLevelUp();
      fireCelebrationConfetti();
      StorageService.completeLesson(lesson.id, lesson.subject, lesson.xpReward, lesson.starReward);
      if (onComplete) onComplete();
    }
  };

  const handleRetryLesson = () => {
    setCurrentIdx(0);
    setScore(0);
    setIsFinished(false);
  };

  const handleRetryCurrentQuestion = () => {
    sound.playClick();
    setSelectedAnswer(null);
    setOrderedList([]);
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setShowHint(true);
    // Retry encouragement in the lesson language (P38): same caption/TTS rule.
    const retryPraise = resolvePraise({
      subject: toPraiseSubject(question.subject),
      outcome: 'ENCOURAGEMENT',
    });
    setPraise(retryPraise);
    speakPraise(retryPraise);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/70 backdrop-blur-sm animate-pop select-none">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={lesson.title}
        tabIndex={-1}
        className="relative w-full max-w-2xl h-[92vh] max-h-[720px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border-4 border-amber-300"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border-b border-amber-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              {lesson.subject === 'tieng-viet' ? '🐻' : lesson.subject === 'toan' ? '🦊' : '🐰'}
            </span>
            <div>
              <h3 className="text-sm md:text-base font-black text-amber-900 truncate max-w-[220px] md:max-w-xs font-display">
                {lesson.title}
              </h3>
              <p className="text-[11px] text-amber-700 font-bold">
                Câu hỏi {currentIdx + 1} / {lesson.questions.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1 bg-amber-200/80 rounded-full text-xs font-black text-amber-900">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
              <span>{score} đúng</span>
            </div>
            <button
              onClick={onClose}
              aria-label="Đóng bài học"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-all active:scale-95"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-amber-100 h-2">
          <div
            className="bg-amber-500 h-full transition-all duration-300 rounded-r-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Area */}
        {!isFinished ? (
          <div className="flex-1 flex flex-col justify-between p-4 md:p-6 overflow-y-auto">
            {/* Prompt Card */}
            <div className="bg-amber-50/70 p-4 md:p-5 rounded-2xl border-2 border-amber-200 flex flex-col items-center text-center">
              {question.mediaEmoji && (
                <div className="text-5xl md:text-6xl mb-3 animate-pulse-subtle">
                  {question.mediaEmoji}
                </div>
              )}

              <div className="flex items-center justify-center gap-2 mb-1">
                <h4 className="text-lg md:text-xl font-black text-slate-800 font-display">
                  {question.prompt}
                </h4>
                <button
                  onClick={playPromptAudio}
                  data-testid="question-audio"
                  data-action="READ_QUESTION"
                  data-audio-state={audioState}
                  data-question-id={question.id}
                  data-last-spoken={lastSpoken ?? undefined}
                  className="p-2 min-w-[44px] min-h-[44px] bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full active:scale-95 shrink-0 flex items-center justify-center"
                  title="Đọc câu hỏi"
                  aria-label={
                    audioState === 'playing'
                      ? 'Đang đọc câu hỏi'
                      : audioState === 'played'
                        ? 'Đã đọc xong, chạm để nghe lại'
                        : audioState === 'unavailable'
                          ? 'Thiết bị không đọc được, hãy đọc cùng ba mẹ nhé'
                          : 'Đọc câu hỏi'
                  }
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {/* Hint toggler */}
              {question.hint && (
                <div className="mt-2">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setShowHint(!showHint);
                    }}
                    className="text-xs text-amber-800 hover:text-amber-900 flex items-center gap-1 font-bold bg-amber-100/80 px-3 py-1 rounded-full"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showHint ? 'Ẩn gợi ý' : 'Bé cần gợi ý?'}</span>
                  </button>
                  {showHint && (
                    <p className="text-xs text-amber-900 mt-1 bg-amber-200/60 px-3 py-1.5 rounded-xl font-medium animate-pop">
                      💡 {question.hint}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Answer Options */}
            <div className="my-4">
              {question.type === 'ordering' ? (
                // Ordering word tiles
                <div className="space-y-4">
                  <div className="min-h-[56px] p-3 bg-slate-50 border-2 border-dashed border-amber-300 rounded-2xl flex flex-wrap items-center justify-center gap-2">
                    {orderedList.length === 0 ? (
                      <span className="text-xs text-slate-400 font-semibold">
                        Chạm vào các từ bên dưới để ghép câu...
                      </span>
                    ) : (
                      orderedList.map((word, i) => (
                        <button
                          key={i}
                          onClick={() => handleToggleOrderItem(word)}
                          className="px-4 py-2 bg-amber-400 text-amber-950 font-black rounded-xl shadow-sm text-base animate-pop"
                        >
                          {word}
                        </button>
                      ))
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {question.options?.map((word, i) => {
                      const isUsed = orderedList.includes(word);
                      return (
                        <button
                          key={i}
                          onClick={() => handleToggleOrderItem(word)}
                          disabled={isUsed || isAnswerChecked}
                          className={`px-4 py-2.5 rounded-xl font-black text-base border-2 transition-all ${
                            isUsed
                              ? 'opacity-30 border-slate-200 bg-slate-100'
                              : 'bg-white hover:bg-amber-50 border-amber-300 shadow-sm active:scale-95'
                          }`}
                        >
                          {word}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Multiple Choice / Fill Blank / Image Choice Grid
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {question.options?.map((opt, i) => {
                    const isSelected = selectedAnswer === opt;
                    let stateStyle = 'bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50/50';

                    if (isAnswerChecked) {
                      if (opt === question.correctAnswer) {
                        stateStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900';
                      } else if (isSelected) {
                        stateStyle = 'bg-rose-50 border-rose-500 text-rose-900';
                      } else {
                        stateStyle = 'opacity-40 border-slate-200';
                      }
                    } else if (isSelected) {
                      stateStyle = 'bg-amber-100 border-amber-500 text-amber-950 shadow-md scale-[1.02]';
                    }

                    return (
                      <button
                        key={i}
                        data-testid="answer-option"
                        onClick={() => handleSelectOption(opt)}
                        disabled={isAnswerChecked}
                        className={`p-4 rounded-2xl border-3 font-bold text-base md:text-lg flex items-center justify-center transition-all cursor-pointer text-center ${stateStyle}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Feedback and Actions */}
            <div>
              {isAnswerChecked && (
                <div
                  role="status"
                  className={`p-3 rounded-2xl mb-3 flex items-center gap-3 animate-pop ${
                    isCorrect
                      ? 'bg-emerald-100 border border-emerald-300 text-emerald-900'
                      : 'bg-rose-100 border border-rose-300 text-rose-900'
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
                  )}
                  <div className="text-xs md:text-sm font-bold flex-1">
                    {praise && (
                      <span
                        data-testid="praise-caption"
                        data-praise-text={praise.text}
                        data-praise-tts={praise.ttsText}
                        data-praise-locale={praise.locale}
                        data-praise-language={praise.language}
                        data-praise-outcome={praise.outcome}
                        className="block text-sm md:text-base font-black mb-0.5"
                      >
                        {praise.characterEmoji} {praise.text}
                      </span>
                    )}
                    {isCorrect
                      ? question.explanation || 'Rất tuyệt vời! Bé đã trả lời chính xác!'
                      : `Đáp án đúng là: ${Array.isArray(question.correctAnswer) ? question.correctAnswer.join(' ') : question.correctAnswer}`}
                  </div>
                </div>
              )}

              {!isAnswerChecked ? (
                <button
                  onClick={handleCheckAnswer}
                  disabled={
                    question.type === 'ordering'
                      ? orderedList.length === 0
                      : !selectedAnswer
                  }
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 text-white font-black text-base md:text-lg rounded-2xl shadow-lg transition-transform active:scale-95 cursor-pointer font-display"
                >
                  Kiểm tra câu trả lời ✨
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  {!isCorrect && (
                    <button
                      onClick={handleRetryCurrentQuestion}
                      className="flex-1 py-3.5 px-4 bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-sm md:text-base rounded-2xl shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer font-display"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Thử lại câu này 🔁</span>
                    </button>
                  )}
                  <button
                    onClick={handleNextQuestion}
                    className={`${
                      !isCorrect ? 'flex-1' : 'w-full'
                    } py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-base md:text-lg rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer font-display`}
                  >
                    <span>
                      {currentIdx + 1 < lesson.questions.length ? 'Câu tiếp theo' : 'Xem kết quả bài học'}
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Completion Result Screen
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-pop">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <Star className="w-12 h-12 fill-amber-400 text-amber-500" />
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-amber-950 font-display mb-1">
              CHÚC MỪNG BÉ HOÀN THÀNH!
            </h3>
            <p className="text-slate-600 text-sm font-semibold mb-6">
              Bé đã làm đúng <span className="text-amber-600 font-black">{score}</span> /{' '}
              {lesson.questions.length} câu hỏi của bài học:
              <br />
              <span className="text-slate-900 font-bold">{lesson.title}</span>
            </p>

            {/* Earned Rewards */}
            <div className="flex items-center gap-4 py-3 px-6 bg-amber-50 rounded-2xl border-2 border-amber-200 mb-6">
              <div className="flex items-center gap-2 text-amber-700 font-black text-base">
                <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
                <span>+{lesson.starReward} Sao</span>
              </div>
              <div className="flex items-center gap-2 text-purple-700 font-black text-base">
                <Sparkles className="w-6 h-6 text-purple-500" />
                <span>+{lesson.xpReward} XP</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-700 font-black text-base">
                <span>🎟️</span>
                <span>+1 Vé Chơi</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full max-w-sm">
              <button
                onClick={handleRetryLesson}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all active:scale-95 text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Học lại</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black rounded-2xl shadow-lg transition-transform active:scale-95 text-sm"
              >
                <span>Về bản đồ</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
