import { useEffect, useState } from "react";

type Props = {
  value: number;
  decimals?: number;
  durationMs?: number;
};

export function AnimatedNumber({
  value,
  decimals = 0,
  durationMs = 420,
}: Props) {
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const from = shown;
    const to = value;
    if (from === to) return;

    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - t) ** 3;
      setShown(from + (to - from) * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- animate from last shown
  }, [value, durationMs]);

  return <>{shown.toFixed(decimals)}</>;
}
