import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Search, Sparkles, RefreshCw, AlertCircle, ExternalLink,
  Loader2, FileText, Bot, Wrench
} from "lucide-react";
import api, { API } from "@/lib/api";
import { PageHeader, Card } from "@/components/admin/adminUI";
import RippleButton from "@/components/RippleButton";
import { Input } from "@/components/ui/input";

const IconCheck = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="M20 6 9 17l-5-5"/></svg>;
const IconGlobe = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>;
const IconWand = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8l1.4 1.4"/><path d="M10.8 4.8l1.4 1.4"/><path d="M10.8 13.2l1.4-1.4"/><path d="M17.8 6.2l1.4-1.4"/><path d="M3 21l9-9"/><path d="M12.2 6.2l-1.4 1.4"/></svg>;
const IconImage = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-[#FFC107]"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>;

class SafeBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="p-6 m-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
          <h3 className="font-bold mb-2">Component Crashed (Bad Data)</h3>
          <p className="text-xs font-mono break-all">{String(this.state.error.message)}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const safeStr = (val) => typeof val === 'object' ? JSON.stringify(val) : String(val || "");

const Stat = ({ label, value, tone = "default" }) => {
  const toneMap = {
    default: "border-[#E5E7EB] bg-white",
    good: "border-[#BBF7D0] bg-[#F0FDF4] text-[#065F46]",
    warn: "border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]",
    bad: "border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]",
  };
  return (
    <div className={`rounded-[16px] border p-4 shadow-[0_6px_20px_rgba(0,0,0,0.03)] ${toneMap[tone] || toneMap.default}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{safeStr(value)}</p>
    </div>
  );
};

function SeoDashboardInner() {
  const [overview, setOverview] = useState({});
  const [apps, setApps] = useState([]);
  const [audit, setAudit] = useState({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [auditBusy, setAuditBusy] = useState(false);
  const [repairBusy, setRepairBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [o, a, m] = await Promise.allSettled([
        api.get("/admin/seo/overview"),
        api.get("/admin/seo/apps"),
        api.get("/admin/media/audit"),
      ]);
      setOverview(o.status === "fulfilled" && o.value?.data ? o.value.data : {});
      setApps(a.status === "fulfilled" && Array.isArray(a.value?.data) ? a.value.data : []);
      setAudit(m.status === "fulfilled" && m.value?.data ? m.value.data : {});
    } catch (e) {
      toast.error("Failed to load SEO data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const autoGenerate = async (id) => {
    if (!id) return;
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
      toast.success(`Fixed ${res?.data?.fixed || 0} apps`);
      await load();
    } catch {
      toast.error("Bulk fix failed");
    } finally {
      setBulkBusy(false);
    }
  };

  const runAudit = async () => {
    setAuditBusy(true);
    try {
      const res = await api.get("/admin/media/audit");
      setAudit(res?.data || {});
      toast.success("Audit complete");
    } catch {
      toast.error("Audit failed");
    } finally {
      setAuditBusy(false);
    }
  };

  const runRepair = async () => {
    setRepairBusy(true);
    try {
      const res = await api.post("/admin/media/repair");
      toast.success(`Cleared ${res?.data?.cleared || 0} references`);
      await load();
    } catch {
      toast.error("Repair failed");
    } finally {
      setRepairBusy(false);
    }
  };

  const safeApps = Array.isArray(apps) ? apps : [];
  const filtered = safeApps.filter((a) => {
    if (!a || typeof a !== 'object') return false;
    const q = (query || "").trim().toLowerCase();
    if (!q) return true;
    return String(a.name || "").toLowerCase().includes(q) || String(a.slug || "").toLowerCase().includes(q);
  });

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-[#FFC107]" />
    </div>
  );

  const score = Number(overview?.seo_score) || 0;
  const duplicateSlugs = Array.isArray(overview?.duplicate_slugs) ? overview.duplicate_slugs : [];
  const brokenMedia = Array.isArray(audit?.broken) ? audit.broken : [];

  return (
    <div>
      <PageHeader title="SEO Dashboard" desc="Live indexing status and SEO health."
        action={
          <div className="flex gap-2">
            <RippleButton onClick={load} className="flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#555]">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </RippleButton>
            <RippleButton onClick={bulkFix} disabled={bulkBusy} className="flex items-center gap-1.5 rounded-full bg-[#111] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60">
              {bulkBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <IconWand />}
              Auto-fix All
            </RippleButton>
          </div>
        }
      />
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="SEO Score" value={`${score}%`} tone={score >= 80 ? "good" : score >= 50 ? "warn" : "bad"} />
        <Stat label="Total Apps" value={overview?.total_apps || 0} />
        <Stat label="Indexable" value={overview?.indexed || 0} tone="good" />
        <Stat label="Noindex" value={overview?.noindex || 0} tone={overview?.noindex ? "warn" : "default"} />
      </div>
      <Card className="mb-4 space-y-3">
        <h3 className="flex items-center gap-2 font-display text-sm font-bold text-[#111]">
          <FileText className="h-4 w-4 text-[#FFC107]" /> Sitemap &amp; Robots
        </h3>
        <div className="flex flex-wrap gap-2">
          <RippleButton onClick={() => window.open(`${API}/sitemap.xml`, "_blank")} className="flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#555]"><ExternalLink className="h-3.5 w-3.5" /> sitemap.xml</RippleButton>
          <RippleButton onClick={() => window.open(`${API}/robots.txt`, "_blank")} className="flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#555]"><ExternalLink className="h-3.5 w-3.5" /> robots.txt</RippleButton>
          <RippleButton onClick={() => window.open("https://search.google.com/search-console", "_blank")} className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#4285F4] to-[#0F9D58] px-3 py-2 text-xs font-semibold text-white"><IconGlobe /> Search Console</RippleButton>
        </div>
      </Card>

      {duplicateSlugs.length > 0 && (
        <Card className="mb-4 border-[#FECACA] bg-[#FEF2F2]">
          <h3 className="flex items-center gap-2 font-display text-sm font-bold text-[#991B1B]"><AlertCircle className="h-4 w-4" /> Duplicate slugs</h3>
          <p className="mt-1 text-xs text-[#7F1D1D]">{duplicateSlugs.map(s => safeStr(s)).join(", ")}</p>
        </Card>
      )}

      <Card className="mb-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="flex items-center gap-2 font-display text-sm font-bold text-[#111]"><IconImage /> Media Health</h3>
          <span className="text-xs text-[#777]">Broken: <b>{audit?.broken_count || 0}</b></span>
          <div className="ml-auto flex gap-2">
            <RippleButton onClick={runAudit} disabled={auditBusy} className="flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#555] disabled:opacity-60">{auditBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} Re-audit</RippleButton>
            {(audit?.broken_count || 0) > 0 && (
              <RippleButton onClick={runRepair} disabled={repairBusy} className="flex items-center gap-1.5 rounded-full bg-[#111] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"><Wrench className="h-3.5 w-3.5" /> Repair</RippleButton>
            )}
          </div>
        </div>
        {brokenMedia.length > 0 && (
          <div className="max-h-48 overflow-y-auto rounded-lg bg-white/80 p-2 text-[11px] text-[#7F1D1D]">
            {brokenMedia.slice(0, 20).map((b, i) => (
              <div key={i} className="flex items-center gap-2"><AlertCircle className="h-3 w-3" /> {safeStr(b?.name)}</div>
            ))}
          </div>
        )}
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="flex items-center gap-2 font-display text-sm font-bold text-[#111]"><Sparkles className="h-4 w-4 text-[#FFC107]" /> Apps SEO</h3>
          <div className="ml-auto relative w-full max-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#999]" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="h-8 rounded-full pl-8 text-xs" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-xs">
            <thead className="border-b border-[#E5E7EB] text-[10px] uppercase text-[#777]">
              <tr><th className="py-2">App</th><th className="py-2">Slug</th><th className="py-2">Score</th><th className="py-2">Status</th><th className="py-2">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-[#F1F2F4]">
              {filtered.map((a, i) => (
                <tr key={a?.id || i}>
                  <td className="py-2 font-semibold text-[#111]">{safeStr(a?.name || "Unnamed")}</td>
                  <td className="py-2 text-[#555]"><code className="bg-[#F1F2F4] px-1.5 py-0.5 rounded">{safeStr(a?.slug)}</code></td>
                  <td className="py-2 font-bold">{Number(a?.score || 0)}%</td>
                  <td className="py-2">
                    {a?.noindex ? <span className="text-[#991B1B]">Noindex</span> : <span className="flex items-center gap-1 text-[#065F46]"><IconCheck /> Indexable</span>}
                  </td>
                  <td className="py-2">
                    <button onClick={() => a?.id && autoGenerate(a.id)} disabled={!a?.id || busy === a?.id} className="flex items-center gap-1 rounded-full bg-[#FFFBEB] px-2 py-1 text-[10px] font-semibold text-[#92400E] border border-[#FFE082]">
                      {busy === a?.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bot className="h-3 w-3" />} Auto
                    </button>
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

export default function SeoDashboardPage() {
  return <SafeBoundary><SeoDashboardInner /></SafeBoundary>;
}
