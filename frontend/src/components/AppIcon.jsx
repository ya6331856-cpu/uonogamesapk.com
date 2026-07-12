import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Lazy-loaded app icon with shimmer placeholder and graceful fallback.
 */
export const AppIcon = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-[#f1f2f4]", className)}>
      {!loaded && !error && <div className="shimmer absolute inset-0" />}
      {error ? (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FFC107] to-[#FFB300] text-white">
          <span className="font-display text-lg font-bold">
            {(alt || "?").charAt(0).toUpperCase()}
          </span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </div>
  );
};

export default AppIcon;
