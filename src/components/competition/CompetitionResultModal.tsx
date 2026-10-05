import React from 'react';
import { CompetitionExamResult } from '../../types/competition';
import { sound } from '../../services/sound';
import { fireCelebrationConfetti } from '../../services/confetti';
import {
  Trophy,
  Star,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';

interface CompetitionResultModalProps {
  result: CompetitionExamResult;
  onClose: () => void;
  onRetake: () => void;
  onStartRemediation: (weakSkills: string[]) => void;
}

export const CompetitionResultModal: React.FC<CompetitionResultModalProps> = ({
  result,
  onClose,
  onRetake,
  onStartRemediation,
}) => {
  React.useEffect(() => {
    if (result.accuracy >= 70) {
      sound.playLevelUp();
      fireCelebrationConfetti();
    } else {
      sound.playStar();
    }
  }, [result]);

  const formatMinutesSeconds = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/80 backdrop-blur-md animate-pop">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-amber-300">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 p-5 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-3xl shadow-inner">
              🏆
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black font-display tracking-tight text-white drop-shadow-xs">
                KẾT QUẢ BÀI THI
              </h2>
              <p className="text-xs md:text-sm text-amber-100 font-bold">{result.examTitle}</p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-center">
              <span className="text-xs font-bold text-amber-800 block mb-0.5">Điểm Số</span>
              <span className="text-2xl md:text-3xl font-black text-amber-950 font-display">
                {result.score}/10
              </span>
            </div>

            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
              <span className="text-xs font-bold text-emerald-800 block mb-0.5">Độ Chính Xác</span>
              <span className="text-2xl md:text-3xl font-black text-emerald-950 font-display">
                {result.accuracy}%
              </span>
            </div>

            <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl text-center">
              <span className="text-xs font-bold text-sky-800 block mb-0.5">Số Câu Đúng</span>
              <span className="text-2xl md:text-3xl font-black text-sky-950 font-display">
                {result.correctCount}/{result.totalQuestions}
              </span>
            </div>

            <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl text-center">
              <span className="text-xs font-bold text-indigo-800 block mb-0.5">Thời Gian</span>
              <span className="text-lg md:text-xl font-black text-indigo-950 font-display mt-1 block">
                {formatMinutesSeconds(result.timeUsedSeconds)}
              </span>
            </div>
          </div>

          {/* Speed & Feedback Banner */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex items-center gap-3">
            <div className="p-2.5 bg-amber-200 text-amber-900 rounded-xl shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black uppercase text-amber-800 tracking-wider">
                Đánh giá nhịp độ & phản xạ
              </span>
              <p className="text-sm font-bold text-slate-800">{result.speedLabel}</p>
              <p className="text-xs text-slate-500">
                Trung bình khoảng {result.averageSecondsPerQuestion} giây / một câu hỏi.
              </p>
            </div>
          </div>

          {/* Strengths & Skills to practice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
              <h4 className="text-sm font-black text-emerald-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Điểm Mạnh Của Bé
              </h4>
              {result.strongSkills.length > 0 ? (
                <ul className="text-xs font-bold text-emerald-800 space-y-1">
                  {result.strongSkills.map((s, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span>⭐</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500">Bé cần luyện tập thêm để làm chủ các kỹ năng.</p>
              )}
            </div>

            <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-2">
              <h4 className="text-sm font-black text-rose-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Kỹ Năng Cần Luyện Thêm
              </h4>
              {result.weakSkills.length > 0 ? (
                <ul className="text-xs font-bold text-rose-800 space-y-1">
                  {result.weakSkills.map((s, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span>🎯</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-emerald-700 font-bold">
                  Tuyệt vời! Bé không có kỹ năng nào dưới 60%.
                </p>
              )}
            </div>
          </div>

          {/* Error Analysis & Detailed Mistake Review */}
          {result.errorAnalysis.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-base font-black text-slate-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                Xem Lại Các Câu Cần Lưu Ý ({result.errorAnalysis.length} câu)
              </h4>

              <div className="space-y-3">
                {result.errorAnalysis.map((err, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-800">
                        Câu {idx + 1}: {err.skillName}
                      </span>
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-md font-bold text-[10px]">
                        {err.category === 'CARELESS_ERROR'
                          ? 'Bấm vội'
                          : err.category === 'REASONING_ERROR'
                          ? 'Nhầm suy luận'
                          : 'Cần ôn lại'}
                      </span>
                    </div>

                    <p className="font-bold text-slate-800 text-sm">{err.prompt}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div className="p-2 bg-rose-100/60 rounded-xl border border-rose-200">
                        <span className="text-[11px] text-rose-800 font-semibold block">Con đã chọn:</span>
                        <span className="font-bold text-rose-950">{err.userAnswer}</span>
                      </div>
                      <div className="p-2 bg-emerald-100/60 rounded-xl border border-emerald-200">
                        <span className="text-[11px] text-emerald-800 font-semibold block">Đáp án đúng:</span>
                        <span className="font-bold text-emerald-950">{err.correctAnswer}</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 font-medium">
                      <span className="font-bold block mb-0.5">💡 Giải thích chi tiết:</span>
                      <span>{err.explanation}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 italic">Lời khuyên: {err.advice}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Bottom Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              onRetake();
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-2xl font-bold text-xs text-slate-700 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Thi Thử Lại</span>
          </button>

          {result.weakSkills.length > 0 && (
            <button
              onClick={() => {
                sound.playClick();
                // Map weak skill names back to IDs or pass directly
                onStartRemediation(result.weakSkills);
              }}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer ml-auto"
            >
              <Sparkles className="w-4 h-4" />
              <span>Luyện Kỹ Năng Yếu Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className={`px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold text-xs transition-all cursor-pointer ${
              result.weakSkills.length === 0 ? 'ml-auto' : ''
            }`}
          >
            Hoàn Tất
          </button>
        </div>
      </div>
    </div>
  );
};
