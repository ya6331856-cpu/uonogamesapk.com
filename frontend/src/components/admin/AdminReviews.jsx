import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Star, Check, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import RippleButton from "@/components/RippleButton";

const EMPTY = { name: "", rating: 5, text: "", photo_url: "", approved: true };

export default function AdminReviews() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    try {
      const { data } = await api.get("/admin/reviews");
      setItems(data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchItems(); }, []);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const openNew = () => { setForm(EMPTY); setEditingId(null); setOpen(true); };
  const openEdit = (r) => { setForm({ ...EMPTY, ...r }); setEditingId(r.id); setOpen(true); };

  const save = async () => {
    if (!form.name.trim()) { toast.error("Name required"); return; }
    setSaving(true);
    try {
      const payload = { ...form, rating: parseInt(form.rating) || 5 };
      if (editingId) await api.put(`/admin/reviews/${editingId}`, payload);
      else await api.post("/admin/reviews", payload);
      toast.success("Saved");
      setOpen(false);
      fetchItems();
    } catch (e) { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  const toggleApprove = async (r) => {
    await api.put(`/admin/reviews/${r.id}`, { approved: !r.approved });
    fetchItems();
  };
  const remove = async (id) => { await api.delete(`/admin/reviews/${id}`); toast.success("Deleted"); fetchItems(); };

  return (
    <div className="space-y-3">
      <RippleButton onClick={openNew} data-testid="add-review-btn" className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FFC107] to-[#FFB300] py-3 text-sm font-bold text-[#111111] shadow-[0_8px_20px_rgba(255,193,7,0.45)]">
        <Plus className="h-4 w-4" /> Add Review
      </RippleButton>

      {loading ? <div className="py-16 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-[#FFC107]" /></div> : (
        items.map((r) => (
          <div key={r.id} data-testid={`admin-review-${r.id}`} className="rounded-[18px] border border-[#E5E7EB] bg-white p-3 shadow-[0_6px_20px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-semibold text-[#111111]">{r.name}</span>
                <span className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-[#FFC107] text-[#FFC107]" : "text-[#E5E7EB]"}`} />)}</span>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${r.approved ? "bg-[#F0FDF4] text-[#22C55E]" : "bg-[#FEF2F2] text-red-500"}`}>{r.approved ? "Approved" : "Hidden"}</span>
            </div>
            <p className="mt-1 text-xs text-[#777777]">{r.text}</p>
            <div className="mt-2 flex gap-2">
              <button onClick={() => toggleApprove(r)} data-testid={`approve-review-${r.id}`} className="flex items-center gap-1 rounded-full bg-[#F8F9FA] px-3 py-1.5 text-xs font-medium text-[#555555]">{r.approved ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}{r.approved ? "Hide" : "Approve"}</button>
              <button onClick={() => openEdit(r)} data-testid={`edit-review-${r.id}`} className="flex items-center gap-1 rounded-full bg-[#F8F9FA] px-3 py-1.5 text-xs font-medium text-[#555555]"><Pencil className="h-3 w-3" /> Edit</button>
              <button onClick={() => remove(r.id)} data-testid={`delete-review-${r.id}`} className="flex items-center gap-1 rounded-full bg-[#F8F9FA] px-3 py-1.5 text-xs font-medium text-[#555555] hover:text-red-500"><Trash2 className="h-3 w-3" /> Delete</button>
            </div>
          </div>
        ))
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[440px] rounded-[22px]">
          <DialogHeader><DialogTitle>{editingId ? "Edit Review" : "Add Review"}</DialogTitle><DialogDescription className="text-xs text-[#777777]">User testimonial shown on the storefront.</DialogDescription></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1"><Label className="text-xs font-semibold">Name</Label><Input data-testid="review-name" value={form.name} onChange={(e) => setField("name", e.target.value)} className="rounded-xl" /></div>
            <div className="space-y-1"><Label className="text-xs font-semibold">Rating (1-5)</Label><Input data-testid="review-rating" type="number" min="1" max="5" value={form.rating} onChange={(e) => setField("rating", e.target.value)} className="rounded-xl" /></div>
            <div className="space-y-1"><Label className="text-xs font-semibold">Text</Label><Textarea data-testid="review-text" rows={3} value={form.text} onChange={(e) => setField("text", e.target.value)} className="rounded-xl" /></div>
            <div className="space-y-1"><Label className="text-xs font-semibold">Photo URL (optional)</Label><Input data-testid="review-photo" value={form.photo_url} onChange={(e) => setField("photo_url", e.target.value)} className="rounded-xl text-xs" /></div>
            <div className="flex items-center justify-between rounded-xl bg-[#F8F9FA] px-3 py-2.5"><Label className="text-xs font-semibold">Approved</Label><Switch data-testid="review-approved" checked={form.approved} onCheckedChange={(v) => setField("approved", v)} /></div>
          </div>
          <DialogFooter className="flex-row gap-2">
            <button onClick={() => setOpen(false)} className="flex-1 rounded-full border border-[#E5E7EB] py-2.5 text-sm font-medium text-[#555555]">Cancel</button>
            <RippleButton onClick={save} disabled={saving} data-testid="save-review-btn" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#FFC107] py-2.5 text-sm font-bold text-[#111111] disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{editingId ? "Update" : "Add"}</RippleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
