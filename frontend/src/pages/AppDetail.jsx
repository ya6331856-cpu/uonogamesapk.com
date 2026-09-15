import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Star, BadgeCheck, Download, Share2, Loader2,
  ShieldCheck, HardDrive, Tag, Smartphone, Building2, Sparkles,
  Gamepad2, Zap, Wifi, RefreshCw, Trophy, Lock, Gift, Wallet, Search, X, Flame
} from "lucide-react";
import { toast } from "sonner";
import api, { API, resolveUrl } from "@/lib/api";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import AppIcon from "@/components/AppIcon";
import RippleButton from "@/components/RippleButton";
import AppCard from "@/components/AppCard";
import FaqSection from "@/components/FaqSection";
import LegalSection from "@/components/LegalSection";
import LegalDialog from "@/components/LegalDialog";
import SiteFooter from "@/components/SiteFooter";
import { formatCount, formatFull } from "@/lib/format";
import { Input } from "@/components/ui/input";

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

function normalize(s) {
  return String(s || "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "");
}

const getGameSpecificKeywords = (appName) => {
  const name = appName || "Game";
  return [
    `${name} APK`, `${name} Download`, `${name} Latest Version 2026`, `${name} App`,
    `${name} Real Cash`, `${name} Sign Up Bonus`, `${name} UPI Withdrawal`, `${name} Mod APK`,
    `${name} Official`, `${name} Login`, `${name} Register`, `${name} Hack Trick`,
    `${name} Unlimited Money`, `${name} Winning Strategy`, `${name} Online Play`, `${name} Android App`,
    `${name} Free Bonus`, `${name} Min Withdrawal`, `${name} Customer Care`, `${name} Refer and Earn`,
    `${name} Gameplay`, `${name} Review`, `${name} Safe to Play`, `${name} Install Guide`,
    `Yono ${name}`, `New ${name}`, `${name} Download Link`, `${name} Direct APK`,
    `Best ${name} App`, `Top Rummy ${name}`, `${name} Casino Game`, `${name} Card Game`,
    `Play ${name} Online`, `${name} Winning Tricks`, `${name} Big Win`, `${name} Jackpot`,
    `${name} Daily Rewards`, `${name} VIP Program`, `${name} Fast Withdrawal`, `${name} Trusted App`,
    `${name} Version 1.0`, `${name} Update`, `${name} Old Version`, `${name} System Requirements`,
    `${name} Support`, `${name} Promo Code`, `${name} Referral Link`, `${name} Game Rules`
  ];
};

const processRelatedApps = (rawList, currentAppId, currentAppSlug, currentAppName) => {
  if (!rawList || !Array.isArray(rawList)) return [];
  let visitedIds = [];
  try {
    const saved = sessionStorage.getItem("visited_yono_games");
    if (saved) visitedIds = JSON.parse(saved);
  } catch (e) {}

  if (currentAppId && !visitedIds.includes(String(currentAppId))) {
    visitedIds.push(String(currentAppId));
  }
  try {
    sessionStorage.setItem("visited_yono_games", JSON.stringify(visitedIds));
  } catch (e) {}

  const filtered = rawList.filter(item => {
    const itemId = String(item.id);
    const itemSlug = String(item.slug || "");
    const itemName = String(item.name || "").trim().toLowerCase();
    const currName = String(currentAppName || "").trim().toLowerCase();
    const isCurrent = itemId === String(currentAppId) || itemSlug === String(currentAppSlug) || itemName === currName;
    const isVisited = visitedIds.includes(itemId);
    return !isCurrent && !isVisited;
  });

  const unique = Array.from(new Map(filtered.map(item => [item.id, item])).values());
  return unique.slice(0, 10);
};

export default function AppDetail() {
  const { id, slug } = useParams();
  const location = useLocation();
  const key = slug || id;
  const navigate = useNavigate();

  const getCachedAppList = () => {
    try {
      const cache = localStorage.getItem("yono_apps_perm_cache");
      if (cache) {
        const parsed = JSON.parse(cache);
        return parsed.apps ? [...(parsed.featured || []), ...(parsed.apps || []), ...(parsed.trending || [])] : [];
      }
    } catch(e) {}
    return [];
  };

  const getInstantData = (lookupKey) => {
    if (location.state?.app && (String(location.state.app.id) === String(lookupKey) || location.state.app.slug === lookupKey)) {
      return location.state.app;
    }
    const list = getCachedAppList();
    return list.find(a => a.slug === lookupKey || String(a.id) === String(lookupKey)) || null;
  };

  const initialApp = getInstantData(key);
  const [app, setApp] = useState(initialApp);
  
  const getInitialRelated = (currApp) => {
    if (!currApp) return [];
    const list = getCachedAppList();
    return processRelatedApps(list, currApp.id, currApp.slug, currApp.name);
  };

  const [related, setRelated] = useState(() => getInitialRelated(initialApp));
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [legalId, setLegalId] = useState(null);
  const fetchingRef = useRef(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (!key || key === "undefined") return;

    const cachedMatch = getInstantData(key);
    if (cachedMatch) {
      setApp(cachedMatch);
      setRelated(getInitialRelated(cachedMatch));
      setLoading(false);
    } else {
      setLoading(true);
    }
    setNotFound(false);

    if (fetchingRef.current) return;
    fetchingRef.current = true;

    api.get(`/apps/${key}`)
      .then((res) => {
        fetchingRef.current = false;
        const freshApp = res.data;
        if (freshApp && freshApp.id) {
          setApp(freshApp);
          api.get(`/apps/${key}/related`, { params: { limit: 30 } })
            .then((r) => {
               if (r.data && r.data.length > 0) {
                 const cleanList = processRelatedApps(r.data, freshApp.id, freshApp.slug, freshApp.name);
                 setRelated(cleanList);
               }
            })
            .catch(() => {});
          setLoading(false);
        } else {
          setNotFound(true);
          setLoading(false);
        }
      })
      .catch(() => {
        fetchingRef.current = false;
        if (!cachedMatch) setNotFound(true);
        setLoading(false);
      });
  }, [key]);

  const allCachedApps = useMemo(() => getCachedAppList(), []);

  const filteredSearchApps = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = normalize(searchQuery);
    return allCachedApps.filter(a => normalize(a.name).includes(q) || normalize(a.category).includes(q)).slice(0, 8);
  }, [searchQuery, allCachedApps]);

  const handleDownload = () => {
    if (!app) return;
    toast.success(`Opening: ${app.name}`, { description: `${app.size} • v${app.version}` });
    if (app.apk_url && app.apk_url.startsWith("http")) {
      window.open(app.apk_url, "_blank"); 
      api.get(`/apps/${app.id}/download`).catch(() => {});
    } else {
      window.open(`${API}/apps/${app.id}/download`, "_blank");
    }
    setApp((p) => (p ? { ...p, downloads: (p.downloads || 0) + 1 } : p));
  };

  const handleRelatedClick = (relApp) => {
    setLoading(true);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setTimeout(() => {
      navigate(`/${relApp.slug || relApp.id}`, { state: { app: relApp } });
    }, 200);
  };

  const handleKeywordClick = (kw) => {
    const cleanKw = kw.replace(/apk|download|latest version|2026|app/gi, '').trim();
    const matchedApp = allCachedApps.find(a => normalize(a.name).includes(normalize(cleanKw)) || normalize(cleanKw).includes(normalize(a.name)));
    if (matchedApp) {
      handleRelatedClick(matchedApp);
    } else {
      toast.info(`Tag: ${kw}`);
    }
  };

  const handleRelatedDownload = (relApp) => {
    toast.success(`Opening: ${relApp.name}`, { description: `${relApp.size} • v${relApp.version}` });
    if (relApp.apk_url && relApp.apk_url.startsWith("http")) {
      window.open(relApp.apk_url, "_blank");
      api.get(`/apps/${relApp.id}/download`).catch(() => {});
    } else {
      window.open(`${API}/apps/${relApp.id}/download`, "_blank");
    }
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
    } catch (e) {}
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  if (loading && !app) {
    return (
      <div className="app-shell flex min-h-screen flex-col items-center justify-center gap-3 bg-[#FFFBEB] px-6 text-center">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-[22px] bg-white shadow-[0_8px_30px_rgba(255,193,7,0.25)] border border-[#FFE082]">
          <Loader2 className="h-8 w-8 animate-spin text-[#FFC107]" />
        </div>
        <div>
          <p className="font-display text-sm font-bold text-[#111111]">Loading Game...</p>
          <p className="text-[11px] text-[#777777]">Preparing secure download package</p>
        </div>
      </div>
    );
  }

  if (notFound && !app) {
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

  if (!app) return null;

  const dynamicGameKeywords = getGameSpecificKeywords(app.name);
  const activeRelated = processRelatedApps(related.length > 0 ? related : allCachedApps, app.id, app.slug, app.name);

  return (
    <div key={app.id} className="app-shell min-h-screen pb-28" data-testid="app-detail-page">
      <SEOHead
        type="app"
        title={app.seo_title || `${app.name} APK Download - Latest Version | YONO GAMES 2026 | YONO GAMES`}
        description={app.meta_description || `${app.name} APK Download Latest Version 2026 - Get Rs 501 Bonus. ${app.name} is No.1 Real Cash Game with Instant UPI Withdrawal, 80+ Games, Big Win & Jackpot Trick. 100% Safe Official App.`}
        keywords={app.keywords || `${app.name} apk, ${app.name} download, ${app.category?.toLowerCase()} apk`}
        canonical={`https://newyono.games/${app.slug || app.id}`}
        image={app.og_image || app.icon_url}
        noindex={!!app.noindex || !!app.hidden}
        app={app}
        breadcrumbs={[
          { name: app.category || "Apps", url: `/?category=${encodeURIComponent(app.category || "")}` },
          { name: app.name, url: `/${app.slug || app.id}` },
        ]}
      />
      
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#E5E7EB] bg-white/85 px-4 py-3 backdrop-blur-xl">
        <button onClick={handleBack} data-testid="detail-back" className="flex items-center gap-1 text-sm font-medium text-[#555555]">
          <ArrowLeft className="h-5 w-5" /> Back
        </button>
        <button onClick={handleShare} data-testid="detail-share" aria-label="Share" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] text-[#555555]">
          <Share2 className="h-4 w-4" />
        </button>
      </header>

      {/* TOP LIVE SEARCH BAR */}
      <div className="sticky top-[57px] z-30 bg-white/95 px-4 py-2.5 border-b border-[#E5E7EB] backdrop-blur-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777777]" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any game to download instantly..."
            className="h-10 rounded-full border-[#E5E7EB] bg-[#F8F9FA] pl-10 pr-10 text-sm focus-visible:ring-[#FFC107]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-[#E5E7EB] text-[#555555]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {searchQuery && filteredSearchApps.length > 0 && (
          <div className="absolute inset-x-4 top-full mt-1 overflow-hidden rounded-[16px] border border-[#E5E7EB] bg-white shadow-xl z-50">
            {filteredSearchApps.map((item) => (
              <Link
                key={item.id}
                to={`/${item.slug || item.id}`}
                onClick={() => setSearchQuery("")}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#FFF8E1] transition-colors border-b border-[#F1F2F4] last:border-none"
              >
                <AppIcon src={resolveUrl(item.icon_url)} className="h-8 w-8 rounded-lg shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#111111] truncate">{item.name}</p>
                  <p className="text-[10px] text-[#777777]">{item.category} • ⭐ {item.rating?.toFixed(1)}</p>
                </div>
                <span className="text-[11px] font-semibold text-[#B45309] bg-[#FFF8E1] px-2 py-1 rounded-full">View</span>
              </Link>
            ))}
          </div>
        )}
      </div>

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
            alt={`${app.name} APK icon`}
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

        {/* PROFESSIONAL GAME TITLE CARD */}
        <div className="rounded-[20px] border border-[#E5E7EB] bg-gradient-to-r from-[#FFFBEB] via-[#FFFDF5] to-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FFC107] text-[#111111] text-[10px] font-bold">✓</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#B45309]">Official Release</span>
          </div>
          <h2 className="font-display text-base font-extrabold tracking-tight text-[#111111]">
            {app.name} APK Download - Latest Version 2026
          </h2>
          <p className="mt-1 text-xs font-medium text-[#666666]">
            100% Safe aur Secure APK download karein, instant withdrawal ke sath!
          </p>
        </div>

        {/* PEOPLE ALSO LIKE SECTION */}
        {activeRelated.length > 0 && (
          <section className="mt-4 rounded-[24px] border border-[#FFE082] bg-gradient-to-b from-[#FFFBEB] to-white p-4 shadow-[0_8px_30px_rgba(255,193,7,0.12)]" data-testid="detail-related">
            <h2 className="mb-4 flex items-center gap-1.5 font-display text-lg font-bold text-[#111111]">
              <Sparkles className="h-5 w-5 text-[#FFC107]" /> People also like
            </h2>
            <div className="flex flex-col gap-3">
              {activeRelated.slice(0, 5).map((r, i) => (
                <div key={r.id} onClick={() => handleRelatedClick(r)} className="cursor-pointer">
                  <AppCard 
                    app={r} 
                    index={i} 
                    onDownload={(e) => { e.stopPropagation(); handleRelatedDownload(r); }} 
                  />
                </div>
              ))}

              {activeRelated.length > 5 && (
                <div className="my-2 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#FFE082]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#B45309] bg-[#FEF3C7] px-3 py-1 rounded-full">
                    Explore More Recommendations
                  </span>
                  <div className="h-px flex-1 bg-[#FFE082]" />
                </div>
              )}

              {activeRelated.slice(5, 10).map((r, i) => (
                <div 
                  key={r.id} 
                  onClick={() => handleRelatedClick(r)}
                  className="relative overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white p-3 shadow-[0_4px_16px_rgba(0,0,0,0.04)] cursor-pointer hover:border-[#FFC107] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <AppIcon src={resolveUrl(r.icon_url)} className="h-12 w-12 rounded-[14px] shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-sm font-bold text-[#111111] truncate">{r.name}</p>
                      <p className="text-xs text-[#777777] truncate">{r.category} • ⭐ {r.rating?.toFixed(1)}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRelatedDownload(r); }}
                      className="rounded-full bg-[#FFC107] px-4 py-2 text-xs font-bold text-[#111111] shadow-md hover:bg-[#FFB300]"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CLICKABLE GAME-SPECIFIC KEYWORDS CLOUD */}
        <section className="rounded-[22px] border border-[#E5E7EB] bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.02)] space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#FFF8E1] text-[#FFC107]">
              <Flame className="h-4 w-4 fill-[#FFC107]" />
            </span>
            <div>
              <h3 className="font-display text-sm font-bold text-[#111111]">{app.name} Search Tags &amp; Keywords</h3>
              <p className="text-[10px] text-[#888888]">Click any tag to navigate instantly</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {dynamicGameKeywords.map((kw, i) => (
              <button
                key={i}
                onClick={() => handleKeywordClick(kw)}
                className="rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-3 py-1 text-[11px] font-medium text-[#555555] hover:bg-[#FFF8E1] hover:border-[#FFE082] hover:text-[#B45309] transition-colors text-left cursor-pointer"
              >
                #{kw}
              </button>
            ))}
          </div>
        </section>

        {/* Game Highlights */}
        <section className="space-y-2.5 pt-4" data-testid="game-highlights">
          <h2 className="flex items-center gap-1.5 font-display text-base font-bold text-[#111111]">
            <Gamepad2 className="h-4 w-4 text-[#FFC107]" /> About the Game
          </h2>
          <p className="text-sm leading-relaxed text-[#555555]">
            {app.name} APK Download Latest Version 2026 - Get Rs 501 Bonus. {app.name} is No.1 Real Cash Game with Instant UPI Withdrawal, 80+ Games, Big Win & Jackpot Trick. 100% Safe Official App.
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
