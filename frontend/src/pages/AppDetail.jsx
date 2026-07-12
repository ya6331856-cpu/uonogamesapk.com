import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Star, BadgeCheck, Download, Share2, Loader2,
  ShieldCheck, HardDrive, Tag, Smartphone, Building2, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import api, { API, resolveUrl } from "@/lib/api";
import AppIcon from "@/components/AppIcon";
import RippleButton from "@/components/RippleButton";
import FaqSection from "@/components/FaqSection";
import LegalSection from "@/components/LegalSection";
import LegalDialog from "@/components/LegalDialog";
import SiteFooter from "@/components/SiteFooter";
import { formatCount, formatFull } from "@/lib/format";

const Stat = ({ icon: Icon, label, value }) => (
  <div className="flex min-w-0 flex-1 flex-col items-center rounded-[16px] border border-[#E5E7EB] bg-white px-2 py-3 text-center shadow-[0_6px_20px_rgba(0,0,0,0.03)]">
    <Icon className="h-4 w-4 text-[#FFB300]" />
    <span className="mt-1 truncate font-display text-[13px] font-bold text-[#111111]">{value}</span>
    <span className="text-[10px] text-[#999999]">{label}</span>
  </div>
);

export default function AppDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [legalId, setLegalId] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    api
      .get(`/apps/${id}`)
      .then((res) => setApp(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

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

  const screenshots = app.screenshots || [];

  return (
    <div className="app-shell min-h-screen pb-28" data-testid="app-detail-page">
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
        {/* App head */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-4"
        >
          <AppIcon
            src={resolveUrl(app.icon_url)}
            alt={app.name}
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

        {/* Screenshots */}
        {screenshots.length > 0 && (
          <section className="space-y-2.5">
            <h2 className="font-display text-base font-bold text-[#111111]">Screenshots</h2>
            <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
              {screenshots.map((s, i) => (
                <img
                  key={i}
                  src={resolveUrl(s)}
                  alt={`${app.name} screenshot ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  data-testid={`detail-screenshot-${i}`}
                  className="h-52 w-72 shrink-0 rounded-[18px] border border-[#E5E7EB] object-cover shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
                />
              ))}
            </div>
          </section>
        )}

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
              <Sparkles className="h-4 w-4 text-[#FFC107]" /> What's New
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
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-[#777777]">{k}</span>
                <span className="max-w-[60%] truncate font-medium text-[#111111]">{v}</span>
              </div>
            ))}
          </div>
        </section>

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
