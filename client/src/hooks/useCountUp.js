import { useEffect, useRef, useState } from "react";

/**
 * useCountUp — Animates a number from 0 to `target` over `duration` ms.
 * Respects prefers-reduced-motion: returns final value instantly.
 */
export function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    // Skip animation if user prefers reduced motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setValue(target);
      return;
    }

    if (target === 0) {
      setValue(0);
      return;
    }

    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out: 1 - (1 - t)^3
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return value;
}
