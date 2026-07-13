import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Search, Sparkles, RefreshCw, CheckCircle2, AlertCircle, ExternalLink,
  Loader2, Wand2, FileText, Globe2, Bot,
} from "lucide-react";
import api, { API } from "@/lib/api";
import { PageHeader, Card } from "@/components/admin/adminUI";
import RippleButton from "@/components/RippleButton";
import { Input } from "@/components/ui/input";

const Stat = ({ label, value, tone = "default", testId }) => {
  const toneMap = {
    default: "border-[#E5E7EB] bg-white",
    good: "border-[#BBF7D0] bg-[#F0FDF4] text-[#065F46]",
    warn: "border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]",
    bad: "border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]",
  };
  return (
    <div data-testid={testId} className={`rounded-[16px] border p-4 shadow-[0_6px_20px_rgba(0,0,0,0.03)] ${toneMap[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
    </div>
  );
};

export default function SeoDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(null); // app id being generated
  const [bulkBusy, setBulkBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [o, a] = await Promise.all([
        api.get("/admin/seo/overview"),
        api.get("/admin/seo/apps"),
      ]);
      setOverview(o.data);
      setApps(a.data);
    } catch (e) {
      toast.error("Failed to load SEO data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const autoGenerate = async (id) => {
    setBusy(id);
    try {
      await api.post(`/admin/seo/auto-generate/${id}`);
      toast.success("SEO fields generated");
      await load();
    } catch {
      toast.error("Failed to auto-generate");
    } finally {
      setBusy(null);
    }
  };

  const bulkFix = async () => {
    setBulkBusy(true);
    try {
      const res = await api.post("/admin/seo/bulk-fix");
      toast.success(`Fixed ${res.data.fixed}/${res.data.total} apps`);
      await load();
    } catch {
      toast.error("Bulk fix failed");
    } finally {
      setBulkBusy(false);
    }
  };

  const openSitemap = () => window.open(`${API}/sitemap.xml`, "_blank");
  const openRobots = () => window.open(`${API}/robots.txt`, "_blank");
  const openSearchConsole = () => window.open("https://search.google.com/search-console", "_blank");

  const filtered = apps.filter((a) =>
    !query.trim() ||
    a.name.toLowerCase().includes(query.toLowerCase()) ||
    a.slug.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-[#FFC107]" />
    </div>
  );

  const score = overview?.seo_score ?? 0;
  const scoreTone = score >= 80 ? "good" : score >= 50 ? "warn" : "bad";

  return (
    <div data-testid="seo-dashboard">
      <PageHeader
        title="SEO Dashboard"
        desc="Live indexing status, SEO health scores and per-app metadata."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <RippleButton onClick={load} data-testid="seo-refresh"
              className="flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#555]">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </RippleButton>
            <RippleButton onClick={bulkFix} disabled={bulkBusy} data-testid="seo-bulk-fix"
              className="flex items-center gap-1.5 rounded-full bg-[#111] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60">
              {bulkBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
              Auto-fix All Missing
            </RippleButton>
          </div>
        }
      />

      {/* Overview grid */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat testId="stat-seo-score" label="SEO Score" value={`${score}%`} tone={scoreTone} />
        <Stat testId="stat-total-apps" label="Total Apps" value={overview?.total_apps ?? 0} />
        <Stat testId="stat-indexed" label="Indexable" value={overview?.indexed ?? 0} tone="good" />
        <Stat testId="stat-noindex" label="Noindex" value={overview?.noindex ?? 0} tone={overview?.noindex ? "warn" : "default"} />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Missing Title" value={overview?.missing_title ?? 0} tone={overview?.missing_title ? "warn" : "good"} />
        <Stat label="Missing Description" value={overview?.missing_description ?? 0} tone={overview?.missing_description ? "warn" : "good"} />
        <Stat label="Missing Keywords" value={overview?.missing_keywords ?? 0} tone={overview?.missing_keywords ? "warn" : "good"} />
        <Stat label="Missing Icon" value={overview?.missing_icon ?? 0} tone={overview?.missing_icon ? "bad" : "good"} />
      </div>

      {/* Sitemap & Robots quick access */}
      <Card className="mb-4 space-y-3">
        <h3 className="flex items-center gap-2 font-display text-sm font-bold text-[#111]">
          <FileText className="h-4 w-4 text-[#FFC107]" /> Sitemap &amp; Robots
        </h3>
        <div className="flex flex-wrap gap-2">
          <RippleButton onClick={openSitemap} data-testid="open-sitemap"
            className="flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#555]">
            <ExternalLink className="h-3.5 w-3.5" /> View sitemap.xml
          </RippleButton>
          <RippleButton onClick={openRobots} data-testid="open-robots"
            className="flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#555]">
            <ExternalLink className="h-3.5 w-3.5" /> View robots.txt
          </RippleButton>
          <RippleButton onClick={openSearchConsole} data-testid="open-search-console"
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#4285F4] to-[#0F9D58] px-3 py-2 text-xs font-semibold text-white">
            <Globe2 className="h-3.5 w-3.5" /> Google Search Console
          </RippleButton>
          <RippleButton onClick={load} data-testid="regenerate-sitemap"
            className="flex items-center gap-1.5 rounded-full bg-[#FFC107] px-3 py-2 text-xs font-semibold text-[#111]">
            <RefreshCw className="h-3.5 w-3.5" /> Regenerate Sitemap
          </RippleButton>
        </div>
        <p className="text-[11px] leading-relaxed text-[#666]">
          Sitemap auto-updates whenever an app is added / edited / deleted. Every indexable app is included with image tags and lastmod. Robots.txt disallows only <code>/admin</code>.
        </p>
      </Card>

      {/* Duplicate slugs warning */}
      {overview?.duplicate_slugs?.length > 0 && (
        <Card className="mb-4 border-[#FECACA] bg-[#FEF2F2]">
          <h3 className="flex items-center gap-2 font-display text-sm font-bold text-[#991B1B]">
            <AlertCircle className="h-4 w-4" /> Duplicate slugs detected
          </h3>
          <p className="mt-1 text-xs text-[#7F1D1D]">
            Fix these to avoid duplicate content: {overview.duplicate_slugs.join(", ")}
          </p>
        </Card>
      )}

      {/* Per-app SEO table */}
      <Card className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="flex items-center gap-2 font-display text-sm font-bold text-[#111]">
            <Sparkles className="h-4 w-4 text-[#FFC107]" /> Per-App SEO Status
          </h3>
          <span className="text-xs text-[#999]">({filtered.length})</span>
          <div className="ml-auto relative w-full max-w-[240px]">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#999]" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search apps..." data-testid="seo-search"
              className="h-8 rounded-full pl-8 text-xs" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="border-b border-[#E5E7EB] text-[10px] uppercase text-[#777]">
              <tr>
                <th className="py-2 pr-2">App</th>
                <th className="py-2 pr-2">Slug</th>
                <th className="py-2 pr-2">SEO Score</th>
                <th className="py-2 pr-2">Status</th>
                <th className="py-2 pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F2F4]">
              {filtered.map((a) => (
                <tr key={a.id} data-testid={`seo-row-${a.id}`}>
                  <td className="py-2 pr-2 font-semibold text-[#111]">{a.name}</td>
                  <td className="py-2 pr-2 text-[#555]">
                    <code className="rounded bg-[#F1F2F4] px-1.5 py-0.5">{a.slug || "—"}</code>
                  </td>
                  <td className="py-2 pr-2">
                    <div className="flex items-center gap-1">
                      <span className={`font-bold ${a.score >= 80 ? "text-[#065F46]" : a.score >= 50 ? "text-[#92400E]" : "text-[#991B1B]"}`}>
                        {a.score}%
                      </span>
                    </div>
                  </td>
                  <td className="py-2 pr-2">
                    {a.noindex || a.hidden ? (
                      <span className="rounded-full bg-[#FEF2F2] px-2 py-0.5 text-[10px] font-semibold text-[#991B1B]">Noindex</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#F0FDF4] px-2 py-0.5 text-[10px] font-semibold text-[#065F46]">
                        <CheckCircle2 className="h-3 w-3" /> Indexable
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => autoGenerate(a.id)}
                        disabled={busy === a.id}
                        data-testid={`seo-generate-${a.id}`}
                        className="flex items-center gap-1 rounded-full border border-[#FFE082] bg-[#FFFBEB] px-2 py-1 text-[10px] font-semibold text-[#92400E] disabled:opacity-50"
                      >
                        {busy === a.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bot className="h-3 w-3" />}
                        Auto-Fill
                      </button>
                      <a
                        href={`/${a.slug || a.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-white px-2 py-1 text-[10px] font-semibold text-[#555]"
                      >
                        <ExternalLink className="h-3 w-3" /> View
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
