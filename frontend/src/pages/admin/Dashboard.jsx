import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Download, Package, MessageSquare, Ticket, TrendingUp, Star, Plus,
  HelpCircle, Trophy, ArrowUpRight, Clock,
} from "lucide-react";
import api, { resolveUrl } from "../../lib/api";
import { formatFull, formatCount } from "../../lib/format";
import { Card, Spinner } from "../../components/admin/adminUI";

const CHART_COLORS = ["#FFC107", "#FFB300", "#22C55E", "#229ED9", "#EC4899", "#8B5CF6"];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api.get("/admin/analytics").then((r) => setData(r.data)).catch(() => setData({}));
    api.get("/apps", { params: { include_hidden: true } }).then((r) => {
      const all = [...r.data.featured, ...r.data.apps].sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
      setRecent(all.slice(0, 5));
    }).catch(() => {});
  }, []);

  if (!data) return <Spinner />;

  const cards = [
    { icon: Download, label: "Total Downloads", value: formatFull(data.total_downloads), color: "#FFC107", bg: "#FFF8E1" },
    { icon: Package, label: "Total Apps", value: data.total_apps, color: "#229ED9", bg: "#E8F6FD" },
    { icon: MessageSquare, label: "Reviews", value: data.total_reviews, color: "#22C55E", bg: "#F0FDF4" },
    { icon: Ticket, label: "Redeem Codes", value: data.total_codes, color: "#EC4899", bg: "#FDF2F8" },
  ];
  const chartData = Object.entries(data.by_category || {}).map(([name, value]) => ({ name, value }));
  const quick = [
    { to: "/admin/apks", label: "Add App", icon: Plus },
    { to: "/admin/faq", label: "Add FAQ", icon: HelpCircle },
    { to: "/admin/live-winners", label: "Add Winner", icon: Trophy },
    { to: "/admin/redeem-codes", label: "New Code", icon: Ticket },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#111111]">Dashboard</h1>
          <p className="mt-1 text-sm text-[#777777]">Welcome back — here&apos;s your store at a glance.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="!p-4">
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px]" style={{ backgroundColor: c.bg }}><c.icon className="h-4 w-4" style={{ color: c.color }} /></span>
              <ArrowUpRight className="h-4 w-4 text-[#22C55E]" />
            </div>
            <p className="mt-3 font-display text-2xl font-bold text-[#111111]">{c.value}</p>
            <p className="text-xs text-[#777777]">{c.label}</p>
          </Card>
        ))}
      </div>

      {/* Chart + quick actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="mb-4 flex items-center gap-1.5 font-display text-sm font-bold text-[#111111]"><TrendingUp className="h-4 w-4 text-[#FFC107]" /> Downloads by Category</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: -18 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#777" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#999" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCount(v)} />
                <Tooltip cursor={{ fill: "#F8F9FA" }} formatter={(v) => formatFull(v)} contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 font-display text-sm font-bold text-[#111111]">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {quick.map((q) => (
              <Link key={q.to} to={q.to} data-testid={`quick-${q.label.replace(/\s+/g, "-").toLowerCase()}`}
                className="flex flex-col items-center gap-2 rounded-[14px] border border-[#E5E7EB] bg-[#F8F9FA] py-4 text-center transition-colors hover:border-[#FFC107] hover:bg-[#FFF8E1]">
                <q.icon className="h-5 w-5 text-[#FFB300]" />
                <span className="text-xs font-semibold text-[#111111]">{q.label}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Top apps + recent */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 flex items-center gap-1.5 font-display text-sm font-bold text-[#111111]"><Star className="h-4 w-4 text-[#FFC107]" /> Top Apps</h3>
          <div className="space-y-2.5">
            {(data.top_apps || []).map((a, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-[#111111]"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFF8E1] text-xs font-bold text-[#FFB300]">{i + 1}</span>{a.name}</span>
                <span className="font-semibold text-[#777777]">{formatFull(a.downloads)}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 flex items-center gap-1.5 font-display text-sm font-bold text-[#111111]"><Clock className="h-4 w-4 text-[#FFC107]" /> Recently Added</h3>
          <div className="space-y-2.5">
            {recent.map((a) => (
              <div key={a.id} className="flex items-center gap-2.5">
                {a.icon_url ? <img src={resolveUrl(a.icon_url)} alt="" className="h-8 w-8 rounded-[8px] object-cover" /> : <div className="h-8 w-8 rounded-[8px] bg-[#FFF8E1]" />}
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-[#111111]">{a.name}</p><p className="text-[11px] text-[#999999]">{(a.created_at || "").slice(0, 10)} • {formatCount(a.downloads)} dl</p></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
