import { useEffect, useState } from "react";

export default function useCountUp(target, { duration = 800, enabled = true } = {}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return undefined;
    }

    const end = Number(target) || 0;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(end * eased);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
    return undefined;
  }, [target, duration, enabled]);

  return value;
}
