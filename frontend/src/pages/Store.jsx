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
import HowToInstallSection from "@/components/HowToInstallSection";
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
    const list = [...allAppsList];
    if (list.length === 0) return [];

    const rummyLudo = list.find(a => normalize(a.name).includes("rummyludo")) || list[0];
    const indRummy = list.find(a => normalize(a.name).includes("indrummy")) || list[1] || list[0];
    const goldRummy = list.find(a => normalize(a.name).includes("goldrummy")) || list[2] || list[0];

    const remaining = list.filter(a => a.id !== rummyLudo?.id && a.id !== indRummy?.id && a.id !== goldRummy?.id);

    return [rummyLudo, indRummy, goldRummy, ...remaining].map(app => ({
      ...app,
      version: "v2026 Latest",
      size: app.size || "45 MB"
    }));
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

          {/* FEATURED GAMES SLIDER */}
          {topApps.length > 0 && !search && category === "All" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-display font-bold text-sm text-[#111111] flex items-center gap-1.5">
                  <Crown className="h-4 w-4 text-[#FFC107]" /> Trending Featured Games
                </h3>
                <span className="text-xs text-[#777777]">Swipe to explore ➔</span>
              </div>
              
              <div className="w-full overflow-x-auto pb-3 pt-1" style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
                <div className="flex gap-2.5 px-1 w-max items-center">
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
                        className={`relative shrink-
