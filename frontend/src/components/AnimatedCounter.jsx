import { useEffect, useRef, useState } from "react";
import { formatCount } from "@/lib/format";

/**
 * Animated number counter that runs when scrolled into view and
 * re-runs if the target value changes (e.g. after async data load).
 */
export const AnimatedCounter = ({ value = 0, className, compact = true }) => {
  const [display, setDisplay] = useState(0);
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setInView(true);
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || !value) return;
    const duration = 1200;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.floor(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setDisplay(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref} className={className}>
      {compact ? formatCount(display) : display.toLocaleString()}
    </span>
  );
};

export default AnimatedCounter;
