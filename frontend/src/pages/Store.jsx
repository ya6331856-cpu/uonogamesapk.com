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
    const featuredList = data?.featured || parsedCache?.featured || [];
    if (featuredList.length > 0) {
      return featuredList.slice(0, 15).map(app => ({
        ...app,
        version: "v2026 Latest",
        size: app.size || "45 MB"
      }));
    }
    return allAppsList.slice(0, 15);
  }, [data, parsedCache, allAppsList]);

  const filteredApps = useMemo(() => {
    let list = [...allAppsList];
    if (category !== "All") {
      list = list.filter(a => normalize(a.category) === normalize(category));
    }
    if (search.trim()) {
      const q = normalize(search);
      list = list.filter(a => normalize(a.name).includes(q) || normalize(a.description).includes(q) || normalize(a.category).includes(q));
    } else if (category === "All") {
      const top3Ids = new Set(topApps.slice(0, 3).map(t => t.id));
      list = list.filter(a => !top3Ids.has(a.id));
    }
    
    list.sort((a, b) => {
      if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sort === "newest") return new Date(b.created_at || 0) - new Date(b.created_at || 0);
      return (b.downloads || 0) - (a.downloads || 0);
    });
    return list;
  }, [allAppsList, category, search, topApps, sort]);

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

          {/* TOP APPS CAROUSEL */}
          {topApps.length > 0 && !search && category === "All" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-display font-bold text-sm text-[#111111] flex items-center gap-1.5">
                  <Crown className="h-4 w-4 text-[#FFC107]" /> Top 3 Apps Today
                </h3>
                <span className="text-xs text-[#777777]">Swipe for more</span>
              </div>
              
              <div className="w-full overflow-x-auto pb-3 pt-2 no-scrollbar" style={{ WebkitOverflowScrolling: "touch" }}>
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
                        className={`relative shrink-0 cursor-pointer rounded-[22px] border p-3.5 flex flex-col items-center text-center justify-between transition-all select-none ${
                          isTop1 
                            ? "w-[138px] min-h-[250px] border-2 border-[#FFC107] bg-gradient-to-b from-[#FFFDF5] to-white shadow-[0_8px_24px_rgba(255,193,7,0.25)] z-10" 
                            : "w-[122px] min-h-[230px] border-[#E5E7EB] bg-white shadow-sm opacity-95"
                        }`}
                      >
                        <div 
                          className="absolute -left-1.5 -top-2 flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black text-white shadow-md border-2 border-white pointer-events-none"
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
                          <Crown className="h-2.5 w-2.5 text-white fill-white" />
                          <span>#{rankNumber}</span>
                        </div>

                        <div className="flex flex-col items-center w-full mt-2">
                          <div className="relative">
                            <AppIcon
                              src={resolveUrl(app.icon_url)}
                              alt={app.name}
                              className={`${isTop1 ? "h-15 w-15" : "h-12 w-12"} rounded-[14px] ring-1 ring-black/5 object-cover shadow-sm`}
                            />
                            <span className="absolute -right-1.5 -top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[7px] font-extrabold text-white shadow-sm leading-none">
                              NEW
                            </span>
                          </div>

                          <h4 className="mt-2 line-clamp-1 font-display text-xs font-bold text-[#111111] w-full">
                            {app.name}
                          </h4>

                          <div className="mt-1.5 space-y-1 w-full">
                            <div className="flex items-center justify-center gap-0.5 text-[9px] font-semibold text-[#555555]">
                              <Star className="h-2.5 w-2.5 fill-[#FFC107] text-[#FFC107]" />
                              <span>{app.rating?.toFixed(1) || "4.8"}</span>
                            </div>
                            {app.signup_bonus ? (
                              <div className="flex items-center justify-center gap-0.5 text-[9px] font-extrabold text-[#D97706] truncate">
                                <Gift className="h-2.5 w-2.5 shrink-0" /> {app.signup_bonus}
                              </div>
                            ) : (
                              <div className="text-[9px] text-transparent">Bonus</div>
                            )}
                            {app.min_withdraw ? (
                              <div className="text-[9px] font-bold text-[#16A34A] truncate">
                                Min {app.min_withdraw}
                              </div>
                            ) : (
                              <div className="text-[9px] text-transparent">Min W/D</div>
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
                          className={`mt-2.5 w-full flex items-center justify-center gap-1 rounded-full py-1.5 text-[10px] font-bold shadow-sm ${
                            isTop1 
                              ? "bg-gradient-to-r from-[#FFC107] to-[#FF9800] text-white hover:opacity-95 shadow-md" 
                              : "bg-[#FFC107] text-[#111111] hover:bg-[#FFB300]"
                          }`}
                        >
                          <Download className="h-3 w-3" /> Get
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

        {/* HEAVY & MASSIVE SEO KEYWORDS & LEGAL DETAILS SECTION FOR GOOGLEBOT */}
        <div className="bg-white border-t border-[#E5E7EB] px-4 py-6 space-y-4 text-[11px] text-[#555555] leading-relaxed">
          <div className="space-y-1.5">
            <h4 className="font-display font-bold text-xs text-[#111111]">About NewYono.Games – India&apos;s #1 Trusted Gaming APK & Rummy Hub</h4>
            <p>
              NewYono.Games is the premier official portal for downloading verified Android gaming applications, real-cash rummy APKs, teen patti master apps, slot machine simulators, ludo cash games, and multiplayer arcade tournaments. Our platform is specifically designed to provide seamless access to top-rated gaming brands including Yono Rummy, 777 Spin Games, Jaiho Rummy, Diwa Games, and 1Win slots with instant UPI payout integration. Every single APK hosted or linked on NewYono.Games undergoes rigorous security screening to protect users from malware and ensure 100% safe gameplay. Enjoy massive sign-up bonuses ranging from ₹501 to ₹2501, lowest withdrawal limits starting at ₹100, and 24/7 dedicated customer assistance via our official Telegram network.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-display font-bold text-xs text-[#111111]">Comprehensive Privacy Policy & User Data Protection</h4>
            <p>
              At NewYono.Games, safeguarding your privacy and personal data security is our utmost corporate responsibility. We collect anonymized user metrics, search queries, download logs, and performance diagnostics via industry-standard tracking tools such as Google Analytics, Google Search Console, and Microsoft Clarity solely for the purpose of optimizing our content layout and improving server response times. When you navigate through our portal to download third-party gaming applications, your data interaction within those apps is strictly bound by advanced 256-bit SSL encryption standards. We never rent, sell, trade, or transfer any identifiable user information to unauthorized third-party marketing entities.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-display font-bold text-xs text-[#111111]">Terms & Conditions for Real-Cash Gaming & Agency Programs</h4>
            <p>
              By accessing, browsing, or downloading applications from NewYono.Games, you formally acknowledge and agree to comply with our comprehensive Terms and Conditions. Real-cash gaming, online rummy, card games, and referral affiliate agency programs involve inherent financial risks. Users must be at least 18 years of age and independently verify the legality of online skill games and cash apps within their respective state jurisdiction before participating. Promotional offers, sign-up bonuses, and daily rebate rewards are governed by individual operator wagering criteria and withdrawal caps. NewYono.Games assumes no direct legal liability for transactional discrepancies occurring on external third-party gaming platforms.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-display font-bold text-xs text-[#111111]">Disclaimer, Fair Use & DMCA Copyright Compliance</h4>
            <p>
              NewYono.Games operates purely as an independent informational APK review directory and download aggregator. We do not host cracked files or malicious executables on our servers; all download links redirect users to official, verified operator channels. We strictly respect global intellectual property laws and fully comply with the Digital Millennium Copyright Act (DMCA). If copyright holders, trademark owners, or legal representatives notice any accidental discrepancy, trademark conflict, or require content removal, please submit a formal notice through our official Telegram agency channel for immediate verification and swift resolution.
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
