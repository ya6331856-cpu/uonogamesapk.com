import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Star, BadgeCheck, Download, Crown, Gift, Wallet } from "lucide-react";
import AppIcon from "@/components/AppIcon";
import RippleButton from "@/components/RippleButton";
import { resolveUrl } from "@/lib/api";
import { formatCount } from "@/lib/format";
import { getBadge } from "@/lib/badge";

const FeaturedMain = ({ app, onDownload }) => {
  const navigate = useNavigate();
  const badge = getBadge(app);
  return (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -3 }}
    onClick={() => navigate(`/app/${app.id}`)}
    data-testid={`featured-main-${app.id}`}
    className="glow-pulse relative cursor-pointer overflow-hidden rounded-[22px] border border-[#FFE082] bg-white p-4 shadow-[0_10px_40px_rgba(255,193,7,0.18)]"
  >
    <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#FFC107]/15 blur-2xl" />
    <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FFC107] to-[#FFB300] px-2.5 py-1 text-[11px] font-bold text-[#111111]">
      <Crown className="h-3.5 w-3.5" />
      FEATURED #1
    </div>
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        <AppIcon
          src={resolveUrl(app.icon_url)}
          alt={app.name}
          className="h-[72px] w-[72px] rounded-[18px] ring-1 ring-black/5"
        />
        {badge && (
          <span data-testid={`app-badge-${app.id}`} className="absolute -left-1 -top-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold leading-none shadow-sm" style={{ color: badge.color, backgroundColor: badge.bg }}>
            {badge.label}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="line-clamp-2 font-display text-lg font-bold leading-tight text-[#111111]">
          {app.name}
        </h2>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#777777]">
          <span className="inline-flex items-center gap-0.5">
            <Star className="h-3.5 w-3.5 fill-[#FFC107] text-[#FFC107]" />
            <span className="font-semibold text-[#111111]">{app.rating?.toFixed(1)}</span>
          </span>
          <span>v{app.version}</span>
          <span>{app.size}</span>
          {app.verified && (
            <span className="inline-flex items-center gap-0.5 text-[#22C55E]">
              <BadgeCheck className="h-3.5 w-3.5" /> Verified
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[11px] text-[#999999]">{formatCount(app.downloads)} downloads</p>
      </div>
    </div>
    {(app.signup_bonus || app.min_withdraw) && (
      <div className="mt-3 flex gap-2" data-testid={`featured-rewards-${app.id}`}>
        {app.signup_bonus && (
          <div className="flex flex-1 items-center gap-2 rounded-[14px] border border-[#FFE082] bg-gradient-to-br from-[#FFF8E1] to-[#FFFBEB] px-3 py-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FFC107] to-[#FF9800]">
              <Gift className="h-3.5 w-3.5 text-white" />
            </span>
            <div className="min-w-0 leading-none">
              <p className="text-[9px] font-medium uppercase tracking-wide text-[#B45309]">Sign-up Bonus</p>
              <p className="font-display text-sm font-extrabold text-[#111111]">{app.signup_bonus}</p>
            </div>
          </div>
        )}
        {app.min_withdraw && (
          <div className="flex flex-1 items-center gap-2 rounded-[14px] border border-[#BBF7D0] bg-gradient-to-br from-[#F0FDF4] to-white px-3 py-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#16A34A]">
              <Wallet className="h-3.5 w-3.5 text-white" />
            </span>
            <div className="min-w-0 leading-none">
              <p className="text-[9px] font-medium uppercase tracking-wide text-[#15803D]">Min. Withdraw</p>
              <p className="font-display text-sm font-extrabold text-[#111111]">{app.min_withdraw}</p>
            </div>
          </div>
        )}
      </div>
    )}
    <RippleButton
      onClick={(e) => { e.stopPropagation(); onDownload(app); }}
      data-testid={`download-btn-${app.id}`}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FFC107] to-[#FFB300] py-3 text-sm font-bold text-[#111111] shadow-[0_8px_20px_rgba(255,193,7,0.45)]"
    >
      <Download className="h-4 w-4" /> Download APK
    </RippleButton>
  </motion.div>
  );
};

const FeaturedSecondary = ({ app, onDownload, delay }) => {
  const navigate = useNavigate();
  const badge = getBadge(app);
  return (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -3 }}
    onClick={() => navigate(`/app/${app.id}`)}
    data-testid={`featured-secondary-${app.id}`}
    className="flex cursor-pointer flex-col rounded-[20px] border border-[#E5E7EB] bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_16px_32px_rgba(0,0,0,0.08)]"
  >
    <div className="flex items-start justify-between">
      <div className="relative">
        <AppIcon
          src={resolveUrl(app.icon_url)}
          alt={app.name}
          className="h-12 w-12 rounded-[14px] ring-1 ring-black/5"
        />
        {badge && (
          <span data-testid={`app-badge-${app.id}`} className="absolute -left-1 -top-1.5 rounded-full px-1 py-0.5 text-[8px] font-extrabold leading-none shadow-sm" style={{ color: badge.color, backgroundColor: badge.bg }}>
            {badge.label}
          </span>
        )}
      </div>
      <div className="flex items-center gap-0.5 rounded-full bg-[#FFF8E1] px-1.5 py-0.5">
        <Star className="h-3 w-3 fill-[#FFC107] text-[#FFC107]" />
        <span className="text-[11px] font-semibold text-[#111111]">{app.rating?.toFixed(1)}</span>
      </div>
    </div>
    <h3 className="mt-2 line-clamp-2 font-display text-sm font-semibold leading-tight text-[#111111]">
      {app.name}
    </h3>
    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#777777]">
      <span>{app.size}</span>
      {app.verified && <BadgeCheck className="h-3 w-3 text-[#22C55E]" />}
    </div>
    {(app.signup_bonus || app.min_withdraw) && (
      <div className="mt-1.5 flex flex-wrap items-center gap-1" data-testid={`featured-rewards-${app.id}`}>
        {app.signup_bonus && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-[#FFC107] to-[#FF9800] px-1.5 py-0.5 text-[9px] font-extrabold text-white">
            <Gift className="h-2.5 w-2.5" /> {app.signup_bonus}
          </span>
        )}
        {app.min_withdraw && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-[#F0FDF4] px-1.5 py-0.5 text-[9px] font-bold text-[#16A34A]">
            <Wallet className="h-2.5 w-2.5" /> {app.min_withdraw}
          </span>
        )}
      </div>
    )}
    <RippleButton
      onClick={(e) => { e.stopPropagation(); onDownload(app); }}
      data-testid={`download-btn-${app.id}`}
      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-[#FFC107] py-2 text-xs font-bold text-[#111111] shadow-[0_5px_14px_rgba(255,193,7,0.4)] hover:bg-[#FFB300]"
    >
      <Download className="h-3.5 w-3.5" /> Download
    </RippleButton>
  </motion.div>
  );
};

export const FeaturedApps = ({ apps, onDownload }) => {
  if (!apps || apps.length === 0) return null;
  const [first, second, third] = apps;
  return (
    <section data-testid="featured-section" className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="font-display text-base font-bold text-[#111111]">Featured Apps</h2>
        <span className="h-px flex-1 bg-gradient-to-r from-[#FFC107]/40 to-transparent" />
      </div>
      {first && <FeaturedMain app={first} onDownload={onDownload} />}
      {(second || third) && (
        <div className="grid grid-cols-2 gap-3">
          {second && <FeaturedSecondary app={second} onDownload={onDownload} delay={0.1} />}
          {third && <FeaturedSecondary app={third} onDownload={onDownload} delay={0.18} />}
        </div>
      )}
    </section>
  );
};

export default FeaturedApps;
