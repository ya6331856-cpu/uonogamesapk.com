import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Star, BadgeCheck, Download, Gift } from "lucide-react";
import AppIcon from "@/components/AppIcon";
import RippleButton from "@/components/RippleButton";
import { resolveUrl } from "@/lib/api";
import { formatCount } from "@/lib/format";
import { getBadge } from "@/lib/badge";

/**
 * Compact horizontal APK list card (120-140px feel).
 */
export const AppCard = ({ app, index = 0, onDownload }) => {
  const navigate = useNavigate();
  const badge = getBadge(app);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      onClick={() => navigate(`/${app.slug || `app/${app.id}`}`)}
      data-testid={`app-card-${app.id}`}
      className="group flex cursor-pointer items-center gap-3 rounded-[20px] border border-[#E5E7EB] bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_18px_36px_rgba(0,0,0,0.09)]"
    >
      <div className="relative shrink-0">
        <AppIcon
          src={resolveUrl(app.icon_url)}
          alt={app.name}
          className="h-14 w-14 rounded-[14px] ring-1 ring-black/5"
        />
        {badge && (
          <span
            data-testid={`app-badge-${app.id}`}
            className="absolute -left-1 -top-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold leading-none shadow-sm"
            style={{ color: badge.color, backgroundColor: badge.bg }}
          >
            {badge.label}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="line-clamp-2 font-display text-[15px] font-semibold leading-tight text-[#111111]"
            data-testid={`app-name-${app.id}`}
          >
            {app.name}
          </h3>
          <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-[#FFF8E1] px-2 py-0.5">
            <Star className="h-3 w-3 fill-[#FFC107] text-[#FFC107]" />
            <span className="text-xs font-semibold text-[#111111]">{app.rating?.toFixed(1)}</span>
          </div>
        </div>

        <p className="mt-0.5 text-xs text-[#777777]">v{app.version}</p>

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#777777]">
          <span>{app.size}</span>
          {app.verified && (
            <span className="inline-flex items-center gap-0.5 text-[#22C55E]">
              <BadgeCheck className="h-3.5 w-3.5" />
              <span className="font-medium">Verified</span>
            </span>
          )}
        </div>

        <p className="mt-0.5 text-[11px] text-[#999999]">
          {formatCount(app.downloads)} downloads
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
        onClick={(e) => { e.stopPropagation(); onDownload(app); }}
        data-testid={`download-btn-${app.id}`}
        className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#FFC107] px-3.5 py-2.5 text-[13px] font-semibold text-[#111111] shadow-[0_6px_16px_rgba(255,193,7,0.4)] hover:bg-[#FFB300]"
      >
        <Download className="h-4 w-4" />
        <span className="hidden xs:inline">Download</span>
        <span className="xs:hidden">Get</span>
      </RippleButton>
    </motion.div>
  );
};

export default AppCard;
