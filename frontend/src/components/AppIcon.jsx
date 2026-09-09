import { useState } from "react";
import { ImageIcon } from "lucide-react";

export default function AppIcon({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Magic 🚀: Global CDN Cache lagaya gaya hai image ko 10x fast aur compress karne ke liye
  const optimizedSrc = src?.startsWith("http") 
    ? `https://wsrv.nl/?url=${encodeURIComponent(src)}&w=144&h=144&output=webp&we` 
    : src;

  return (
    <div className={`relative overflow-hidden bg-[#F8F9FA] ${className}`}>
      {/* Jab tak image load nahi hoti, tab tak chamakta hua skeleton dikhega */}
      {!loaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-tr from-[#E5E7EB] to-[#F3F4F6]" />
      )}
      
      {/* Agar image fail ho jaye, toh toota hua link nahi, ek icon dikhega */}
      {error ? (
        <div className="flex h-full w-full items-center justify-center bg-[#F1F2F4]">
          <ImageIcon className="h-1/3 w-1/3 text-[#CCCCCC]" />
        </div>
      ) : (
        <img
          src={optimizedSrc || src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
