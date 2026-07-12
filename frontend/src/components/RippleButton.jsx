import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Button with material-style ripple + press scale.
 * Passes through all button props.
 */
export const RippleButton = ({ className, children, onClick, ...props }) => {
  const ref = useRef(null);

  const createRipple = (e) => {
    const btn = ref.current;
    if (!btn) return;
    const circle = document.createElement("span");
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const radius = diameter / 2;
    const rect = btn.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.className = "ripple-span";
    const existing = btn.getElementsByClassName("ripple-span")[0];
    if (existing) existing.remove();
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  };

  const handleClick = (e) => {
    createRipple(e);
    onClick?.(e);
  };

  return (
    <button
      ref={ref}
      onClick={handleClick}
      className={cn(
        "ripple select-none transition-transform duration-150 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC107] focus-visible:ring-offset-1",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default RippleButton;
