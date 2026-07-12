import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Trophy } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import RippleButton from "@/components/RippleButton";

const EMPTY = { name: "", amount: "", game: "" };

export default function AdminWinners() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    try { setItems((await api.get("/winners")).data); } finally { setLoading(false); }
  };
  useEffect(() => { fetchItems(); }, []);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const save = async () => {
    if (!form.name.trim()) { toast.error("Name required"); return; }
    setSaving(true);
    try {
      if (editingId) await api.put(`/admin/winners/${editingId}`, form);
      else await api.post("/admin/winners", form);
      toast.success("Saved"); setOpen(false); fetchItems();
    } catch { toast.error("Failed"); } finally { setSaving(false); }
  };
  const remove = async (id) => { await api.delete(`/admin/winners/${id}`); toast.success("Deleted"); fetchItems(); };

  return (
    <div className="space-y-3">
      <RippleButton onClick={() => { setForm(EMPTY); setEditingId(null); setOpen(true); }} data-testid="add-winner-btn" className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FFC107] to-[#FFB300] py-3 text-sm font-bold text-[#111111] shadow-[0_8px_20px_rgba(255,193,7,0.45)]">
        <Plus className="h-4 w-4" /> Add Winner
      </RippleButton>
      {loading ? <div className="py-16 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-[#FFC107]" /></div> : (
        items.map((w) => (
          <div key={w.id} data-testid={`admin-winner-${w.id}`} className="flex items-center gap-3 rounded-[18px] border border-[#E5E7EB] bg-white p-3 shadow-[0_6px_20px_rgba(0,0,0,0.03)]">
            <Trophy className="h-5 w-5 text-[#22C55E]" />
            <div className="flex-1">
              <p className="font-display text-sm font-semibold text-[#111111]">{w.name} <span className="text-[#22C55E]">{w.amount}</span></p>
              <p className="text-[11px] text-[#777777]">{w.game}</p>
            </div>
            <button onClick={() => { setForm({ ...EMPTY, ...w }); setEditingId(w.id); setOpen(true); }} data-testid={`edit-winner-${w.id}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8F9FA] text-[#555555]"><Pencil className="h-3.5 w-3.5" /></button>
            <button onClick={() => remove(w.id)} data-testid={`delete-winner-${w.id}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8F9FA] text-[#555555] hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[440px] rounded-[22px]">
          <DialogHeader><DialogTitle>{editingId ? "Edit Winner" : "Add Winner"}</DialogTitle><DialogDescription className="text-xs text-[#777777]">Shown in the live winners ticker.</DialogDescription></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1"><Label className="text-xs font-semibold">Name</Label><Input data-testid="winner-name" value={form.name} onChange={(e) => setField("name", e.target.value)} className="rounded-xl" /></div>
            <div className="space-y-1"><Label className="text-xs font-semibold">Amount</Label><Input data-testid="winner-amount" value={form.amount} onChange={(e) => setField("amount", e.target.value)} placeholder="₹12,500" className="rounded-xl" /></div>
            <div className="space-y-1"><Label className="text-xs font-semibold">Game</Label><Input data-testid="winner-game" value={form.game} onChange={(e) => setField("game", e.target.value)} placeholder="Points Rummy" className="rounded-xl" /></div>
          </div>
          <DialogFooter className="flex-row gap-2">
            <button onClick={() => setOpen(false)} className="flex-1 rounded-full border border-[#E5E7EB] py-2.5 text-sm font-medium text-[#555555]">Cancel</button>
            <RippleButton onClick={save} disabled={saving} data-testid="save-winner-btn" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#FFC107] py-2.5 text-sm font-bold text-[#111111] disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{editingId ? "Update" : "Add"}</RippleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
