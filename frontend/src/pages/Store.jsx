import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Send, Download, Sparkles, TrendingUp, ShieldCheck, ArrowDownWideNarrow, X, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api, { API, resolveUrl } from "@/lib/api";
import SEOHead from "@/components/SEOHead";
import { useSettings, sectionEnabled } from "@/context/SettingsContext";
import Header from "@/components/Header";
import FeaturedApps from "@/components/FeaturedApps";
import AppCard from "@/components/AppCard";
import TrendingRow from "@/components/TrendingRow";
import RummyFeatures from "@/components/RummyFeatures";
import AnimatedCounter from "@/components/AnimatedCounter";
import { StoreSkeleton } from "@/components/Skeletons";
import FaqSection from "@/components/FaqSection";
import LegalSection from "@/components/LegalSection";
import LegalDialog from "@/components/LegalDialog";
import SiteFooter from "@/components/SiteFooter";
import AnnouncementBar from "@/components/AnnouncementBar";
import LiveWinners from "@/components/LiveWinners";
import ReviewsSection from "@/components/ReviewsSection";
import RedeemBox from "@/components/RedeemBox";
import AdSlot from "@/components/AdSlot";
import OptimizedImage from "@/components/OptimizedImage";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "");
}

const SORTS = [
  { value: "downloads", label: "Most Downloaded" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

const LANDING_100_KEYWORDS = [
  "Yono Games", "Yono Rummy", "Rummy Games", "Money Games", "Casino Games", "Teen Patti Real Cash",
  "New Yono Apps 2026", "Best Rummy App India", "Sign Up Bonus 501", "Instant UPI Withdrawal",
  "Mod APK Download", "Yono VIP Program", "Daily Jackpot Win", "Safe APK Store", "Online Card Games",
  "Yono All Games List", "Winning Strategies", "Fastest Withdrawal App", "Trusted Rummy Platform",
  "Android Gaming Hub", "Free Bonus Apps", "Real Money Games", "Latest Version Update", "Ind Rummy APK",
  "Gold Rummy Download", "Yono Ludo App", "Teen Patti Gold", "Dragon Tiger Game", "Andar Bahar Online",
  "7 Up 7 Down Game", "Car Roulette APK", "Zoo Roulette", "Crash Aviator Game", "Roulette Casino App",
  "Poker Real Money", "Blackjack Online India", "Slots Win APK", "Teen Patti Master", "Yono 777 Game",
  "Yono Slots Spin", "All Yono Rummy List", "New Rummy App 2026", "Bonus Rummy App", "No 1 Rummy Game",
  "Real Cash Earning Apps", "Paytm Cash Games", "PhonePe Withdrawal Apps", "Google Pay Rummy", "Instant Bank Transfer Games",
  "Safe Rummy App", "Verified APK Store", "Anti Ban Mod APK", "High Payout Casino", "Big Win Rummy",
  "Mega Jackpot Apps", "Daily Login Bonus", "Refer and Earn Rummy", "Level Up Rewards", "VIP Club Games",
  "Customer Care Rummy", "Direct APK Link", "Fastest App Download", "Lightweight Gaming APK", "Smooth 60 FPS Games",
  "Offline & Online Games", "Regular App Updates", "Secure SSL Download", "Malware Free APK", "Trusted Developer Apps",
  "Top Rated Card Games", "Most Downloaded Rummy", "Trending Casino APK", "Exclusive Game Codes", "Redeem Code Rummy",
  "Promo Code Bonus", "Unlimited Chips Hack", "Winning Tricks Rummy", "Pro Player Strategy", "Expert Guide APK",
  "App Installation Guide", "Root Free APK", "Android 14 Supported", "Low Storage Games", "High Speed APK Server",
  "Multiplayer Card Games", "Live Dealer Casino", "Real Time Leaderboard", "Tournament Rummy APK", "Weekly Cash Prizes",
  "Monthly Mega Contests", "Special Festival Bonus", "New Year Rummy Offer", "Diwali Special Bonus", "Welcome Bonus 501",
  "First Deposit Bonus", "Extra Cashback Offer", "Loss Back Guarantee", "Instant Support 24x7", "Official Yono Games Store"
];

export default function Store() {
  const { settings } = useSettings();
  const navigate = useNavigate();
  
  const cachedData = typeof window !== "undefined" ? localStorage.getItem("yono_apps_perm_cache") : null;
  const parsedCache = useMemo(() => {
    try {
      return cachedData ? JSON.parse(cachedData) : null;
    } catch (e) {
      return null;
    }
  }, [cachedData]);

  const [data, setData] = useState(() => parsedCache);
  const [loading, setLoading] = useState(!parsedCache);
  
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("downloads");
  const [legalId, setLegalId] = useState(null);

  const fetchApps = async () => {
    try {
      const res = await api.get("/apps?limit=100");
      if (res.data) {
        setData(res.data);
        localStorage.setItem("yono_apps_perm_cache", JSON.stringify(res.data));
      }
    } catch (e) {
      if (!data) toast.error("Failed to load apps");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (parsedCache) {
      setLoading(false);
      fetchApps();
    } else {
      fetchApps();
    }
  }, [parsedCache]);

  const handleDownload = (app) => {
    toast.success(`Opening: ${app.name}`, { description: `${app.size} • v${app.version}` });
    
    if (app.apk_url && app.apk_url.startsWith("http")) {
      window.open(app.apk_url, "_blank"); 
      api.get(`/apps/${app.id}/download`).catch(() => {});
    } else {
      window.open(`${API}/apps/${app.id}/download`, "_blank");
    }

    setData((prev) => {
      if (!prev) return prev;
      const bump = (a) => (a.id === app.id ? { ...a, downloads: a.downloads + 1 } : a);
      const updated = {
        ...prev,
        featured: (prev.featured || []).map(bump),
        apps: (prev.apps || []).map(bump),
        trending: (prev.trending || []).map(bump),
      };
      localStorage.setItem("yono_apps_perm_cache", JSON.stringify(updated));
      return updated;
    });
  };

  const allAppsList = useMemo(() => {
    if (!data) return [];
    return [...(data.featured || []), ...(data.apps || []), ...(data.trending || [])];
  }, [data]);

  const handleKeywordClick = (kw) => {
    const cleanKw = kw.replace(/apk|download|2026|app|online|india|game|games/gi, "").trim();
    const matchedApp = allAppsList.find(a => normalize(a.name).includes(normalize(cleanKw)) || normalize(cleanKw).includes(normalize(a.name)));
    
    if (matchedApp) {
      navigate(`/${matchedApp.slug || matchedApp.id}`, { state: { app: matchedApp } });
    } else {
      setSearch(cleanKw || kw);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  const categories = useMemo(() => {
    if (!data) return ["All"];
    const set = new Set();
    [...(data.featured || []), ...(data.apps || [])].forEach((a) => a.category && set.add(a.category));
    return ["All", ...Array.from(set)];
  }, [data]);

  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = normalize(deferredSearch);
    const hasFilter = category !== "All" || q;
    let list = hasFilter ? [...(data.featured || []), ...(data.apps || [])] : [...(data.apps || [])];
    if (category !== "All") list = list.filter((a) => a.category === category);

    if (q) {
      const scored = [];
      for (const a of list) {
        const name = normalize(a.name);
        const haystack = `${name} ${normalize(a.slug)} ${normalize(a.category)} ${normalize(a.developer)}`;
        let score;
        if (name === q) score = 0;
        else if (name.startsWith(q)) score = 1;
        else if (name.includes(q)) score = 2;
        else if (haystack.includes(q)) score = 3;
        else continue;
        scored.push({ a, score });
      }
      scored.sort((x, y) => x.score - y.score || (y.a.downloads || 0) - (x.a.downloads || 0));
      list = scored.map((s) => s.a);
      return list;
    }

    if (sort === "downloads") list.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    else if (sort === "rating") list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sort === "newest") list.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    return list;
  }, [data, category, deferredSearch, sort]);

  const totalDownloads = useMemo(() => {
    if (!data) return 0;
    return [...(data.featured || []), ...(data.apps || [])].reduce((s, a) => s + (a.downloads || 0), 0);
  }, [data]);

  const isDefaultView = !search.trim() && category === "All";
  const hero = settings?.hero || {};
  const stats = settings?.stats || {};
  const tg = settings?.telegram || {};

  const en = (id) => sectionEnabled(settings, id);

  const appListSection = (
    <section key="apps" id="apps" className="space-y-3" data-testid="apps-section">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#FFC107]" />
        <h2 className="font-display text-base font-bold text-[#111111]">
          {isDefaultView ? "All Apps" : "Results"}
        </h2>
        <span className="text-xs text-[#999999]" aria-live="polite">
          ({filtered.length}{isDefaultView ? "" : filtered.length === 1 ? " match" : " matches"})
        </span>
        <div className="ml-auto">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger data-testid="sort-select" aria-label="Sort apps and games" className="h-8 w-auto gap-1 rounded-full border-[#E5E7EB] bg-white px-3 text-xs font-medium text-[#555555] focus:ring-[#FFC107]">
              <ArrowDownWideNarrow className="h-3.5 w-3.5 text-[#999999]" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div data-testid="empty-state" className="rounded-[20px] border border-dashed border-[#E5E7EB] bg-white py-10 text-center">
          <p className="text-sm text-[#777777]">No apps found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app, i) => (
            <AppCard key={app.id} app={app} index={i} onDownload={handleDownload} />
          ))}
        </div>
      )}
    </section>
  );

  const renderers = {
    featured: isDefaultView && en("featured") ? <FeaturedApps key="featured" apps={data?.featured || []} onDownload={handleDownload} /> : null,
    rummy: isDefaultView && en("rummy") ? <RummyFeatures key="rummy" /> : null,
    telegram: isDefaultView && en("telegram") && tg.enabled !== false ? (
      <a key="telegram" href={tg.link || "https://t.me/"} target="_blank" rel="noopener noreferrer" data-testid="telegram-cta"
        className="flex items-center gap-3 rounded-[20px] border border-[#229ED9]/20 bg-gradient-to-r from-[#229ED9]/10 to-[#229ED9]/5 p-3.5 transition-transform duration-200 active:scale-[0.98]">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#229ED9] shadow-[0_6px_16px_rgba(34,158,217,0.4)]">
          <Send className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-display text-sm font-bold text-[#111111]">{tg.cta_text || "Join our Telegram"}</p>
          <p className="text-xs text-[#777777]">{tg.sub_text || "Get instant updates & new APK releases"}{tg.member_count ? ` • ${tg.member_count} members` : ""}</p>
        </div>
        <span className="rounded-full bg-[#229ED9] px-3 py-1.5 text-xs font-semibold text-white">Join</span>
      </a>
    ) : null,
    winners: isDefaultView && en("winners") ? <LiveWinners key="winners" config={settings?.winners_config} /> : null,
    apps: appListSection,
    reviews: isDefaultView && en("reviews") ? (
      <div key="reviews-wrapper" className="space-y-4">
        <ReviewsSection />
        {/* 100 SOLID SEO KEYWORDS CLOUD PLACED RIGHT AFTER WHAT USERS SAY */}
        <section className="rounded-[22px] border border-[#E5E7EB] bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.02)] space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#FFF8E1] text-[#FFC107]">
              <Flame className="h-4 w-4 fill-[#FFC107]" />
            </span>
            <div>
              <h3 className="font-display text-sm font-bold text-[#111111]">Top 100 Yono Games, Rummy &amp; Money Game Keywords</h3>
              <p className="text-[10px] text-[#888888]">Click any keyword to explore games and instant download links</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {LANDING_100_KEYWORDS.map((kw, i) => (
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
      </div>
    ) : null,
    faq: isDefaultView && en("faq") ? <FaqSection key="faq" /> : null,
    legal: isDefaultView && en("legal") ? <LegalSection key="legal" onOpen={setLegalId} /> : null,
  };

  const order = (settings?.sections || []).map((s) => s.id);
  const finalOrder = order.includes("apps") ? order : [...order, "apps"];

  return (
    <div className="app-shell pb-10">
      <SEOHead
        title={settings?.seo?.homepage_title || "YONO GAMES - Play and Win | Premium Rummy & Games APK Store"}
        description={settings?.seo?.homepage_description || "Download the latest Rummy and gaming APK apps for Android free. Fast, safe & verified downloads with sign-up bonuses at YONO GAMES — uonogamesapk.com"}
        keywords={settings?.seo?.homepage_keywords || "yono games, rummy apk, teen patti apk, real cash rummy, apk download, android games, uono games apk"}
        canonical="https://newyono.games/"
        image="/logo-v2.png"
      />
      <AnnouncementBar config={settings?.announcement} />
      <Header />

      <div className="px-4 pt-3 text-center">
        <h1 className="font-display text-lg font-bold text-[#111111]">Welcome to YONO GAMES</h1>
        <p className="text-xs text-[#777777]">PLAY &amp; WIN • SINCE 2024</p>
      </div>

      {hero.enabled !== false && (
        <div className="px-4 pt-3">
          <div className="overflow-hidden rounded-[20px] border border-[#E5E7EB] shadow-[0_10px_30px_rgba(0,0,0,0.1)]" data-testid="hero-banner">
            <OptimizedImage 
              src={resolveUrl(hero.banner_url || "/hero-banner.png")} 
              alt={hero.headline || "Uonogamesapk.com"} 
              className="block w-full" 
            />
          </div>
          {(hero.headline || hero.subtitle) && (
            <div className="mt-3 text-center">
              {hero.headline && <h2 className="font-display text-xl font-bold text-[#111111]">{hero.headline}</h2>}
              {hero.subtitle && <p className="mt-0.5 text-sm text-[#777777]">{hero.subtitle}</p>}
            </div>
          )}
        </div>
      )}

      {stats.enabled !== false && (
        <div className="grid grid-cols-3 gap-2 px-4 pt-4">
          {(stats.items || []).slice(0, 3).map((s, i) => {
            const Icon = [Download, ShieldCheck, TrendingUp][i] || Sparkles;
            const color = ["#FFC107", "#22C55E", "#FFB300"][i] || "#FFC107";
            const autoVal = i === 0 ? totalDownloads : (data ? [...(data.featured || []), ...(data.apps || [])].length : 0);
            const isAuto = s.value === "auto";
            return (
              <div key={i} className="rounded-[16px] border border-[#E5E7EB] bg-white p-3 text-center shadow-[0_6px_20px_rgba(0,0,0,0.03)]">
                <Icon className="mx-auto h-4 w-4" style={{ color }} />
                <p className="mt-1 font-display text-base font-bold text-[#111111]">
                  {isAuto ? <AnimatedCounter value={autoVal} /> : s.value}
                  {s.suffix || ""}
                </p>
                <p className="text-[10px] text-[#777777]">{s.label}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="sticky top-[57px] z-30 bg-[#F8F9FA]/90 px-4 py-3 backdrop-blur-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777777]" />
          <Input
            data-testid="search-input"
            type="search"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            aria-label="Search apps and games"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setSearch("")}
            placeholder="Search apps & games..."
            className="h-11 rounded-full border-[#E5E7EB] bg-white pl-10 pr-10 text-base shadow-[0_4px_14px_rgba(0,0,0,0.03)] focus-visible:ring-[#FFC107] sm:text-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              data-testid="search-clear"
              className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-[#F1F1F1] text-[#777777] hover:bg-[#E5E7EB]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {categories.map((c) => (
            <button key={c} data-testid={`category-${c}`} onClick={() => setCategory(c)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors duration-200 ${
                category === c ? "bg-[#FFC107] text-[#111111] shadow-[0_4px_12px_rgba(255,193,7,0.4)]" : "border border-[#E5E7EB] bg-white text-[#555555]"
              }`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <main className="space-y-5 px-4 pt-1">
        {loading && !data ? (
          <StoreSkeleton />
        ) : (
          <>
            {finalOrder.map((id) => renderers[id]).filter(Boolean)}
            {isDefaultView && en("winners") && <RedeemBox />}
            {isDefaultView && <AdSlot ads={settings?.ads} />}
          </>
        )}

        {isDefaultView && (
          <section className="mt-8 mb-4 space-y-4 rounded-[24px] border border-[#E5E7EB] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <h2 className="font-display text-xl font-bold text-[#111111]">
              All Yono Games - Discover New Yono Apps & Play Top Gaming Apps
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-[#555555]">
              <p>
                <strong>Yono New Games</strong> was launched with a simple mission — to give players across India a place where they can easily discover, download, and enjoy exciting mobile games. We noticed that modern players want more than just simple tapping games. Today's gamers enjoy challenges that require strategy, quick thinking, and skill.
              </p>
              <p>
                That's exactly what <strong>All New Yono Apps</strong> aims to deliver. Our platform brings together a collection of games that combine classic gameplay with modern mobile experiences. From popular card titles like <strong>Yono Rummy</strong> to the latest slot and arcade apps gaining popularity in India, every game listed here is chosen carefully for its entertainment value.
              </p>
              <h3 className="font-display text-lg font-bold text-[#111111] pt-2">
                Why Thousands of Players Choose Yono New Games
              </h3>
              <p>
                Finding a reliable place to explore mobile gaming apps can be difficult. New Yono Games focuses on making that process easier for Indian players. We provide detailed information, safe download links, fast updates, and app features right at your fingertips so you can start playing instantly.
              </p>
              <p className="text-xs text-[#999999] pt-2 border-t border-[#E5E7EB]">
                Disclaimer: We are an independent informational platform. We do not own, operate, or manage any gaming applications listed on this website. Always play responsibly.
              </p>
            </div>
          </section>
        )}
      </main>

      <SiteFooter onOpenLegal={setLegalId} />
      <LegalDialog openId={legalId} onClose={() => setLegalId(null)} />
    </div>
  );
}
