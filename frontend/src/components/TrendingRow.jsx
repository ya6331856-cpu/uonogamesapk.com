import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Star, Download, Flame, Gift } from "lucide-react";
import AppIcon from "@/components/AppIcon";
import RippleButton from "@/components/RippleButton";
import { resolveUrl } from "@/lib/api";
import { formatCount } from "@/lib/format";
import { getBadge } from "@/lib/badge";

/**
 * Horizontal-scroll "Trending" poster cards — breaks the straight vertical
 * app list into a varied, premium layout.
 */
export const TrendingRow = ({ apps, onDownload }) => {
  const navigate = useNavigate();
  if (!apps || apps.length === 0) return null;

  return (
    <section data-testid="trending-row" className="space-y-3">
      <div className="flex items-center gap-2">
        <Flame className="h-4 w-4 text-[#FF6B35]" />
        <h2 className="font-display text-base font-bold text-[#111111]">Trending Now</h2>
        <span className="h-px flex-1 bg-gradient-to-r from-[#FFC107]/40 to-transparent" />
      </div>

      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {apps.map((app, i) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3) }}
            onClick={() => navigate(`/${app.slug || `app/${app.id}`}`)}
            data-testid={`trending-card-${app.id}`}
            className="relative w-[150px] shrink-0 cursor-pointer overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.05)] transition-transform duration-200 active:scale-[0.97]"
          >
            <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#FFF3E0] font-display text-[11px] font-bold text-[#FF6B35]">
              {i + 1}
            </span>
            <AppIcon
              src={resolveUrl(app.icon_url)}
              alt={app.name}
              className="h-16 w-16 rounded-[16px] ring-1 ring-black/5"
            />
            {getBadge(app) && (
              <span data-testid={`app-badge-${app.id}`} className="absolute left-2 top-2 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold leading-none shadow-sm" style={{ color: getBadge(app).color, backgroundColor: getBadge(app).bg }}>
                {getBadge(app).label}
              </span>
            )}
            <h3 className="mt-2.5 line-clamp-1 font-display text-sm font-semibold text-[#111111]">{app.name}</h3>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-[#777777]">
              <span className="inline-flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-[#FFC107] text-[#FFC107]" />
                {app.rating?.toFixed(1)}
              </span>
              <span>{formatCount(app.downloads)}</span>
            </div>
            {app.signup_bonus && (
              <span data-testid={`trending-bonus-${app.id}`} className="mt-1.5 inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-[#FFC107] to-[#FF9800] px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                <Gift className="h-2.5 w-2.5" /> Bonus {app.signup_bonus}
              </span>
            )}
            <RippleButton
              onClick={(e) => { e.stopPropagation(); onDownload(app); }}
              data-testid={`download-btn-${app.id}`}
              className="mt-2.5 flex w-full items-center justify-center gap-1 rounded-full bg-[#FFC107] py-1.5 text-[11px] font-bold text-[#111111] shadow-[0_4px_12px_rgba(255,193,7,0.4)] hover:bg-[#FFB300]"
            >
              <Download className="h-3 w-3" /> Get
            </RippleButton>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TrendingRow;
