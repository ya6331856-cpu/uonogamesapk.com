import { useEffect, useState } from "react";

const PREFIX = "Welcome to the ";
const BRAND = "UONOGAMESAPK.COM";
const FULL = PREFIX + BRAND;

// Typewriter welcome heading: types the text out, pauses, then restarts.
export const WelcomeTypewriter = () => {
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState("typing"); // typing | pausing | deleting

  useEffect(() => {
    let timeout;
    if (phase === "typing") {
      if (count < FULL.length) {
        timeout = setTimeout(() => setCount((c) => c + 1), 75);
      } else {
        timeout = setTimeout(() => setPhase("pausing"), 1800);
      }
    } else if (phase === "pausing") {
      timeout = setTimeout(() => setPhase("deleting"), 400);
    } else if (phase === "deleting") {
      if (count > 0) {
        timeout = setTimeout(() => setCount((c) => c - 1), 35);
      } else {
        timeout = setTimeout(() => setPhase("typing"), 400);
      }
    }
    return () => clearTimeout(timeout);
  }, [count, phase]);

  const typed = FULL.slice(0, count);
  const prefixPart = typed.slice(0, PREFIX.length);
  const brandPart = count > PREFIX.length ? typed.slice(PREFIX.length) : "";

  return (
    <div className="px-4 pt-4" data-testid="welcome-typewriter">
      <h2 className="text-center font-display text-lg font-extrabold tracking-tight sm:text-xl">
        <span className="text-[#111111]">{prefixPart}</span>
        <span className="bg-gradient-to-r from-[#FFC107] to-[#FF9800] bg-clip-text text-transparent drop-shadow-[0_1px_2px_rgba(255,193,7,0.25)]">
          {brandPart}
        </span>
        <span className="ml-0.5 inline-block h-[1.1em] w-[3px] translate-y-[3px] animate-pulse rounded-full bg-[#FFB300]" />
      </h2>
    </div>
  );
};

export default WelcomeTypewriter;
