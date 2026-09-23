import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Star, BadgeCheck, Download, Gift, ArrowLeft, ShieldCheck, Zap, Wifi, Sparkles, CheckCircle2, Search, X, Flame, Home } from "lucide-react";
import { toast } from "sonner";
import api, { API, resolveUrl } from "@/lib/api";
import SEOHead from "@/components/SEOHead";
import AppIcon from "@/components/AppIcon";
import RippleButton from "@/components/RippleButton";
import SiteFooter from "@/components/SiteFooter";
import FaqSection from "@/components/FaqSection";
import AppCard from "@/components/AppCard";
import { Input } from "@/components/ui/input";

function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "");
}

// Gold Rummy fixed at #1, showing ALL games with dynamic variation across pages
function getOrderedSimilarApps(allApps, currentAppId) {
  if (!allApps || allApps.length === 0) return [];
  
  const seen = new Set();
  let list = [];
  
  for (const a of allApps) {
    if (String(a.id) === String(currentAppId)) continue;
    const normName = normalize(a.name);
    if (seen.has(normName)) continue;
    seen.add(normName);
    list.push({ ...a, version: "v2026 Latest" });
  }
  
  const goldRummyIdx = list.findIndex(a => 
    normalize(a.name).includes("goldrummy") || 
    String(a.name).toLowerCase().includes("gold rummy")
  );

  let goldRummyObj = null;
  if (goldRummyIdx !== -1) {
    goldRummyObj = list.splice(goldRummyIdx, 1)[0];
  }

  // Rotate/vary the rest of the games dynamically based on app ID
  const seed = String(currentAppId || "yono").split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  for (let i = list.length - 1; i > 0; i--) {
    const j = (seed + i) % (i + 1);
    [list[i], list[j]] = [list[j], list[i]];
  }

  if (goldRummyObj) {
    list.unshift(goldRummyObj);
  }

  return list; // Saare games dikhege ab bina kisi limit ke!
}

