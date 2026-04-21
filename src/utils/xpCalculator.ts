/** Her 100 XP = bir seviye (Prompt 5 ile uyumlu) */
export function getLevelFromXP(xp: number): number {
  if (xp < 0) return 1;
  return Math.floor(xp / 100) + 1;
}
