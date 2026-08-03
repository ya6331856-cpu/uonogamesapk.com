import { Link } from "react-router-dom";
import { useSettings } from "@/context/SettingsContext";
import { resolveUrl } from "@/lib/api";

/**
 * YONO GAMES header — dark theme with YG shield + brand lockup.
 * Uses settings.branding.logo_url if the admin has uploaded a custom variant,
 * otherwise falls back to the packaged /logo-icon-v2.png (YG shield).
 */
export const Header = () => {
  const { settings } = useSettings();
  const b = settings?.branding || {};
  const iconSrc = b.logo_url ? resolveUrl(b.logo_url) : "/logo-icon-v2.png";

  return (
    <header
      data-testid="app-header"
      className="sticky top-0 z-40 border-b border-[#1a1a1a] bg-[#0A0A0A]/95 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between px-4 py-2.5">
        <Link to="/" data-testid="logo-link" className="flex items-center gap-2.5">
          <img
            src={iconSrc}
            alt="YONO GAMES - Play and Win"
            className="h-10 w-10 shrink-0 rounded-[10px] object-contain shadow-[0_4px_14px_rgba(255,193,7,0.35)]"
          />
          <div className="flex flex-col leading-none">
            <span className="font-display text-[15px] font-extrabold tracking-tight">
              <span className="text-[#22C55E]">YONO</span>{" "}
              <span className="bg-gradient-to-r from-[#FFD54F] to-[#FFB300] bg-clip-text text-transparent">GAMES</span>
            </span>
            <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#FFD54F]/80">
              Play <span className="text-[#22C55E]">&amp;</span> Win
            </span>
          </div>
        </Link>
        <span className="rounded-full border border-[#22C55E]/40 bg-[#22C55E]/10 px-2.5 py-1 text-[11px] font-semibold text-[#22C55E]">
          Verified
        </span>
      </div>
    </header>
  );
};

export default Header;
