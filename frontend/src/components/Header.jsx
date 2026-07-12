import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { resolveUrl } from "@/lib/api";

export const Header = () => {
  const { settings } = useSettings();
  const b = settings?.branding || {};
  const logoText = b.logo_text || "Uonogamesapk";

  return (
    <header data-testid="app-header" className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/" data-testid="logo-link" className="flex items-center gap-2">
          {b.logo_url ? (
            <img src={resolveUrl(b.logo_url)} alt={logoText} className="h-8 w-auto max-w-[160px] object-contain" />
          ) : (
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#FFC107] to-[#FFB300] shadow-[0_4px_12px_rgba(255,193,7,0.4)]">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div className="leading-none">
                <span className="font-display text-[15px] font-extrabold tracking-tight text-[#111111]">{logoText}</span>
                <span className="font-display text-[15px] font-extrabold tracking-tight text-[#FFB300]">apk</span>
              </div>
            </>
          )}
        </Link>
        <span className="rounded-full bg-[#F0FDF4] px-2.5 py-1 text-[11px] font-semibold text-[#22C55E]">
          Verified Store
        </span>
      </div>
    </header>
  );
};

export default Header;
