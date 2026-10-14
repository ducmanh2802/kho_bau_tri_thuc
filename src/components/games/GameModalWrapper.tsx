import React from 'react';
import { Volume2, VolumeX, X, Trophy, Star, Sparkles, RotateCcw, Rocket, Lock, Megaphone } from 'lucide-react';
import { sound } from '../../services/sound';
import { fireCelebrationConfetti } from '../../services/confetti';
import { StorageService } from '../../services/storage';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useModalHistory } from '../../hooks/useModalHistory';

export interface GameTierMetaProp {
  id: number;
  name: string;
  emoji: string;
  color: string;
  blurb: string;
}

export type GamePhaseProp = 'playing' | 'tierComplete' | 'allComplete';

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
  /** TTS locale for instructions (P38: English games use en-GB). */
  audioLang?: 'vi-VN' | 'en-US' | 'en-GB';
  earnedXp?: number;
  earnedStars?: number;
  /** Level-progression fields (omit to use the simple free-play layout). */
  gameId?: string;
  tier?: number;
  tierMeta?: GameTierMetaProp;
  tierCount?: number;
  phase?: GamePhaseProp;
  roundNumber?: number;
  roundTotal?: number;
  starsEarned?: number;
  /** Best stars before this completion (T02/B2 fair replay). */
  prevBestStars?: number;
  nextTierMeta?: GameTierMetaProp;
  onNextTier?: () => void;
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
  audioLang = 'vi-VN',
  earnedXp = 25,
  earnedStars = 2,
  gameId,
  tier,
  tierMeta,
  tierCount,
  phase = 'playing',
  roundNumber,
  roundTotal,
  starsEarned,
  prevBestStars = 0,
  nextTierMeta,
  onNextTier,
}) => {
  const [isMuted, setIsMuted] = React.useState(sound.getMuted());
  const claimedKeys = React.useRef<Set<string>>(new Set());
  const [receipt, setReceipt] = React.useState<{ stars: number; xp: number } | null>(null);
  const dialogRef = useFocusTrap<HTMLDivElement>(true);
  // T01B/1 — Esc + nút Back (history) đóng modal game.
  const { requestClose } = useModalHistory(onExit);

  const isLevelGame = tier !== undefined && tierMeta !== undefined;
  const rewardKey = `${gameId ?? 'legacy'}-${tier ?? 1}-${phase}`;

  /**
   * T02/B1+B2 — award XP/stars once per tier finish. Tiered games use the
   * mistake-based starsEarned (no more hardcoded earnedStars) and replays pay
   * only the record delta + 20% practice XP via recordTierReward.
   */
  React.useEffect(() => {
    const finished = phase === 'tierComplete' || phase === 'allComplete';
    if (isLevelGame && finished && !claimedKeys.current.has(rewardKey)) {
      claimedKeys.current.add(rewardKey);
      sound.playLevelUp();
      fireCelebrationConfetti();
      const stars = starsEarned ?? earnedStars;
      if (gameId && tier !== undefined) {
        const r = StorageService.recordTierReward(gameId, tier, stars, earnedXp, score, prevBestStars);
        setReceipt({ stars: r.starsAwarded, xp: r.xpAwarded });
      } else {
        StorageService.recordGamePlayed(earnedXp, stars);
        setReceipt({ stars, xp: earnedXp });
      }
    } else if (!isLevelGame && isGameOver && !claimedKeys.current.has('legacy')) {
      claimedKeys.current.add('legacy');
      sound.playLevelUp();
      fireCelebrationConfetti();
      StorageService.recordGamePlayed(earnedXp, earnedStars);
      setReceipt({ stars: earnedStars, xp: earnedXp });
    }
  }, [isLevelGame, phase, isGameOver, rewardKey, earnedXp, earnedStars, starsEarned, prevBestStars, gameId, tier, score]);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  };

  const playInstructionVoice = () => {
    sound.speak(audioInstruction || instructions, audioLang);
  };

  React.useEffect(() => {
    // Play voice prompt on game start
    if (audioInstruction || instructions) {
      sound.speak(audioInstruction || instructions, audioLang);
    }
  }, [instructions, audioInstruction, audioLang]);

  const handleRestart = () => {
    claimedKeys.current.clear();
    setReceipt(null);
    onRestart();
  };

  const handleNextTier = () => {
    setReceipt(null);
    onNextTier?.();
  };

  const showOverlay = isLevelGame ? phase !== 'playing' : isGameOver;

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
        {/*
          T01B/1 — header game GỌN 1 DÒNG, vừa 343px (360–375px):
          nút đóng ĐỨNG ĐẦU (luôn hiện, 44px) → linh vật → tên game rút gọn
          (truncate, tooltip đầy đủ) + tiến độ dạng icon gọn → 2 icon khác nhau.
        */}
        <div className="flex items-center gap-1.5 px-2 py-2 bg-white/90 border-b-2 border-amber-200 min-h-[56px]">
          {/* Close button FIRST — always visible, never pushed out */}
          <button
            onClick={requestClose}
            data-testid="game-close"
            aria-label="Đóng trò chơi và quay lại"
            title="Đóng trò chơi (Esc)"
            className="min-w-[44px] min-h-[44px] shrink-0 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-all active:scale-95"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          <span className="text-2xl shrink-0 leading-none" aria-hidden="true">{mascotEmoji}</span>

          {/* Title + compact icon progress (flex-1, truncate) */}
          <div className="flex-1 min-w-0">
            <h2
              className="truncate text-sm font-black text-amber-900 tracking-wide font-display leading-tight"
              title={isLevelGame ? `${title} — Màn ${tier}/${tierCount}: ${tierMeta.name}` : `${title} — ${score}/${maxScore} sao`}
            >
              {title}
            </h2>
            <span className="sr-only">{subtitle}</span>
            <p className="truncate text-[11px] text-amber-700 font-bold leading-tight" aria-label={
              isLevelGame && roundTotal !== undefined
                ? `Màn ${tier} trên ${tierCount}, câu ${roundNumber ?? 1} trên ${roundTotal}`
                : `Được ${score} trên ${maxScore} sao`
            }>
              {isLevelGame ? (
                <span>
                  <span aria-hidden="true">{tierMeta.emoji} </span>
                  Màn {tier}/{tierCount}
                  {roundTotal !== undefined && (
                    <span> · 🚀 Câu {roundNumber ?? 1}/{roundTotal}</span>
                  )}
                  <span className="hidden min-[420px]:inline"> · {tierMeta.name}</span>
                </span>
              ) : (
                <span>
                  <span aria-hidden="true">⭐ </span>
                  {score}/{maxScore}
                </span>
              )}
            </p>
          </div>

          {/* Read instruction — MEGAPHONE icon, khác hẳn nút tắt tiếng */}
          <button
            onClick={playInstructionVoice}
            aria-label="Nghe hướng dẫn chơi"
            title="Nghe hướng dẫn chơi"
            className="min-w-[44px] min-h-[44px] shrink-0 flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-all active:scale-95"
          >
            <Megaphone className="w-5 h-5" aria-hidden="true" />
          </button>

          {/* Mute toggle — LOA icon + trạng thái rõ ràng */}
          <button
            onClick={toggleSound}
            aria-label={isMuted ? 'Bật âm thanh trò chơi' : 'Tắt âm thanh trò chơi'}
            title={isMuted ? 'Bật âm thanh trò chơi' : 'Tắt âm thanh trò chơi'}
            aria-pressed={isMuted}
            className="min-w-[44px] min-h-[44px] shrink-0 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-all active:scale-95"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-red-500" aria-hidden="true" />
            ) : (
              <Volume2 className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Instruction Banner */}
        <div className="px-4 py-2 bg-amber-100/70 border-b border-amber-200 flex items-center justify-between text-xs md:text-sm text-amber-900 font-bold">
          <div className="flex items-center gap-2 truncate">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="truncate">{instructions}</span>
          </div>
          <button
            onClick={playInstructionVoice}
            aria-label="Nghe lại hướng dẫn chơi"
            className="min-h-[44px] px-3 flex items-center text-xs text-blue-700 hover:underline shrink-0 ml-2 font-black"
          >
            Nghe lại 🔊
          </button>
        </div>

        {/* Game Stage Area */}
        <div className="flex-1 relative overflow-hidden p-3 md:p-6 flex flex-col items-center justify-center">
          {children}

          {showOverlay && (
            <div className="absolute inset-0 z-30 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-pop">
              {/* Tier-complete overlay (not the last tier) */}
              {isLevelGame && phase === 'tierComplete' ? (
                <div className="w-full max-w-md bg-white rounded-3xl p-6 md:p-8 text-center shadow-2xl border-4 border-yellow-400">
                  <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce">
                    <Trophy className="w-12 h-12 text-amber-500 fill-amber-400" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-amber-900 mb-1 font-display">
                    VƯỢT QUA MÀN {tier}!
                  </h3>
                  <p className="text-sm font-bold text-slate-500 mb-3">
                    {tierMeta.emoji} Màn «{tierMeta.name}» đã hoàn thành
                  </p>

                  {/* Stars earned */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {[1, 2, 3].map((i) => (
                      <Star
                        key={i}
                        className={`w-10 h-10 ${i <= (starsEarned ?? 1) ? 'fill-amber-400 text-amber-500' : 'fill-slate-200 text-slate-300'}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-4 py-3 px-4 bg-amber-50 rounded-2xl border-2 border-amber-200 mb-5">
                    <div className="flex items-center gap-2 text-amber-700 font-black text-base">
                      <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
                      <span>+{(receipt?.stars ?? earnedStars)} Sao</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-700 font-black text-base">
                      <Sparkles className="w-6 h-6 text-purple-500" />
                      <span>+{(receipt?.xp ?? earnedXp)} XP</span>
                    </div>
                  </div>

                  {/* Next tier unlock preview */}
                  {nextTierMeta && (
                    <div className="flex items-center justify-center gap-2 px-4 py-2 mb-5 bg-blue-50 rounded-2xl border border-blue-200">
                      <Lock className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-black text-blue-800">
                        Màn tiếp theo đã mở khóa:
                      </span>
                      <span className="text-sm font-black text-blue-900">
                        {nextTierMeta.emoji} {nextTierMeta.name}
                      </span>
                      <span className="text-[11px] text-blue-600 font-bold">{nextTierMeta.blurb}</span>
                    </div>
                  )}

                  <button
                    onClick={handleNextTier}
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black rounded-2xl shadow-lg transition-transform active:scale-95 text-base md:text-lg flex items-center justify-center gap-2"
                  >
                    <Rocket className="w-5 h-5" />
                    Màn tiếp theo ▶
                  </button>
                </div>
              ) : (
                /* Victory overlay (free-play games or the final crown tier) */
                <div className="w-full max-w-md bg-white rounded-3xl p-6 md:p-8 text-center shadow-2xl border-4 border-yellow-400">
                  <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <Trophy className="w-12 h-12 text-amber-500 fill-amber-400" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-amber-900 mb-2 font-display">
                    {isLevelGame ? 'HOÀN THÀNH TẤT CẢ MÀN!' : 'HOAN HÔ BÉ YÊU!'}
                  </h3>
                  <p className="text-slate-600 text-sm md:text-base font-semibold mb-6">
                    {isLevelGame
                      ? `Bé đã vượt qua cả ${tierCount} màn của trò chơi với ${score} điểm!`
                      : `Bé đã xuất sắc hoàn thành thử thách với điểm số ${score} điểm!`}
                  </p>

                  {isLevelGame && (
                    <div className="flex items-center justify-center gap-2 mb-4">
                      {[1, 2, 3].map((i) => (
                        <Star
                          key={i}
                          className={`w-10 h-10 ${i <= (starsEarned ?? 1) ? 'fill-amber-400 text-amber-500' : 'fill-slate-200 text-slate-300'}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Rewards preview */}
                  <div className="flex items-center justify-center gap-4 py-3 px-4 bg-amber-50 rounded-2xl border-2 border-amber-200 mb-6">
                    <div className="flex items-center gap-2 text-amber-700 font-black text-base">
                      <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
                      <span>+{(receipt?.stars ?? earnedStars)} Sao</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-700 font-black text-base">
                      <Sparkles className="w-6 h-6 text-purple-500" />
                      <span>+{(receipt?.xp ?? earnedXp)} XP</span>
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
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};