export default function AppDetail() {
  const { id, slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const identifier = slug || id || pathSegments[pathSegments.length - 1];

  const cachedData = typeof window !== "undefined" ? localStorage.getItem("yono_apps_perm_cache") : null;
  const parsedCache = useMemo(() => {
    try {
      return cachedData ? JSON.parse(cachedData) : null;
    } catch (e) {
      return null;
    }
  }, [cachedData]);

  const allCachedApps = useMemo(() => {
    if (!parsedCache) return [];
    const combined = [...(parsedCache.apps || []), ...(parsedCache.featured || []), ...(parsedCache.trending || [])];
    return combined.map(app => ({ ...app, version: "v2026 Latest" }));
  }, [parsedCache]);

  const fallbackApp = useMemo(() => {
    const cleanName = identifier ? identifier.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "Rummy Ludo";
    return {
      id: identifier || "rummy-ludo",
      name: cleanName,
      slug: identifier,
      rating: 4.8,
      size: "45 MB",
      version: "v2026 Latest",
      downloads: 4200000,
      signup_bonus: "₹501",
      icon_url: "https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=150&auto=format&fit=crop&q=80",
      apk_url: "#"
    };
  }, [identifier]);

  const initialApp = useMemo(() => {
    if (location.state?.app) return { ...location.state.app, version: "v2026 Latest" };
    if (allCachedApps.length > 0 && identifier && identifier !== "undefined") {
      const found = allCachedApps.find(a => 
        String(a.id) === String(identifier) || 
        a.slug === identifier || 
        normalize(a.name) === normalize(identifier)
      );
      if (found) return { ...found, version: "v2026 Latest" };
    }
    return allCachedApps[0] || fallbackApp;
  }, [location.state, allCachedApps, identifier, fallbackApp]);

  const [app, setApp] = useState(initialApp);
  const [allStoreApps, setAllStoreApps] = useState(allCachedApps);
  const [similarApps, setSimilarApps] = useState(() => {
    const fallbackList = allCachedApps.length > 0 ? allCachedApps : (parsedCache?.apps || []);
    return getOrderedSimilarApps(fallbackList, initialApp?.id);
  });

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    let isMounted = true;

    const fetchAppData = async () => {
      try {
        const res = await api.get("/apps?limit=100");
        if (res.data && isMounted) {
          const rawAll = [...(res.data.featured || []), ...(res.data.apps || []), ...(res.data.trending || [])];
          const all = rawAll.map(a => ({ ...a, version: "v2026 Latest" }));
          
          setAllStoreApps(all);
          localStorage.setItem("yono_apps_perm_cache", JSON.stringify(res.data));

          if (all.length > 0) {
            const found = identifier && identifier !== "undefined" 
              ? all.find(a => String(a.id) === String(identifier) || a.slug === identifier || normalize(a.name) === normalize(identifier))
              : null;
            
            const targetApp = found || initialApp || all[0] || fallbackApp;
            setApp({ ...targetApp, version: "v2026 Latest" });
            setSimilarApps(getOrderedSimilarApps(all, targetApp.id));
          }
        }
      } catch (e) {
        if (allCachedApps.length > 0 && isMounted) {
          const targetApp = initialApp || allCachedApps[0] || fallbackApp;
          setApp({ ...targetApp, version: "v2026 Latest" });
          setSimilarApps(getOrderedSimilarApps(allCachedApps, targetApp.id));
        }
      }
    };

    fetchAppData();

    return () => { isMounted = false; };
  }, [identifier]);

  // Smart Click handler for Ad redirection across the page
  const handleSmartClick = (e) => {
    // Agar user ne download button, search input, ya kisi interactive link par click kiya hai toh ad trigger na ho
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a')) {
      return;
    }
    // Smart click ad redirect URL (Aap yahan apna ad network link daal sakte hain)
    const adUrl = "https://www.highratecpm.com/2/8825838"; 
    window.open(adUrl, "_blank");
  };

  const handleDownload = (targetApp) => {
    const currentApp = targetApp || app;
    if (!currentApp) return;

    toast.success(`Opening: ${currentApp.name}`, { description: `45 MB • v2026 Latest` });
    
    if (currentApp.apk_url && currentApp.apk_url.startsWith("http")) {
      window.open(currentApp.apk_url, "_blank"); 
      api.get(`/apps/${currentApp.id}/download`).catch(() => {});
    } else {
      window.open(`${API}/apps/${currentApp.id}/download`, "_blank");
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeywordClick = (kw) => {
    const cleanKw = kw.replace(/apk|download|2026|app|online|india|game|games/gi, "").trim();
    navigate(`/?search=${encodeURIComponent(cleanKw)}`);
  };

  const gameKeywords = useMemo(() => {
    const name = app?.name || "Game";
    return [
      `${name} APK Download`,
      `${name} Latest Version 2026`,
      `${name} Sign Up Bonus 501`,
      `${name} Instant UPI Withdrawal`,
      `${name} Mod APK`,
      `${name} Online Play`,
      `${name} Real Cash App`,
      `All Yono Games List`,
      `${name} Gold Rummy`,
      `${name} Free Chips`
    ];
  }, [app]);

  return (
    <div onClick={handleSmartClick} className="app-shell pb-10 bg-[#FAFAFA] text-[#111111] min-h-screen cursor-pointer">
      <SEOHead
        title={`${app?.name || "Yono Games"} APK Download 2026 - 501 Bonus Latest Version`}
        description={`Download ${app?.name || "Yono Games"} APK latest version with ₹501 sign-up bonus and instant UPI withdrawal on newyono.games.`}
        canonical={`https://newyono.games/${app?.slug || `app/${app?.id}`}`}
        image={app?.icon_url || "https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=150&auto=format&fit=crop&q=80"}
      />

      {/* Sticky top bar with Back Button, Text and Home Button */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-white/95 px-4 py-2.5 backdrop-blur-md border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#E5E7EB] text-[#111111] shadow-sm hover:bg-[#F1F1F1]">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="truncate font-display text-xs sm:text-sm font-bold text-[#111111]">idhr aur bhi game hai 👈🏼</span>
        </div>
        <button 
          onClick={() => navigate("/")} 
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF8E1] border border-[#FFE082] text-[#B45309] shadow-sm hover:bg-[#FFECB3]"
          title="Go to Homepage"
        >
          <Home className="h-4 w-4" />
        </button>
      </div>

      <main className="max-w-2xl mx-auto space-y-4 px-4 pt-4">
        {/* App Hero Section with Badges */}
        <div className="flex items-start justify-between gap-4 rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <div className="relative shrink-0">
              <AppIcon src={resolveUrl(app?.icon_url)} alt={app?.name} className="h-16 w-16 sm:h-20 sm:w-20 rounded-[18px] sm:rounded-[20px] ring-1 ring-black/5 object-cover shadow-md" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-lg sm:text-xl font-extrabold leading-tight text-[#111111]">{app?.name}</h1>
              <p className="mt-0.5 text-xs font-medium text-[#777777]">newyono.games official store</p>
              <div className="mt-2.5 flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-full bg-[#FFF8E1] px-2.5 py-0.5 border border-[#FFE082]">
                  <Star className="h-3.5 w-3.5 fill-[#FFC107] text-[#FFC107]" />
                  <span className="text-xs font-bold text-[#111111]">{app?.rating?.toFixed(1) || "4.8"}</span>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#22C55E]">
                  <BadgeCheck className="h-4 w-4" /> Verified Safe
                </span>
              </div>
            </div>
          </div>

          {/* Right Side Badges: No. 1 Trusted, 🔞+ Only, 🤯 Unlimited Trick */}
          <div className="shrink-0 flex flex-col items-end gap-1.5 justify-center">
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FFC107] to-[#FF9800] px-3 py-1 text-[11px] font-extrabold text-white shadow-md animate-pulse">
              🔥 No. 1 Trusted
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-600 border border-red-200">
              🔞+ Only
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
              🤯 Unlimited Trick
            </span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-3 shadow-sm">
            <p className="text-[10px] text-[#777777]">Updated</p>
            <p className="mt-0.5 font-display text-xs font-bold text-[#111111]">1 min ago</p>
          </div>
          <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-3 shadow-sm">
            <p className="text-[10px] text-[#777777]">Size</p>
            <p className="mt-0.5 font-display text-xs font-bold text-[#111111]">45 MB</p>
          </div>
          <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-3 shadow-sm">
            <p className="text-[10px] text-[#777777]">Version</p>
            <p className="mt-0.5 font-display text-xs font-bold text-[#111111]">v2026 Latest</p>
          </div>
          <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-3 shadow-sm">
            <p className="text-[10px] text-[#777777]">Platform</p>
            <p className="mt-0.5 font-display text-xs font-bold text-[#111111]">Android 5.0+</p>
          </div>
        </div>

        {/* Sign-up Bonus & Withdrawal Box */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-[20px] bg-gradient-to-r from-[#FFF8E1] to-[#FFF3E0] p-3.5 border border-[#FFE082]">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFC107] text-white shrink-0">
              <Gift className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#B45309]">SIGN-UP BONUS</p>
              <p className="font-display text-sm font-extrabold text-[#111111]">₹501 Free</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-[20px] bg-[#F0FDF4] p-3.5 border border-[#DCFCE7]">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#22C55E] text-white shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#166534]">INSTANT UPI</p>
              <p className="font-display text-sm font-extrabold text-[#111111]">Fast Payout</p>
            </div>
          </div>
        </div>

        {/* Pulsing Download Button */}
        <div className="pt-2">
          <RippleButton 
            onClick={() => handleDownload(app)} 
            className="w-full flex items-center justify-center gap-2.5 rounded-[22px] bg-[#FFC107] py-4 text-base font-extrabold text-[#111111] shadow-[0_8px_25px_rgba(255,193,7,0.45)] hover:bg-[#FFB300] animate-pulse"
          >
            <Download className="h-5 w-5" />
            <span>Download APK (45 MB)</span>
          </RippleButton>
          <p className="mt-2 text-center text-xs text-[#777777]">🔒 100% Virus Free • Verified Secure Download</p>
        </div>

        {/* SEARCH BAR */}
        <div className="relative pt-1">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777777]" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search other games like ${app?.name}...`}
              className="h-11 rounded-full border-[#E5E7EB] bg-white pl-10 pr-10 text-base shadow-[0_4px_14px_rgba(0,0,0,0.03)] focus-visible:ring-[#FFC107]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-[#F1F1F1] text-[#777777] hover:bg-[#E5E7EB]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </form>

          {searchQuery.trim() && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 max-h-60 overflow-y-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-xl p-2 space-y-1">
              {(() => {
                const q = searchQuery.toLowerCase();
                const sourceList = allStoreApps.length > 0 ? allStoreApps : (parsedCache?.apps || similarApps);
                const matched = sourceList.filter(a => a.name.toLowerCase().includes(q)).slice(0, 6);
                if (matched.length === 0) {
                  return <div className="p-3 text-center text-xs text-[#777777]">No games found</div>;
                }
                return matched.map(item => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSearchQuery("");
                      navigate(`/${item.slug || item.id}`, { state: { app: item } });
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#FFF8E1] cursor-pointer transition-colors"
                  >
                    <AppIcon src={resolveUrl(item.icon_url)} alt={item.name} className="h-10 w-10 rounded-xl object-cover shadow-sm" />
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-xs font-bold text-[#111111] truncate">{item.name}</p>
                      <p className="text-[10px] text-[#777777]">⭐ {item.rating?.toFixed(1) || "4.8"} • v2026 Latest</p>
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
        </div>

        {/* People Also Like (Gold Rummy fixed at #1, all games shown with dynamic rotation) */}
        {similarApps.length > 0 && (
          <div className="rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFF8E1] text-[#FFC107]">
                <Sparkles className="h-4 w-4 fill-[#FFC107]" />
              </span>
              <div>
                <h2 className="font-display text-sm font-bold text-[#111111]">People Also Like (More Games)</h2>
                <p className="text-[10px] text-[#888888]">Top trending gaming apps with ₹501 bonus</p>
              </div>
            </div>
            <div className="space-y-3 pt-1">
              {similarApps.map((simApp, idx) => (
                <AppCard key={simApp.id} app={{ ...simApp, version: "v2026 Latest" }} index={idx} onDownload={handleDownload} />
              ))}
            </div>
          </div>
        )}

        {/* About the Game */}
        <div className="rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-sm space-y-3">
          <h2 className="font-display text-base font-bold text-[#111111] flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#FFC107] fill-[#FFC107]" /> About {app?.name}
          </h2>
          <p className="text-sm leading-relaxed text-[#555555]">
            {app?.description || `${app?.name} is an ultimate card and slot gaming platform offering smooth 60 FPS performance, secure UPI cashouts, and an instant ₹501 sign-up bonus for all new players in 2026.`}
          </p>
        </div>

        {/* SPECIFIC GAME KEYWORDS */}
        <div className="rounded-[22px] border border-[#E5E7EB] bg-white p-4 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#FFF8E1] text-[#FFC107]">
              <Flame className="h-4 w-4 fill-[#FFC107]" />
            </span>
            <div>
              <h3 className="font-display text-xs sm:text-sm font-bold text-[#111111]">Keywords For {app?.name}</h3>
              <p className="text-[9px] sm:text-[10px] text-[#888888]">Popular search tags for this specific game</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {gameKeywords.map((kw, i) => (
              <button
                key={i}
                onClick={() => handleKeywordClick(kw)}
                className="rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-3 py-1 text-[10px] sm:text-[11px] font-medium text-[#555555] hover:bg-[#FFF8E1] hover:border-[#FFE082] hover:text-[#B45309] transition-colors text-left cursor-pointer"
              >
                #{kw}
              </button>
            ))}
          </div>
        </div>

        <FaqSection />
      </main>

      <SiteFooter />
    </div>
  );
}
