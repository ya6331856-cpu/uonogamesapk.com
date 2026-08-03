import { Link } from "react-router-dom";
import { Send, ArrowUp, ShieldCheck, Instagram, Youtube, Twitter } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

const FOOTER_LINKS = [
  { id: "privacy-policy", label: "Privacy Policy" },
  { id: "terms", label: "Terms & Conditions" },
  { id: "website-disclaimer", label: "Disclaimer" },
  { id: "dmca", label: "DMCA" },
  { id: "contact", label: "Contact" },
];

export const SiteFooter = ({ onOpenLegal }) => {
  const { settings } = useSettings();
  const b = settings?.branding || {};
  const c = settings?.contact || {};
  const tg = settings?.telegram || {};
  const year = new Date().getFullYear();
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const socials = [
    { key: "instagram", url: c.instagram, Icon: Instagram },
    { key: "youtube", url: c.youtube, Icon: Youtube },
    { key: "twitter", url: c.twitter, Icon: Twitter },
  ].filter((s) => s.url);

  return (
    <footer data-testid="site-footer" className="mt-8 border-t border-[#1a1a1a] bg-[#0A0A0A] px-4 pb-8 pt-6 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/logo-icon-v2.png" alt="YONO GAMES" className="h-10 w-10 rounded-[10px] object-contain" />
          <div className="leading-none">
            <div className="font-display text-sm font-extrabold tracking-tight">
              <span className="text-[#22C55E]">YONO</span>{" "}
              <span className="bg-gradient-to-r from-[#FFD54F] to-[#FFB300] bg-clip-text text-transparent">GAMES</span>
            </div>
            <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FFD54F]/80">
              Play <span className="text-[#22C55E]">&amp;</span> Win
            </div>
          </div>
        </div>
        <button onClick={scrollTop} data-testid="back-to-top" aria-label="Back to top"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFC107] text-[#111111] shadow-[0_6px_16px_rgba(255,193,7,0.4)] transition-transform duration-150 active:scale-90">
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-white/60">
        {b.footer_text || "India's most trusted rummy & gaming APK platform. Play cash games, win real money, instant withdrawals."}
      </p>

      <nav className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        {FOOTER_LINKS.map((l) => (
          <button key={l.id} data-testid={`footer-link-${l.id}`} onClick={() => onOpenLegal(l.id)}
            className="text-xs font-medium text-white/70 transition-colors hover:text-[#FFD54F]">
            {l.label}
          </button>
        ))}
      </nav>

      <div className="mt-4 flex items-center gap-3">
        <a href={tg.link || "https://t.me/"} target="_blank" rel="noopener noreferrer" data-testid="footer-telegram"
          className="inline-flex items-center gap-2 rounded-full bg-[#229ED9] px-4 py-2 text-xs font-semibold text-white shadow-[0_6px_16px_rgba(34,158,217,0.35)] transition-transform duration-150 active:scale-95">
          <Send className="h-3.5 w-3.5" /> {tg.cta_text || "Join our Telegram"}
        </a>
        {socials.map(({ key, url, Icon }) => (
          <a key={key} href={url} target="_blank" rel="noopener noreferrer" data-testid={`footer-social-${key}`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/60 transition-colors hover:text-[#FFD54F]">
            <Icon className="h-4 w-4" />
          </a>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
        <p className="text-[11px] text-white/50">© {year} YONO GAMES · uonogamesapk.com</p>
        <Link to="/admin/login" data-testid="admin-link" className="text-[11px] font-medium text-white/50 hover:text-[#FFD54F]">Admin</Link>
      </div>
    </footer>
  );
};

export default SiteFooter;
