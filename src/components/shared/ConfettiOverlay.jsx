import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function ConfettiOverlay({ trigger, winner = false }) {
  useEffect(() => {
    if (!trigger) return;
    if (winner) {
      const duration = 3000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    } else {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'],
      });
    }
  }, [trigger, winner]);

  return null;
}
