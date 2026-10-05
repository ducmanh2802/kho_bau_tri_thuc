import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';
import { sound } from '../../services/sound';

interface ScreenTimeModalProps {
  isOpen: boolean;
  minutesSpent: number;
  onExtend: () => void;
  onTakeBreak: () => void;
}

export const ScreenTimeModal: React.FC<ScreenTimeModalProps> = ({
  isOpen,
  minutesSpent,
  onExtend,
  onTakeBreak,
}) => {
  if (!isOpen) return null;

  const playVoice = () => {
    sound.speak('Hôm nay bé đã học rất chăm chỉ rồi! Hãy để mắt nghỉ ngơi một chút nhé!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-pop select-none">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 md:p-8 text-center shadow-2xl border-4 border-amber-300">
        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <span className="text-5xl">🦉</span>
        </div>

        <h3 className="text-2xl font-black text-amber-950 font-display mb-2">
          GIỜ NGHỈ NGƠI CHO MẮT SÁNG!
        </h3>

        <p className="text-slate-600 text-sm font-semibold leading-relaxed mb-6">
          Bé ơi, hôm nay bé đã học chăm chỉ suốt <span className="text-amber-600 font-bold">{minutesSpent} phút</span> rồi.
          Hãy cùng đứng dậy vươn vai, uống một cốc nước mát và trò chuyện cùng ba mẹ nhé!
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              playVoice();
              onTakeBreak();
            }}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Heart className="w-5 h-5 fill-white" />
            <span>Nghỉ ngơi thôi nào!</span>
          </button>

          <button
            onClick={onExtend}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-slate-500" />
            <span>Ba mẹ: Cho phép học thêm 10 phút</span>
          </button>
        </div>
      </div>
    </div>
  );
};
