import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Star, BadgeCheck, Download, Share2, Loader2,
  ShieldCheck, HardDrive, Tag, Smartphone, Building2, Sparkles,
  Gamepad2, Zap, Wifi, RefreshCw, Trophy, Lock, Gift, Wallet,
} from "lucide-react";
import { toast } from "sonner";
import api, { API, resolveUrl } from "@/lib/api";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import AppIcon from "@/components/AppIcon";
import RippleButton from "@/components/RippleButton";
import FaqSection from "@/components/FaqSection";
import LegalSection from "@/components/LegalSection";
import LegalDialog from "@/components/LegalDialog";
import SiteFooter from "@/components/SiteFooter";
import { formatCount, formatFull } from "@/lib/format";

const GAME_HIGHLIGHTS = [
  { icon: Zap, title: "Smooth 60 FPS", desc: "Optimized for buttery-smooth gameplay on all devices." },
  { icon: Wifi, title: "Online & Offline", desc: "Play anywhere, with or without an internet connection." },
  { icon: RefreshCw, title: "Regular Updates", desc: "Fresh content, levels and improvements added often." },
  { icon: Trophy, title: "Rewards & Leaderboards", desc: "Compete, earn rewards and climb the rankings." },
  { icon: Lock, title: "Safe & Secure", desc: "Malware-scanned and verified for a worry-free install." },
  { icon: Gamepad2, title: "Easy Controls", desc: "Intuitive touch controls that are simple to master." },
];

const Stat = ({ icon: Icon, label, value }) => (
  <div className="flex min-w-0 flex-1 flex-col items-center rounded-[16px] border border-[#E5E7EB] bg-white px-2 py-3 text-center shadow-[0_6px_20px_rgba(0,0,0,0.03)]">
    <Icon className="h-4 w-4 text-[#FFB300]" />
    <span className="mt-1 truncate font-display text-[13px] font-bold text-[#111111]">{value}</span>
    <span className="text-[10px] text-[#999999]">{label}</span>
  </div>
);

