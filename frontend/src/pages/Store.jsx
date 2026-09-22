import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Search, Download, Sparkles, TrendingUp, ShieldCheck, ArrowDownWideNarrow, X, Flame, Trophy } from "lucide-react";
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

  const top3 = useMemo(() => {
    const featuredList = data?.featured || parsedCache?.featured || [];
    if (featuredList.length > 0) {
      return featuredList.slice(0, 3).map(app => ({
        ...app,
        version: "v2026 Latest",
        size: app.size || "45 MB"
      }));
    }
    return allAppsList.slice(0, 3);
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
      const top3Ids = new Set(top3.map(t => t.id));
      list = list.filter(a => !top3Ids.has(a.id));
    }
    
    list.sort((a, b) => {
      if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sort === "newest") return new Date(b.created_at || 0) - new Date(b.created_at || 0);
      return (b.downloads || 0) - (a.downloads || 0);
    });
    return list;
  }, [allAppsList, category, search, top3, sort]);

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
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#999999]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search 100+ games..."
              className="pl-10 rounded-2xl bg-[#F8F9FA] border-[#E5E7EB] text-sm"
            />
          </div>

          {/* FEATURED GAMES SECTION - VERTICAL STACK */}
          {top3.length > 0 && !search && category === "All" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-[#111111] flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-[#FF9800]" /> Featured Games
                </h3>
                <span className="text-xs text-[#777777]">Top Picks</span>
              </div>
              
              <div className="space-y-3">
                {top3.map((app, idx) => (
                  <AppCard key={app.id || idx} app={app} index={idx} onDownload={handleDownload} />
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 pt-2">
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

        <SiteFooter onOpenLegal={(id) => setLegalId(id)} />
      </div>

      <LegalDialog legalId={legalId} onClose={() => setLegalId(null)} />
    </div>
  );
}
