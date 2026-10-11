import { useRef, useState } from 'react';
import { GAME_LEVEL_POLICY } from '../config/policy';
import { clampTier, getTierMeta, type GameTierMeta } from '../data/gameLevels';
import { StorageService } from '../services/storage';

export type GameStagePhase = 'playing' | 'tierComplete' | 'allComplete';

export interface UseGameStageOptions {
  gameId: string;
  /** Objectives/rounds inside each tier (index 0 = tier 1). Length = tier count. */
  roundsPerTier: number[];
  /** Pause between a correct answer and the next objective (ms). */
  advanceDelayMs?: number;
  /** Force the starting tier instead of the highest unlocked one. */
  startTier?: number;
}

export interface GameStage {
  tier: number;
  tierMeta: GameTierMeta;
  tierCount: number;
  roundIdx: number;
  roundNumber: number;
  roundTotal: number;
  score: number;
  mistakesInTier: number;
  isLastTier: boolean;
  phase: GameStagePhase;
  isGameOver: boolean;
  locked: boolean;
  starsEarned: number;
  xpEarned: number;
  submitCorrect: () => void;
  submitWrong: () => void;
  startNextTier: () => void;
  restartGame: () => void;
}

function computeStars(mistakes: number): number {
  if (mistakes <= GAME_LEVEL_POLICY.STAR_THREE_MAX_MISTAKES) return 3;
  if (mistakes <= GAME_LEVEL_POLICY.STAR_TWO_MAX_MISTAKES) return 2;
  return 1;
}

/**
 * Level state machine shared by every arcade game. Handles the tier ladder
 * (easy -> super hard, unlock the next on finish), per-tier stars, XP rewards
 * and persistence through StorageService.
 */
export function useGameStage(options: UseGameStageOptions): GameStage {
  const { gameId, roundsPerTier, advanceDelayMs = 1100 } = options;
  const tierCount = roundsPerTier.length;

  const [tier, setTier] = useState(() =>
    clampTier(options.startTier ?? StorageService.getGameProgress(gameId).unlockedTier)
  );
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakesInTier, setMistakesInTier] = useState(0);
  const [locked, setLocked] = useState(false);
  const [phase, setPhase] = useState<GameStagePhase>('playing');
  const [starsEarned, setStarsEarned] = useState(0);
  const timerRef = useRef<number | null>(null);

  const tierSafe = clampTier(tier);
  const roundTotal = roundsPerTier[Math.min(tierSafe - 1, roundsPerTier.length - 1)] ?? 1;
  const tierMeta = getTierMeta(tierSafe);
  const isLastTier = tierSafe >= Math.max(tierCount, 1);
  const xpEarned = GAME_LEVEL_POLICY.XP_PER_TIER[Math.min(tierSafe - 1, GAME_LEVEL_POLICY.XP_PER_TIER.length - 1)];

  const submitCorrect = () => {
    if (locked || phase !== 'playing') return;
    setScore((s) => s + 1);
    setLocked(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setLocked(false);
      if (roundIdx + 1 < roundTotal) {
        setRoundIdx((i) => i + 1);
      } else {
        const stars = computeStars(mistakesInTier);
        StorageService.completeGameTier(gameId, tierSafe, stars, score + 1);
        setStarsEarned(stars);
        setPhase(isLastTier ? 'allComplete' : 'tierComplete');
      }
    }, advanceDelayMs);
  };

  const submitWrong = () => {
    if (locked || phase !== 'playing') return;
    setMistakesInTier((m) => m + 1);
  };

  const startNextTier = () => {
    if (phase !== 'tierComplete') return;
    setTier((t) => clampTier(t + 1));
    setRoundIdx(0);
    setMistakesInTier(0);
    setLocked(false);
    setPhase('playing');
    setStarsEarned(0);
  };

  const restartGame = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    setTier(clampTier(StorageService.getGameProgress(gameId).unlockedTier));
    setRoundIdx(0);
    setScore(0);
    setMistakesInTier(0);
    setLocked(false);
    setPhase('playing');
    setStarsEarned(0);
  };

  return {
    tier: tierSafe,
    tierMeta,
    tierCount,
    roundIdx,
    roundNumber: roundIdx + 1,
    roundTotal,
    score,
    mistakesInTier,
    isLastTier,
    phase,
    isGameOver: phase === 'allComplete',
    locked,
    starsEarned,
    xpEarned,
    submitCorrect,
    submitWrong,
    startNextTier,
    restartGame,
  };
}