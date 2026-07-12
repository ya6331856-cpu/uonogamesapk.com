import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Ticket } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import RippleButton from "@/components/RippleButton";

const EMPTY = { code: "", reward: "", expiry: "", usage_limit: 0, active: true };

export default function AdminCodes() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    try { setItems((await api.get("/admin/codes")).data); } finally { setLoading(false); }
  };
  useEffect(() => { fetchItems(); }, []);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const save = async () => {
    if (!form.code.trim()) { toast.error("Code required"); return; }
    setSaving(true);
    try {
      const payload = { ...form, usage_limit: parseInt(form.usage_limit) || 0 };
      if (editingId) await api.put(`/admin/codes/${editingId}`, payload);
      else await api.post("/admin/codes", payload);
      toast.success("Saved"); setOpen(false); fetchItems();
    } catch { toast.error("Failed"); } finally { setSaving(false); }
  };
  const remove = async (id) => { await api.delete(`/admin/codes/${id}`); toast.success("Deleted"); fetchItems(); };

  return (
    <div className="space-y-3">
      <RippleButton onClick={() => { setForm(EMPTY); setEditingId(null); setOpen(true); }} data-testid="add-code-btn" className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FFC107] to-[#FFB300] py-3 text-sm font-bold text-[#111111] shadow-[0_8px_20px_rgba(255,193,7,0.45)]">
        <Plus className="h-4 w-4" /> Create Redeem Code
      </RippleButton>
      {loading ? <div className="py-16 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-[#FFC107]" /></div> : (
        items.map((c) => (
          <div key={c.id} data-testid={`admin-code-${c.id}`} className="flex items-center gap-3 rounded-[18px] border border-[#E5E7EB] bg-white p-3 shadow-[0_6px_20px_rgba(0,0,0,0.03)]">
            <Ticket className="h-5 w-5 text-[#FFB300]" />
            <div className="flex-1">
              <p className="font-display text-sm font-bold tracking-wide text-[#111111]">{c.code}</p>
              <p className="text-[11px] text-[#777777]">{c.reward} • used {c.used_count || 0}{c.usage_limit ? `/${c.usage_limit}` : ""}{c.expiry ? ` • exp ${c.expiry}` : ""}</p>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.active ? "bg-[#F0FDF4] text-[#22C55E]" : "bg-[#FEF2F2] text-red-500"}`}>{c.active ? "Active" : "Off"}</span>
            <button onClick={() => { setForm({ ...EMPTY, ...c }); setEditingId(c.id); setOpen(true); }} data-testid={`edit-code-${c.id}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8F9FA] text-[#555555]"><Pencil className="h-3.5 w-3.5" /></button>
            <button onClick={() => remove(c.id)} data-testid={`delete-code-${c.id}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8F9FA] text-[#555555] hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[440px] rounded-[22px]">
          <DialogHeader><DialogTitle>{editingId ? "Edit Code" : "Create Code"}</DialogTitle><DialogDescription className="text-xs text-[#777777]">Users redeem this on the storefront.</DialogDescription></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1"><Label className="text-xs font-semibold">Code</Label><Input data-testid="code-code" value={form.code} onChange={(e) => setField("code", e.target.value.toUpperCase())} placeholder="WELCOME100" className="rounded-xl uppercase" /></div>
            <div className="space-y-1"><Label className="text-xs font-semibold">Reward</Label><Input data-testid="code-reward" value={form.reward} onChange={(e) => setField("reward", e.target.value)} placeholder="₹100 bonus" className="rounded-xl" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs font-semibold">Expiry (YYYY-MM-DD)</Label><Input data-testid="code-expiry" value={form.expiry} onChange={(e) => setField("expiry", e.target.value)} placeholder="2026-12-31" className="rounded-xl" /></div>
              <div className="space-y-1"><Label className="text-xs font-semibold">Usage Limit (0=∞)</Label><Input data-testid="code-limit" type="number" value={form.usage_limit} onChange={(e) => setField("usage_limit", e.target.value)} className="rounded-xl" /></div>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[#F8F9FA] px-3 py-2.5"><Label className="text-xs font-semibold">Active</Label><Switch data-testid="code-active" checked={form.active} onCheckedChange={(v) => setField("active", v)} /></div>
          </div>
          <DialogFooter className="flex-row gap-2">
            <button onClick={() => setOpen(false)} className="flex-1 rounded-full border border-[#E5E7EB] py-2.5 text-sm font-medium text-[#555555]">Cancel</button>
            <RippleButton onClick={save} disabled={saving} data-testid="save-code-btn" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#FFC107] py-2.5 text-sm font-bold text-[#111111] disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{editingId ? "Update" : "Create"}</RippleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
