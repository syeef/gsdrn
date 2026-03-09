import { useEffect, useRef, useState } from "react";

export function useDockNavMeasure() {
  const navMeasureGhostRef = useRef<HTMLDivElement | null>(null);
  const [navWidth, setNavWidth] = useState<number | null>(null);
  const [isMeasured, setIsMeasured] = useState(false);

  useEffect(() => {
    const el = navMeasureGhostRef.current;
    if (!el) return;

    const commit = () => {
      const rect = el.getBoundingClientRect();
      // ✅ only accept real measurements
      if (rect.width > 0) {
        setNavWidth(rect.width);
        setIsMeasured(true);
      }
    };

    const ro = new ResizeObserver(() => commit());
    ro.observe(el);

    // ✅ immediate + next frame (handles “coming back from Command Bar” layout settling)
    commit();
    requestAnimationFrame(commit);

    return () => ro.disconnect();
  }, []);

  return { navMeasureGhostRef, navWidth, isMeasured };
}
