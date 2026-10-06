import React from 'react';
import { Volume2, VolumeX, X, Trophy, Star, Sparkles, RotateCcw } from 'lucide-react';
import { sound } from '../../services/sound';
import { fireCelebrationConfetti } from '../../services/confetti';
import { StorageService } from '../../services/storage';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface GameModalWrapperProps {
  title: string;
  subtitle: string;
  mascotEmoji: string;
  score: number;
  maxScore?: number;
  isGameOver: boolean;
  onRestart: () => void;
  onExit: () => void;
  children: React.ReactNode;
  instructions: string;
  audioInstruction?: string;
  earnedXp?: number;
  earnedStars?: number;
}

export const GameModalWrapper: React.FC<GameModalWrapperProps> = ({
  title,
  subtitle,
  mascotEmoji,
  score,
  maxScore = 5,
  isGameOver,
  onRestart,
  onExit,
  children,
  instructions,
  audioInstruction,
  earnedXp = 25,
  earnedStars = 2,
}) => {
  const [isMuted, setIsMuted] = React.useState(sound.getMuted());
  const [hasClaimed, setHasClaimed] = React.useState(false);
  const dialogRef = useFocusTrap<HTMLDivElement>(true);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  };

  const playInstructionVoice = () => {
    sound.speak(audioInstruction || instructions);
  };

  React.useEffect(() => {
    // Play voice prompt on game start
    if (audioInstruction || instructions) {
      sound.speak(audioInstruction || instructions);
    }
  }, [instructions, audioInstruction]);

  React.useEffect(() => {
    if (isGameOver && !hasClaimed) {
      sound.playLevelUp();
      fireCelebrationConfetti();
      StorageService.recordGamePlayed(earnedXp, earnedStars);
      setHasClaimed(true);
    }
  }, [isGameOver, hasClaimed, earnedXp, earnedStars]);

  const handleRestart = () => {
    setHasClaimed(false);
    onRestart();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/70 backdrop-blur-sm animate-pop">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="relative w-full max-w-4xl h-[92vh] max-h-[780px] bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl shadow-2xl flex flex-col overflow-hidden border-4 border-amber-300"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/90 border-b-2 border-amber-200">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">{mascotEmoji}</span>
            <div>
              <h2 className="text-lg md:text-xl font-black text-amber-900 tracking-wide font-display">
                {title}
              </h2>
              <p className="text-xs text-amber-700 font-semibold hidden sm:block">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Score pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 rounded-full border border-amber-300">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span className="text-sm font-black text-amber-900">
                {score} / {maxScore}
              </span>
            </div>

            {/* Read instruction button */}
            <button
              onClick={playInstructionVoice}
              aria-label="Đọc hướng dẫn bằng giọng nói"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-all active:scale-95"
            >
              <Volume2 className="w-5 h-5" aria-hidden="true" />
            </button>

            {/* Mute toggle */}
            <button
              onClick={toggleSound}
              aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              aria-pressed={isMuted}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-all active:scale-95"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-red-500" aria-hidden="true" />
              ) : (
                <Volume2 className="w-5 h-5" aria-hidden="true" />
              )}
            </button>

            {/* Close button */}
            <button
              onClick={onExit}
              aria-label="Đóng trò chơi và quay lại"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-all active:scale-95 ml-1"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Instruction Banner */}
        <div className="px-4 py-2 bg-amber-100/70 border-b border-amber-200 flex items-center justify-between text-xs md:text-sm text-amber-900 font-bold">
          <div className="flex items-center gap-2 truncate">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="truncate">{instructions}</span>
          </div>
          <button
            onClick={playInstructionVoice}
            className="text-xs text-blue-700 hover:underline shrink-0 ml-2 font-black"
          >
            Nghe lại 🔊
          </button>
        </div>

        {/* Game Stage Area */}
        <div className="flex-1 relative overflow-hidden p-3 md:p-6 flex flex-col items-center justify-center">
          {children}

          {/* Victory Modal Overlay */}
          {isGameOver && (
            <div className="absolute inset-0 z-30 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-pop">
              <div className="w-full max-w-md bg-white rounded-3xl p-6 md:p-8 text-center shadow-2xl border-4 border-yellow-400">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <Trophy className="w-12 h-12 text-amber-500 fill-amber-400" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-amber-900 mb-2 font-display">
                  HOAN HÔ BÉ YÊU!
                </h3>
                <p className="text-slate-600 text-sm md:text-base font-semibold mb-6">
                  Bé đã xuất sắc hoàn thành thử thách với điểm số{' '}
                  <span className="text-amber-600 font-black">{score}</span> điểm!
                </p>

                {/* Rewards preview */}
                <div className="flex items-center justify-center gap-4 py-3 px-4 bg-amber-50 rounded-2xl border-2 border-amber-200 mb-6">
                  <div className="flex items-center gap-2 text-amber-700 font-black text-base">
                    <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
                    <span>+{earnedStars} Sao</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-700 font-black text-base">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                    <span>+{earnedXp} XP</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRestart}
                    className="flex-1 py-3 px-4 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95 text-sm md:text-base"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Chơi lại
                  </button>
                  <button
                    onClick={onExit}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-2xl shadow-lg transition-transform active:scale-95 text-sm md:text-base"
                  >
                    Tiếp tục học
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
