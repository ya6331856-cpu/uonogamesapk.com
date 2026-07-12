import { useEffect, useState } from "react";
import { Loader2, Download, Package, Star, MessageSquare, Ticket, TrendingUp } from "lucide-react";
import api from "@/lib/api";
import { formatFull } from "@/lib/format";

export default function AdminAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/admin/analytics").then((r) => setData(r.data)).catch(() => setData({}));
  }, []);

  if (!data) return <div className="py-16 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-[#FFC107]" /></div>;

  const cards = [
    { icon: Download, label: "Total Downloads", value: formatFull(data.total_downloads), color: "#FFC107" },
    { icon: Package, label: "Total Apps", value: data.total_apps, color: "#229ED9" },
    { icon: MessageSquare, label: "Reviews", value: data.total_reviews, color: "#22C55E" },
    { icon: Ticket, label: "Redeem Codes", value: data.total_codes, color: "#EC4899" },
  ];

  const maxCat = Math.max(1, ...Object.values(data.by_category || {}));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5">
        {cards.map((c) => (
          <div key={c.label} data-testid={`analytics-${c.label}`} className="rounded-[18px] border border-[#E5E7EB] bg-white p-3.5 shadow-[0_6px_20px_rgba(0,0,0,0.03)]">
            <c.icon className="h-4 w-4" style={{ color: c.color }} />
            <p className="mt-1.5 font-display text-lg font-bold text-[#111111]">{c.value}</p>
            <p className="text-[11px] text-[#777777]">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.03)]">
        <h3 className="mb-3 flex items-center gap-1.5 font-display text-sm font-bold text-[#111111]"><TrendingUp className="h-4 w-4 text-[#FFC107]" /> Downloads by Category</h3>
        <div className="space-y-2">
          {Object.entries(data.by_category || {}).map(([cat, val]) => (
            <div key={cat}>
              <div className="flex justify-between text-xs text-[#555555]"><span>{cat}</span><span className="font-semibold">{formatFull(val)}</span></div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#F1F2F4]">
                <div className="h-full rounded-full bg-gradient-to-r from-[#FFC107] to-[#FFB300]" style={{ width: `${(val / maxCat) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.03)]">
        <h3 className="mb-3 flex items-center gap-1.5 font-display text-sm font-bold text-[#111111]"><Star className="h-4 w-4 text-[#FFC107]" /> Top Apps</h3>
        <div className="space-y-2">
          {(data.top_apps || []).map((a, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-[#111111]">{i + 1}. {a.name}</span>
              <span className="font-semibold text-[#777777]">{formatFull(a.downloads)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