export default function AppDetail() {
  const { id, slug } = useParams();
  const key = slug || id;
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [legalId, setLegalId] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setRelated([]);
    api
      .get(`/apps/${key}`)
      .then((res) => {
        setApp(res.data);
        api.get(`/apps/${key}/related`, { params: { limit: 6 } })
          .then((r) => setRelated(r.data || []))
          .catch(() => {});
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [key]);

  const handleDownload = () => {
    if (!app) return;
    toast.success(`Starting download: ${app.name}`, { description: `${app.size} • v${app.version}` });
    window.open(`${API}/apps/${app.id}/download`, "_blank");
    setApp((p) => (p ? { ...p, downloads: (p.downloads || 0) + 1 } : p));
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: app?.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch (e) {
      /* user cancelled */
    }
  };

  if (loading) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#FFC107]" />
      </div>
    );
  }

  if (notFound || !app) {
    return (
      <div className="app-shell flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="font-display text-lg font-bold text-[#111111]">App not found</p>
        <RippleButton
          onClick={() => navigate("/")}
          data-testid="detail-back-home"
          className="rounded-full bg-[#FFC107] px-5 py-2.5 text-sm font-bold text-[#111111]"
        >
          Back to Store
        </RippleButton>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen pb-28" data-testid="app-detail-page">
      <SEOHead
        type="app"
        title={app.seo_title || `${app.name} APK Download - Latest Version | Uonogamesapk.com`}
        description={app.meta_description || (app.description || "").slice(0, 160) || `Download ${app.name} APK latest version for Android. Fast, safe and verified download at Uonogamesapk.com.`}
        keywords={app.keywords || `${app.name} apk, ${app.name} download, ${app.category?.toLowerCase()} apk`}
        canonical={`https://uonogamesapk.com/${app.slug || app.id}`}
        image={app.og_image || app.icon_url}
        noindex={!!app.noindex || !!app.hidden}
        app={app}
        breadcrumbs={[
          { name: app.category || "Apps", url: `/?category=${encodeURIComponent(app.category || "")}` },
          { name: app.name, url: `/${app.slug || app.id}` },
        ]}
        faqItems={(app.faq_items && app.faq_items.length) ? app.faq_items : [
          { question: `Is ${app.name} safe to download?`,
            answer: `Yes. ${app.name} is malware-scanned and verified before publishing on Uonogamesapk.com.` },
          { question: `How to install ${app.name} APK?`,
            answer: `Download the APK, enable "Install from unknown sources" in your Android settings, then tap the APK file to install.` },
          { question: `Is ${app.name} free to download?`,
            answer: `Yes, ${app.name} APK download is completely free on Uonogamesapk.com.` },
        ]}
      />
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#E5E7EB] bg-white/85 px-4 py-3 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} data-testid="detail-back" className="flex items-center gap-1 text-sm font-medium text-[#555555]">
          <ArrowLeft className="h-5 w-5" /> Back
        </button>
        <button onClick={handleShare} data-testid="detail-share" aria-label="Share" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] text-[#555555]">
          <Share2 className="h-4 w-4" />
        </button>
      </header>

      <main className="space-y-6 px-4 pt-4">
        <Breadcrumbs items={[
          { name: app.category || "Apps", url: `/?category=${encodeURIComponent(app.category || "")}` },
          { name: app.name, url: `/${app.slug || app.id}` },
        ]} />
        {/* App head */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-4"
        >
          <AppIcon
            src={resolveUrl(app.icon_url)}
            alt={`${app.name} APK icon - ${app.category || "Games"}`}
            className="h-[84px] w-[84px] shrink-0 rounded-[20px] ring-1 ring-black/5"
          />
          <div className="min-w-0 flex-1">
            <h1 data-testid="detail-name" className="font-display text-xl font-bold leading-tight text-[#111111]">
              {app.name}
            </h1>
            {app.developer && (
              <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-[#229ED9]">
                <Building2 className="h-3.5 w-3.5" /> {app.developer}
              </p>
            )}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="inline-flex items-center gap-0.5 rounded-full bg-[#FFF8E1] px-2 py-0.5 text-xs font-semibold text-[#111111]">
                <Star className="h-3 w-3 fill-[#FFC107] text-[#FFC107]" /> {app.rating?.toFixed(1)}
              </span>
              {app.verified && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-[#F0FDF4] px-2 py-0.5 text-xs font-semibold text-[#22C55E]">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified
                </span>
              )}
              <span className="rounded-full bg-[#F1F2F4] px-2 py-0.5 text-xs font-medium text-[#555555]">{app.category}</span>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="flex gap-2">
          <Stat icon={Download} label="Downloads" value={`${formatCount(app.downloads)}+`} />
          <Stat icon={HardDrive} label="Size" value={app.size} />
          <Stat icon={Tag} label="Version" value={app.version} />
          <Stat icon={Smartphone} label="Requires" value={(app.min_android || "").replace("Android ", "")} />
        </div>

        {/* Rummy rewards highlight */}
        {(app.signup_bonus || app.min_withdraw) && (
          <div className="flex gap-2" data-testid="detail-rewards">
            {app.signup_bonus && (
              <div className="flex flex-1 items-center gap-2.5 rounded-[16px] border border-[#FFE082] bg-gradient-to-br from-[#FFF8E1] to-[#FFFBEB] px-3 py-3 shadow-[0_6px_20px_rgba(255,193,7,0.12)]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FFC107] to-[#FF9800] shadow-sm">
                  <Gift className="h-4 w-4 text-white" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-[#B45309]">Sign-up Bonus</p>
                  <p className="font-display text-lg font-extrabold leading-none text-[#111111]">{app.signup_bonus}</p>
                </div>
              </div>
            )}
            {app.min_withdraw && (
              <div className="flex flex-1 items-center gap-2.5 rounded-[16px] border border-[#BBF7D0] bg-gradient-to-br from-[#F0FDF4] to-white px-3 py-3 shadow-[0_6px_20px_rgba(34,197,94,0.1)]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#16A34A] shadow-sm">
                  <Wallet className="h-4 w-4 text-white" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-[#15803D]">Min. Withdraw</p>
                  <p className="font-display text-lg font-extrabold leading-none text-[#111111]">{app.min_withdraw}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Download button */}
        <RippleButton
          onClick={handleDownload}
          data-testid="detail-download-btn"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FFC107] to-[#FFB300] py-4 text-base font-bold text-[#111111] shadow-[0_10px_28px_rgba(255,193,7,0.5)]"
        >
          <Download className="h-5 w-5" /> Download APK ({app.size})
        </RippleButton>

        <div className="flex items-center justify-center gap-1.5 text-xs text-[#999999]">
          <ShieldCheck className="h-3.5 w-3.5 text-[#22C55E]" />
          Safe &amp; virus-scanned • {formatFull(app.downloads)} downloads
        </div>

        {/* Game Highlights (replaces screenshots) */}
        <section className="space-y-2.5" data-testid="game-highlights">
          <h2 className="flex items-center gap-1.5 font-display text-base font-bold text-[#111111]">
            <Gamepad2 className="h-4 w-4 text-[#FFC107]" /> About the Game
          </h2>
          <p className="text-sm leading-relaxed text-[#555555]">
            {app.name} is a premium {app.category?.toLowerCase()} experience built for smooth, lag-free
            play on Android. Enjoy stunning visuals, responsive controls and hours of engaging gameplay —
            all in a lightweight {app.size} package that installs in seconds. Whether you are a casual
            player or a hardcore gamer, {app.name} delivers a polished, addictive experience you will keep
            coming back to.
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {GAME_HIGHLIGHTS.map((h) => (
              <div
                key={h.title}
                className="flex items-start gap-2.5 rounded-[16px] border border-[#E5E7EB] bg-white p-3 shadow-[0_6px_20px_rgba(0,0,0,0.03)]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#FFF8E1]">
                  <h.icon className="h-4 w-4 text-[#FFB300]" />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-[13px] font-semibold leading-tight text-[#111111]">{h.title}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-[#777777]">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Description */}
        {app.description && (
          <section className="space-y-2">
            <h2 className="font-display text-base font-bold text-[#111111]">About this app</h2>
            <p data-testid="detail-description" className="text-sm leading-relaxed text-[#555555]">{app.description}</p>
          </section>
        )}

        {/* What's new */}
        {app.whats_new && (
          <section className="space-y-2">
            <h2 className="flex items-center gap-1.5 font-display text-base font-bold text-[#111111]">
              <Sparkles className="h-4 w-4 text-[#FFC107]" /> What&apos;s New
            </h2>
            <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-4 text-sm leading-relaxed text-[#555555] shadow-[0_6px_20px_rgba(0,0,0,0.03)]">
              {app.whats_new}
            </div>
          </section>
        )}

        {/* Additional info */}
        <section className="space-y-2">
          <h2 className="font-display text-base font-bold text-[#111111]">Additional Information</h2>
          <div className="divide-y divide-[#E5E7EB] rounded-[18px] border border-[#E5E7EB] bg-white px-4 shadow-[0_6px_20px_rgba(0,0,0,0.03)]">
            {[
              ["Version", app.version],
              ["Size", app.size],
              ["Category", app.category],
              ["Requires", app.min_android],
              ["Developer", app.developer || "—"],
              ["Package", app.package_name || "—"],
              ["Updated", (app.created_at || "").slice(0, 10) || "—"],
              ["Requirements", app.requirements || "—"],
              ["Sign-up Bonus", app.signup_bonus || "—"],
              ["Min. Withdraw", app.min_withdraw || "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-[#777777]">{k}</span>
                <span className="max-w-[60%] truncate font-medium text-[#111111]">{v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        {app.features?.length > 0 && (
          <section className="space-y-2" data-testid="detail-features">
            <h2 className="font-display text-base font-bold text-[#111111]">Features</h2>
            <div className="flex flex-wrap gap-2">
              {app.features.map((f, i) => (
                <span key={i} className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#555555] shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
                  {f}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Permissions */}
        {app.permissions?.length > 0 && (
          <section className="space-y-2" data-testid="detail-permissions">
            <h2 className="font-display text-base font-bold text-[#111111]">Permissions</h2>
            <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.03)]">
              <ul className="space-y-1.5">
                {app.permissions.map((p, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#555555]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FFC107]" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Related apps */}
        {related.length > 0 && (
          <section className="space-y-2.5" data-testid="detail-related">
            <h2 className="flex items-center gap-1.5 font-display text-base font-bold text-[#111111]">
              <Sparkles className="h-4 w-4 text-[#FFC107]" /> You may also like
            </h2>
            {/* Rendered as real <a href> anchors, not buttons with onClick:
                a click handler is invisible to crawlers, so this block passed
                zero internal link equity between APK pages and none of the
                related games were discoverable through it. */}
            <div className="grid grid-cols-2 gap-2.5">
              {related.slice(0, 6).map((r) => (
                <Link
                  key={r.id}
                  to={`/${r.slug || r.id}`}
                  data-testid={`related-${r.id}`}
                  title={`${r.name} APK download`}
                  className="flex items-center gap-2.5 rounded-[16px] border border-[#E5E7EB] bg-white p-2.5 text-left transition-transform duration-150 active:scale-[0.98]"
                >
                  <AppIcon
                    src={resolveUrl(r.icon_url)}
                    alt={`${r.name} APK icon`}
                    className="h-11 w-11 shrink-0 rounded-[12px] ring-1 ring-black/5"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-[13px] font-semibold text-[#111]">{r.name}</p>
                    <p className="truncate text-[10px] text-[#777]">
                      <Star className="mr-0.5 inline h-2.5 w-2.5 fill-[#FFC107] text-[#FFC107]" />
                      {(r.rating || 4.5).toFixed(1)} · {formatCount(r.downloads)}+ dl
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <FaqSection />
        <LegalSection onOpen={setLegalId} />
      </main>

      {/* Sticky bottom download bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] border-t border-[#E5E7EB] bg-white/90 p-3 backdrop-blur-xl">
        <RippleButton
          onClick={handleDownload}
          data-testid="detail-download-sticky"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FFC107] to-[#FFB300] py-3.5 text-sm font-bold text-[#111111] shadow-[0_8px_20px_rgba(255,193,7,0.45)]"
        >
          <Download className="h-5 w-5" /> Download APK
        </RippleButton>
      </div>

      <SiteFooter onOpenLegal={setLegalId} />
      <LegalDialog openId={legalId} onClose={() => setLegalId(null)} />
    </div>
  );
}
