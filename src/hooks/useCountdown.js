import { useEffect, useState, useRef } from 'react';

const ROUND_DURATION_MS = 10_000;

export function useCountdown(startedAt, onExpire) {
  const [remaining, setRemaining] = useState(ROUND_DURATION_MS);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (!startedAt) return;
    expiredRef.current = false;

    const tick = () => {
      const startMs = startedAt.toMillis ? startedAt.toMillis() : startedAt.seconds * 1000;
      const elapsed = Date.now() - startMs;
      const left = Math.max(0, ROUND_DURATION_MS - elapsed);
      setRemaining(left);
      if (left === 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
    };

    tick();
    const interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  }, [startedAt, onExpire]);

  const seconds = Math.ceil(remaining / 1000);
  const progress = remaining / ROUND_DURATION_MS; // 1 → 0

  return { remaining, seconds, progress };
}
