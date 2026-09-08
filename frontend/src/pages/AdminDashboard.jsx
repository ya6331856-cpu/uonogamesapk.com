import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  LayoutDashboard, Download, Package, Star, MessageSquare, HelpCircle,
  Tag, FileText, Award, RefreshCw, Loader2
} from "lucide-react";
import api from "@/lib/api";
import { PageHeader, Card } from "@/components/admin/adminUI";
import RippleButton from "@/components/RippleButton";

class SafeBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="p-6 m-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
          <h3 className="font-bold mb-2">Dashboard Component Crashed</h3>
          <p className="text-xs font-mono break-all">{String(this.state.error.message)}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const safeStr = (val) => typeof val === 'object' ? JSON.stringify(val) : String(val || "");

const StatCard = ({ label, value, icon: Icon, tone = "default" }) => {
  const toneMap = {
    default: "border-[#E5E7EB] bg-white text-[#111]",
    good: "border-[#BBF7D0] bg-[#F0FDF4] text-[#065F46]",
  };
  return (
    <div className={`rounded-[16px] border p-4 shadow-[0_6px_20px_rgba(0,0,0,0.03)] ${toneMap[tone] || toneMap.default}`}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
        {Icon && <Icon className="h-4 w-4 opacity-60" />}
      </div>
      <p className="mt-2 font-display text-2xl font-bold">{safeStr(value)}</p>
    </div>
  );
};

function DashboardInner() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/analytics");
      setStats(res?.data || {});
    } catch (e) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#FFC107]" />
      </div>
    );
  }

  const topApps = Array.isArray(stats?.top_apps) ? stats.top_apps : [];
  const categories = stats?.by_category && typeof stats.by_category === 'object' ? stats.by_category : {};

  return (
    <div data-testid="admin-dashboard">
      <PageHeader
        title="Dashboard"
        desc="Overview of your store performance, downloads and content."
        action={
          <RippleButton onClick={load} className="flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#555]">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </RippleButton>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Apps" value={stats?.total_apps || 0} icon={Package} tone="good" />
        <StatCard label="Downloads" value={stats?.total_downloads || 0} icon={Download} />
        <StatCard label="Reviews" value={stats?.total_reviews || 0} icon={Star} />
        <StatCard label="Blog Posts" value={stats?.total_blog || 0} icon={FileText} />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="FAQs" value={stats?.total_faqs || 0} icon={HelpCircle} />
        <StatCard label="Redeem Codes" value={stats?.total_codes || 0} icon={Tag} />
        <StatCard label="Winners" value={stats?.total_winners || 0} icon={Award} />
        <StatCard label="Categories" value={Object.keys(categories).length} icon={LayoutDashboard} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="space-y-3">
          <h3 className="font-display text-sm font-bold text-[#111]">Top Downloaded Apps</h3>
          {topApps.length === 0 ? (
            <p className="text-xs text-[#777] py-4">No data available</p>
          ) : (
            <div className="divide-y divide-[#F1F2F4]">
              {topApps.map((app, index) => (
                <div key={index} className="flex items-center justify-between py-2.5 text-xs">
                  <span className="font-semibold text-[#111]">{safeStr(app?.name)}</span>
                  <span className="rounded-full bg-[#F0FDF4] px-2.5 py-0.5 font-semibold text-[#065F46]">
                    {Number(app?.downloads || 0).toLocaleString()} downloads
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-3">
          <h3 className="font-display text-sm font-bold text-[#111]">Downloads by Category</h3>
          {Object.keys(categories).length === 0 ? (
            <p className="text-xs text-[#777] py-4">No category data available</p>
          ) : (
            <div className="divide-y divide-[#F1F2F4]">
              {Object.entries(categories).map(([cat, count], index) => (
                <div key={index} className="flex items-center justify-between py-2.5 text-xs">
                  <span className="font-semibold text-[#111]">{safeStr(cat)}</span>
                  <span className="rounded-full bg-[#F1F2F4] px-2.5 py-0.5 font-semibold text-[#555]">
                    {Number(count || 0).toLocaleString()} downloads
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return <SafeBoundary><DashboardInner /></SafeBoundary>;
}
