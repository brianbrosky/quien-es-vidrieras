const BASE_POINTS = 1000;
const MAX_TIME_BONUS = 1000;
const ROUND_DURATION_MS = 10_000;

export function calculatePoints(isCorrect, answeredAt, startedAt) {
  if (!isCorrect) return 0;
  const elapsed = answeredAt.toMillis() - startedAt.toMillis();
  const ratio = Math.max(0, 1 - elapsed / ROUND_DURATION_MS);
  return BASE_POINTS + Math.round(MAX_TIME_BONUS * ratio);
}
