import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Star, BadgeCheck, Download, Gift, Check } from "lucide-react";
import AppIcon from "@/components/AppIcon";
import RippleButton from "@/components/RippleButton";
import { resolveUrl } from "@/lib/api";
import { getBadge } from "@/lib/badge";

export const AppCard = ({ app, index = 0, onDownload }) => {
  const navigate = useNavigate();
  const badge = getBadge(app);
  
  const rankNumber = index + 1;
  const [isDownloaded, setIsDownloaded] = useState(false);

  useEffect(() => {
    const downloadedApps = JSON.parse(localStorage.getItem("downloaded_apps") || "{}");
    if (app && app.name && downloadedApps[app.name]) {
      setIsDownloaded(true);
    }
  }, [app]);

  const handleClick = (e) => {
    if (window._adCooldown) return;
    window._adCooldown = true;
    setTimeout(() => { window._adCooldown = false; }, 2000);

    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(`/${app.slug || `app/${app.id}`}`, { state: { app } });
  };

  const handleDownloadClick = (e) => {
    e.stopPropagation(); 
    if (window._adCooldown) return;
    window._adCooldown = true;
    setTimeout(() => { window._adCooldown = false; }, 2000);

    if (app && app.name) {
      const downloadedApps = JSON.parse(localStorage.getItem("downloaded_apps") || "{}");
      downloadedApps[app.name] = true;
      localStorage.setItem("downloaded_apps", JSON.stringify(downloadedApps));
      setIsDownloaded(true);
    }

    if (onDownload) {
      onDownload(app); 
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.35), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      data-testid={`app-card-${app.id}`}
      className="group relative flex cursor-pointer items-center gap-3.5 rounded-[20px] border border-[#E5E7EB] bg-white p-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.03)] transition-shadow duration-300 hover:shadow-[0_12px_28px_rgba(0,0,0,0.07)] overflow-visible"
    >
      {/* PREMIUM RANKING NUMBER BADGE */}
      <div 
        className="absolute -left-2.5 -top-2.5 z-25 flex h-6 w-6 items-center justify-center rounded-xl text-[11px] font-black text-white shadow-[0_4px_10px_rgba(0,0,0,0.15)] border-2 border-white"
        style={{
          background: rankNumber === 1 
            ? "linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)" 
            : rankNumber === 2 
            ? "linear-gradient(135deg, #E0E0E0 0%, #9E9E9E 100%)" 
            : rankNumber === 3 
            ? "linear-gradient(135deg, #E65100 0%, #BF360C 100%)" 
            : "linear-gradient(135deg, #424242 0%, #212121 100%)"
        }}
      >
        <span>#{rankNumber}</span>
      </div>

      {/* BALANCED APP ICON (h-16 w-16) */}
      <div className="relative shrink-0 pt-0.5">
        <AppIcon
          src={resolveUrl(app.icon_url)}
          alt={app.name}
          width={64}
          height={64}
          loading="lazy"
          className="h-16 w-16 rounded-[16px] ring-1 ring-black/5 object-cover shadow-sm"
        />
        {badge && (
          <span
            data-testid={`app-badge-${app.id}`}
            className="absolute -right-1 -top-1 rounded-full px-1.5 py-0.5 text-[8px] font-extrabold leading-none shadow-sm"
            style={{ color: badge.color, backgroundColor: badge.bg }}
          >
            {badge.label}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1.5">
          <h3
            className="line-clamp-1 font-display text-sm font-bold leading-tight text-[#111111]"
            data-testid={`app-name-${app.id}`}
          >
            {app.name}
          </h3>
          <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-[#FFF8E1] px-2 py-0.5">
            <Star className="h-3 w-3 fill-[#FFC107] text-[#FFC107]" />
            <span className="text-xs font-semibold text-[#111111]">{app.rating?.toFixed(1) || "4.8"}</span>
          </div>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-[#777777]">
          <span>{app.size || "45 MB"}</span>
          {app.verified && (
            <span className="inline-flex items-center gap-0.5 text-[#22C55E]">
              <BadgeCheck className="h-3.5 w-3.5" />
              <span className="font-medium">Verified</span>
            </span>
          )}
        </div>

        <p className="mt-0.5 text-[11px] font-medium text-[#555555]">
          👥 {(app.downloads ? (app.downloads * 8).toLocaleString() : "350.4K")} active players
        </p>

        {(app.signup_bonus || app.min_withdraw) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5" data-testid={`app-rewards-${app.id}`}>
            {app.signup_bonus && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FFC107] to-[#FF9800] px-2 py-0.5 text-[10px] font-extrabold text-white shadow-sm">
                <Gift className="h-3 w-3" /> Bonus {app.signup_bonus}
              </span>
            )}
            {app.min_withdraw && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F0FDF4] px-2 py-0.5 text-[10px] font-bold text-[#16A34A]">
                Min W/D {app.min_withdraw}
              </span>
            )}
          </div>
        )}
      </div>

      <RippleButton
        onClick={handleDownloadClick}
        data-testid={`download-btn-${app.id}`}
        className={`flex shrink-0 items-center gap-1 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
          isDownloaded
            ? "bg-[#22C55E] text-white shadow-[0_4px_14px_rgba(34,197,94,0.35)] hover:bg-[#16A34A]"
            : "bg-[#FFC107] text-[#111111] shadow-[0_4px_14px_rgba(255,193,7,0.35)] hover:bg-[#FFB300]"
        }`}
      >
        {isDownloaded ? <Check className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
        <span className="hidden xs:inline">{isDownloaded ? "Downloaded" : "Download"}</span>
        <span className="xs:hidden">{isDownloaded ? "Done" : "Get"}</span>
      </RippleButton>
    </motion.div>
  );
};

export default AppCard;
