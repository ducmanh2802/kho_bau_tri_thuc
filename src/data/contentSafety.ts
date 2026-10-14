/**
 * T02/A7 — Content safety for Grade-1 game content.
 *
 * Single list of forbidden tokens (exact, tone-sensitive) scanned by
 * tests/games-content.test.ts across every game pool: sad/scary/adult words
 * plus the specific wrong items flagged in the P42 audit (B5).
 */

export const BANNED_WORDS: readonly string[] = [
  // Audit B5 — unsuitable for 6-year-olds
  'mả',
  'mộ',
  'thù',
  'thê',
  'gả',
  'thạ',
  'mụ',
  // Sad / scary / adult (00_RULES §5)
  'ma',
  'quỷ',
  'chết',
  'giết',
  'đánh',
  'đấm',
  'sợ',
  'khóc',
  'buồn',
  'cô đơn',
  'mồ',
  'hận',
  'ly dị',
  'vũ khí',
];

/** Split text into lowercase word tokens (tone-sensitive, keeps Vietnamese). */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-zà-ỹđêôơưăâî]+/u)
    .filter(Boolean);
}

/** True when the text contains any banned token (exact match). */
export function containsBannedWord(text: string): boolean {
  const tokens = new Set(tokenize(text));
  return BANNED_WORDS.some((w) => tokens.has(w.toLowerCase()));
}

/** All banned tokens found in the text (for reporting). */
export function findBannedWords(text: string): string[] {
  const tokens = new Set(tokenize(text));
  return BANNED_WORDS.filter((w) => tokens.has(w.toLowerCase()));
}
