import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Search, Download, Sparkles, TrendingUp, ShieldCheck, ArrowDownWideNarrow, X, Flame, Trophy, Gift, Star, BadgeCheck, Crown, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api, { API, resolveUrl } from "@/lib/api";
import SEOHead from "@/components/SEOHead";
import { useSettings, sectionEnabled } from "@/context/SettingsContext";
import AppCard from "@/components/AppCard";
import AppIcon from "@/components/AppIcon";
import RippleButton from "@/components/RippleButton";
import FaqSection from "@/components/FaqSection";
import LegalSection from "@/components/LegalSection";
import LegalDialog from "@/components/LegalDialog";
import SiteFooter from "@/components/SiteFooter";
import ReviewsSection from "@/components/ReviewsSection";
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
      // Silent fail
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleDownload = (app) => {
    if (app.apk_url && app.apk_url.startsWith("http")) {
      window.open(app.apk_url, "_blank"); 
      api.get(`/apps/${app.id}/download`).catch(() => {});
    } else {
      window.open(`${API}/apps/${app.id}/download`, "_blank");
    }
  };

  const allAppsList = useMemo(() => {
    const rawList = data?.apps || parsedCache?.apps || data?.featured || parsedCache?.featured || [];
    return rawList.map(app => ({
      ...app,
      version: "v2026 Latest",
      size: app.size || "45 MB"
    }));
  }, [data, parsedCache]);

  const topApps = useMemo(() => {
    return allAppsList.slice(0, 20);
  }, [allAppsList]);

  const filteredApps = useMemo(() => {
    let list = [...allAppsList];
    if (category !== "All") {
      list = list.filter(a => normalize(a.category) === normalize(category));
    }
    if (search.trim()) {
      const q = normalize(search);
      list = list.filter(a => normalize(a.name).includes(q) || normalize(a.description).includes(q) || normalize(a.category).includes(q));
    }
    
    list.sort((a, b) => {
      if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sort === "newest") return new Date(b.created_at || 0) - new Date(b.created_at || 0);
      return (b.downloads || 0) - (a.downloads || 0);
    });
    return list;
  }, [allAppsList, category, search, sort]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111] pb-16">
      <SEOHead title="New Yono Games Official - Download APK & Get ₹501 Bonus" description="Download official Yono Games apps. Enjoy fast UPI withdrawals and secure real-cash gaming." />
      
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-sm flex flex-col">
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-[#E5E7EB] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-lg bg-gradient-to-r from-[#FFC107] to-[#FF9800] bg-clip-text text-transparent">NewYono.Games</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#22C55E] bg-[#F0FDF4] px-2 py-1 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5" /> 100% Secure
            </span>
          </div>
        </header>

        <div className="p-4 space-y-4 flex-1">
          {/* STATS BAR */}
          <div className="grid grid-cols-3 gap-2 bg-white border border-[#E5E7EB] rounded-2xl p-3 shadow-sm text-center">
            <div className="flex flex-col items-center">
              <Download className="h-4 w-4 text-[#D97706] mb-0.5" />
              <span className="text-xs font-bold text-[#111111]">10M+</span>
              <span className="text-[10px] text-[#777777]">Downloads</span>
            </div>
            <div className="flex flex-col items-center border-x border-[#E5E7EB]">
              <ShieldCheck className="h-4 w-4 text-[#16A34A] mb-0.5" />
              <span className="text-xs font-bold text-[#111111]">74</span>
              <span className="text-[10px] text-[#777777]">Verified</span>
            </div>
            <div className="flex flex-col items-center">
              <Star className="h-4 w-4 text-[#FFC107] fill-[#FFC107] mb-0.5" />
              <span className="text-xs font-bold text-[#111111]">4.8</span>
              <span className="text-[10px] text-[#777777]">Rating</span>
            </div>
          </div>

          {/* TOP 20 FEATURED GAMES SLIDER */}
          {topApps.length > 0 && !search && category === "All" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-display font-bold text-sm text-[#111111] flex items-center gap-1.5">
                  <Crown className="h-4 w-4 text-[#FFC107]" /> Top 20 Featured Games
                </h3>
                <span className="text-xs text-[#777777]">Swipe to explore ➔</span>
              </div>
              
              <div className="w-full overflow-x-auto pb-2 pt-1 no-scrollbar" style={{ WebkitOverflowScrolling: "touch" }}>
                <div className="flex gap-2.5 px-1 min-w-max items-center">
                  {topApps.map((app, idx) => {
                    const rankNumber = idx + 1;
                    const isTop1 = rankNumber === 1;
                    return (
                      <div 
                        key={app.id || idx} 
                        onClick={() => {
                          if (window._adCooldown) return;
                          window._adCooldown = true;
                          setTimeout(() => { window._adCooldown = false; }, 2000);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                          navigate(`/${app.slug || `app/${app.id}`}`, { state: { app } });
                        }}
                        className={`relative shrink-0 cursor-pointer rounded-2xl border p-2.5 flex flex-col items-center text-center justify-between transition-all select-none ${
                          isTop1 
                            ? "w-[126px] min-h-[205px] border-2 border-[#FFC107] bg-gradient-to-b from-[#FFFDF5] to-white shadow-[0_4px_16px_rgba(255,193,7,0.2)] z-10" 
                            : "w-[114px] min-h-[190px] border-[#E5E7EB] bg-white shadow-sm opacity-95"
                        }`}
                      >
                        <div 
                          className="absolute -left-1 -top-1.5 flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-black text-white shadow-sm border border-white pointer-events-none"
                          style={{
                            background: rankNumber === 1 
                              ? "linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)" 
                              : rankNumber <= 3 
                              ? "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)" 
                              : "linear-gradient(135deg, #424242 0%, #212121 100%)"
                          }}
                        >
                          <Crown className="h-2 w-2 text-white fill-white" />
                          <span>#{rankNumber}</span>
                        </div>

                        <div className="flex flex-col items-center w-full mt-1">
                          <div className="relative">
                            <AppIcon
                              src={resolveUrl(app.icon_url)}
                              alt={app.name}
                              className={`${isTop1 ? "h-12 w-12" : "h-10 w-10"} rounded-[12px] ring-1 ring-black/5 object-cover shadow-sm`}
                            />
                            <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1 py-0.2 text-[6px] font-extrabold text-white shadow-sm leading-none">
                              HOT
                            </span>
                          </div>

                          <h4 className="mt-1.5 line-clamp-1 font-display text-[11px] font-bold text-[#111111] w-full">
                            {app.name}
                          </h4>

                          <div className="mt-1 space-y-0.5 w-full">
                            <div className="flex items-center justify-center gap-0.5 text-[9px] font-semibold text-[#555555]">
                              <Star className="h-2.5 w-2.5 fill-[#FFC107] text-[#FFC107]" />
                              <span>{app.rating?.toFixed(1) || "4.8"}</span>
                            </div>
                            {app.signup_bonus ? (
                              <div className="flex items-center justify-center gap-0.5 text-[8.5px] font-extrabold text-[#D97706] truncate">
                                <Gift className="h-2 w-2 shrink-0" /> {app.signup_bonus}
                              </div>
                            ) : (
                              <div className="text-[8.5px] text-transparent">Bonus</div>
                            )}
                            {app.min_withdraw ? (
                              <div className="text-[8.5px] font-bold text-[#16A34A] truncate">
                                Min {app.min_withdraw}
                              </div>
                            ) : (
                              <div className="text-[8.5px] text-transparent">Min W/D</div>
                            )}
                          </div>
                        </div>

                        <RippleButton
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window._adCooldown) return;
                            window._adCooldown = true;
                            setTimeout(() => { window._adCooldown = false; }, 2000);
                            handleDownload(app);
                          }}
                          className={`mt-2 w-full flex items-center justify-center gap-1 rounded-full py-1 text-[9.5px] font-bold shadow-sm ${
                            isTop1 
                              ? "bg-gradient-to-r from-[#FFC107] to-[#FF9800] text-white hover:opacity-95 shadow-sm" 
                              : "bg-[#FFC107] text-[#111111] hover:bg-[#FFB300]"
                          }`}
                        >
                          <Download className="h-2.5 w-2.5" /> Get
                        </RippleButton>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TELEGRAM JOIN BANNER */}
          <div 
            onClick={() => window.open("https://t.me/yonoagencynetworkofficial", "_blank")}
            className="cursor-pointer bg-gradient-to-r from-[#E0F2FE50] to-[#E0F2FE] border border-[#BAE6FD] rounded-2xl p-3 flex items-center justify-between shadow-sm hover:shadow transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-[#0284C7] flex items-center justify-center text-white shadow-sm shrink-0">
                <Send className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-display font-bold text-xs text-[#0369A1]">Join our Telegram</h4>
                <p className="text-[10px] text-[#0284C7]">Get instant updates & new APK releases</p>
              </div>
            </div>
            <span className="bg-[#0284C7] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
              Join
            </span>
          </div>

          {/* LIVE WINNERS TICKER */}
          <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-2.5 flex items-center gap-2 overflow-hidden shadow-sm">
            <div className="flex items-center gap-1 bg-[#16A34A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 z-10">
              <Trophy className="h-3 w-3" /> Live
            </div>
            <div className="overflow-hidden w-full relative">
              <div className="flex whitespace-nowrap animate-marquee text-[11px] text-[#166534] font-medium items-center">
                <span>🔥 <strong className="text-[#111]">Rahul</strong> won <strong className="text-[#15803D]">₹25,000</strong> in Rummy Ludo &nbsp;&nbsp;•&nbsp;&nbsp; 🚀 <strong className="text-[#111]">Amit</strong> won <strong className="text-[#15803D]">₹10,500</strong> in Gold Rummy &nbsp;&nbsp;•&nbsp;&nbsp; ⭐ <strong className="text-[#111]">Vikash</strong> won <strong className="text-[#15803D]">₹5,000</strong> in Teen Patti &nbsp;&nbsp;•&nbsp;&nbsp; 💰 <strong className="text-[#111]">Deepak</strong> won <strong className="text-[#15803D]">₹15,200</strong> in Dragon Tiger &nbsp;&nbsp;•&nbsp;&nbsp;</span>
                <span className="ml-8">🔥 <strong className="text-[#111]">Rahul</strong> won <strong className="text-[#15803D]">₹25,000</strong> in Rummy Ludo &nbsp;&nbsp;•&nbsp;&nbsp; 🚀 <strong className="text-[#111]">Amit</strong> won <strong className="text-[#15803D]">₹10,500</strong> in Gold Rummy &nbsp;&nbsp;•&nbsp;&nbsp; ⭐ <strong className="text-[#111]">Vikash</strong> won <strong className="text-[#15803D]">₹5,000</strong> in Teen Patti &nbsp;&nbsp;•&nbsp;&nbsp; 💰 <strong className="text-[#111]">Deepak</strong> won <strong className="text-[#15803D]">₹15,200</strong> in Dragon Tiger &nbsp;&nbsp;•&nbsp;&nbsp;</span>
              </div>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="relative pt-1">
            <Search className="absolute left-3.5 top-4 h-4 w-4 text-[#999999]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search 100+ games..."
              className="pl-10 rounded-2xl bg-[#F8F9FA] border-[#E5E7EB] text-sm py-2.5"
            />
          </div>

          {/* ALL GAMES LIST */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-[#111111]">All Games</h3>
              <span className="text-xs text-[#777777]">{filteredApps.length} games</span>
            </div>
            <div className="space-y-3">
              {filteredApps.map((app, idx) => (
                <AppCard key={app.id || idx} app={app} index={idx} onDownload={handleDownload} />
              ))}
            </div>
          </div>
        </div>

        {/* DETAILED GOOGLE SEO KEYWORDS & RICH DESCRIPTION BLOCK */}
        <div className="bg-white border-t border-[#E5E7EB] px-4 py-6 space-y-4 text-[11px] text-[#555555] leading-relaxed">
          <div className="space-y-1.5">
            <h4 className="font-display font-bold text-xs text-[#111111]">New Yono Games Official APK Download & Real Cash Platform 2026</h4>
            <p>
              NewYono.Games is the ultimate official hub for downloading top-performing Android gaming apps, Yono Rummy, Teen Patti Master, Dragon Tiger, 777 Slots, Ludo tournaments, and crash games. Designed for high-speed performance and absolute security, our platform brings together verified gaming operators offering instant UPI withdrawals, massive sign-up bonuses from ₹501 to ₹2501, and 24/7 customer support. Explore trusted apps like New Yono Rummy, Jaiho Games, and Diwa Slots to maximize your daily earnings.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-display font-bold text-xs text-[#111111]">Targeted SEO Keywords & Search Terms Directory</h4>
            <p className="text-[10px] text-[#666666] leading-relaxed bg-[#F9FAFB] p-3 rounded-xl border border-gray-100">
              <strong>Core Keywords Index:</strong> Yono Games download, New Yono Rummy APK, Teen Patti real cash app, Slots spin bonus apps, Yono agency program, online rummy referral commission, instant UPI cash withdrawal games, Android gaming store India, 777 slots apk download, Best rummy app with bonus, Yono partner network official, trusted gaming platform 2026, Teen Patti Gold, Ludo cash winning apps, Dragon Tiger tricks, fast withdrawal rummy apps, NewYono.Games official link.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-display font-bold text-xs text-[#111111]">Privacy Policy, Terms of Service & Responsible Gaming Notice</h4>
            <p>
              Your privacy and security are paramount at NewYono.Games. We collect basic anonymous site analytics via Google Analytics and Search Console solely to improve user navigation and optimize download speeds. All external APK links redirect to official verified servers equipped with advanced encryption. Real-cash gaming involves financial risk; users must be 18+ and verify local state regulations before playing. Promotions are subject to individual operator wagering requirements.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-display font-bold text-xs text-[#111111]">DMCA Compliance & Copyright Protection</h4>
            <p>
              NewYono.Games operates strictly as an informational aggregator and APK review directory. We do not host hacked files or malicious software. In full compliance with the Digital Millennium Copyright Act (DMCA), we promptly address and resolve any copyright concerns or notices reported directly through our official Telegram network channels.
            </p>
          </div>
        </div>

        {/* SITE FOOTER */}
        <SiteFooter onOpenLegal={(id) => setLegalId(id)} />
      </div>

      <LegalDialog legalId={legalId} onClose={() => setLegalId(null)} />
    </div>
  );
}
