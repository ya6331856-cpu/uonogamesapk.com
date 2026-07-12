import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Send, Download, Sparkles, TrendingUp, ShieldCheck, ArrowDownWideNarrow } from "lucide-react";
import { toast } from "sonner";
import api, { API } from "@/lib/api";
import Header from "@/components/Header";
import FeaturedApps from "@/components/FeaturedApps";
import AppCard from "@/components/AppCard";
import AnimatedCounter from "@/components/AnimatedCounter";
import { StoreSkeleton } from "@/components/Skeletons";
import FaqSection from "@/components/FaqSection";
import LegalSection from "@/components/LegalSection";
import LegalDialog from "@/components/LegalDialog";
import SiteFooter from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const CATEGORIES = ["All", "Games", "Puzzle", "Simulation"];
const SORTS = [
  { value: "downloads", label: "Most Downloaded" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

export default function Store() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("downloads");
  const [legalId, setLegalId] = useState(null);

  const fetchApps = async () => {
    try {
      const res = await api.get("/apps");
      setData(res.data);
    } catch (e) {
      toast.error("Failed to load apps");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleDownload = (app) => {
    toast.success(`Starting download: ${app.name}`, { description: `${app.size} • v${app.version}` });
    window.open(`${API}/apps/${app.id}/download`, "_blank");
    // optimistic bump
    setData((prev) => {
      if (!prev) return prev;
      const bump = (a) => (a.id === app.id ? { ...a, downloads: a.downloads + 1 } : a);
      return { ...prev, featured: prev.featured.map(bump), apps: prev.apps.map(bump) };
    });
  };

  const filtered = useMemo(() => {
    if (!data) return [];
    const hasFilter = category !== "All" || search.trim();
    let list = hasFilter ? [...data.featured, ...data.apps] : [...data.apps];
    if (category !== "All") list = list.filter((a) => a.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q));
    }
    if (sort === "downloads") list.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    else if (sort === "rating") list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sort === "newest") list.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    return list;
  }, [data, category, search, sort]);

  const totalDownloads = useMemo(() => {
    if (!data) return 0;
    return [...data.featured, ...data.apps].reduce((s, a) => s + (a.downloads || 0), 0);
  }, [data]);

  return (
    <div className="app-shell pb-10">
      <Header />

      {/* Hero banner */}
      <div className="px-4 pt-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-[20px] border border-[#E5E7EB] shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
          data-testid="hero-banner"
        >
          <img
            src="/hero-banner.png"
            alt="Uonogamesapk.com - Play Rummy Win Real Cash"
            className="block w-full"
            loading="eager"
            decoding="async"
          />
        </motion.div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 px-4 pt-4">
        {[
          { icon: Download, label: "Downloads", value: totalDownloads, color: "#FFC107" },
          { icon: ShieldCheck, label: "Verified", value: (data ? [...data.featured, ...data.apps].length : 0), color: "#22C55E" },
          { icon: TrendingUp, label: "Rating", value: 48, color: "#FFB300", suffix: "" },
        ].map((s, i) => (
          <div
            key={i}
            className="rounded-[16px] border border-[#E5E7EB] bg-white p-3 text-center shadow-[0_6px_20px_rgba(0,0,0,0.03)]"
          >
            <s.icon className="mx-auto h-4 w-4" style={{ color: s.color }} />
            <p className="mt-1 font-display text-base font-bold text-[#111111]">
              {i === 2 ? "4.8" : <AnimatedCounter value={s.value} />}
              {i === 0 && "+"}
            </p>
            <p className="text-[10px] text-[#777777]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="sticky top-[57px] z-30 bg-[#F8F9FA]/90 px-4 py-3 backdrop-blur-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777777]" />
          <Input
            data-testid="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search apps & games..."
            className="h-11 rounded-full border-[#E5E7EB] bg-white pl-10 text-sm shadow-[0_4px_14px_rgba(0,0,0,0.03)] focus-visible:ring-[#FFC107]"
          />
        </div>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              data-testid={`category-${c}`}
              onClick={() => setCategory(c)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors duration-200 ${
                category === c
                  ? "bg-[#FFC107] text-[#111111] shadow-[0_4px_12px_rgba(255,193,7,0.4)]"
                  : "border border-[#E5E7EB] bg-white text-[#555555]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <main className="space-y-5 px-4 pt-1">
        {loading ? (
          <StoreSkeleton />
        ) : (
          <>
            {/* Featured only shown when no search/filter active */}
            {!search.trim() && category === "All" && (
              <FeaturedApps apps={data?.featured} onDownload={handleDownload} />
            )}

            {/* Telegram CTA */}
            <a
              href="https://t.me/"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="telegram-cta"
              className="flex items-center gap-3 rounded-[20px] border border-[#229ED9]/20 bg-gradient-to-r from-[#229ED9]/10 to-[#229ED9]/5 p-3.5 transition-transform duration-200 active:scale-[0.98]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#229ED9] shadow-[0_6px_16px_rgba(34,158,217,0.4)]">
                <Send className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-display text-sm font-bold text-[#111111]">Join our Telegram</p>
                <p className="text-xs text-[#777777]">Get instant updates & new APK releases</p>
              </div>
              <span className="rounded-full bg-[#229ED9] px-3 py-1.5 text-xs font-semibold text-white">Join</span>
            </a>

            {/* App list */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#FFC107]" />
                <h2 className="font-display text-base font-bold text-[#111111]">
                  {search.trim() || category !== "All" ? "Results" : "All Apps"}
                </h2>
                <span className="text-xs text-[#999999]">({filtered.length})</span>
                <div className="ml-auto">
                  <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger
                      data-testid="sort-select"
                      className="h-8 w-auto gap-1 rounded-full border-[#E5E7EB] bg-white px-3 text-xs font-medium text-[#555555] focus:ring-[#FFC107]"
                    >
                      <ArrowDownWideNarrow className="h-3.5 w-3.5 text-[#999999]" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORTS.map((s) => (
                        <SelectItem key={s.value} value={s.value} className="text-xs">
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div
                  data-testid="empty-state"
                  className="rounded-[20px] border border-dashed border-[#E5E7EB] bg-white py-10 text-center"
                >
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

            {/* FAQ */}
            <FaqSection />

            {/* Legal */}
            <LegalSection onOpen={setLegalId} />
          </>
        )}
      </main>

      <SiteFooter onOpenLegal={setLegalId} />
      <LegalDialog openId={legalId} onClose={() => setLegalId(null)} />
    </div>
  );
}
