import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import RippleButton from "@/components/RippleButton";

export default function AdminFaqs() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ question: "", answer: "" });
  const [saving, setSaving] = useState(false);

  const fetchFaqs = async () => {
    try {
      const { data } = await api.get("/faqs");
      setFaqs(data);
    } catch (e) {
      toast.error("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const openNew = () => {
    setForm({ question: "", answer: "" });
    setEditingId(null);
    setDialogOpen(true);
  };
  const openEdit = (f) => {
    setForm({ question: f.question, answer: f.answer });
    setEditingId(f.id);
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error("Question and answer are required");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/admin/faqs/${editingId}`, form);
        toast.success("FAQ updated");
      } else {
        await api.post("/admin/faqs", form);
        toast.success("FAQ added");
      }
      setDialogOpen(false);
      fetchFaqs();
    } catch (e) {
      toast.error("Failed to save FAQ");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/admin/faqs/${id}`);
      toast.success("FAQ deleted");
      fetchFaqs();
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  const move = async (index, dir) => {
    const next = index + dir;
    if (next < 0 || next >= faqs.length) return;
    const reordered = [...faqs];
    [reordered[index], reordered[next]] = [reordered[next], reordered[index]];
    setFaqs(reordered);
    try {
      await api.put("/admin/faqs/reorder", { ids: reordered.map((f) => f.id) });
    } catch (e) {
      toast.error("Failed to reorder");
      fetchFaqs();
    }
  };

  return (
    <div className="space-y-3">
      <RippleButton
        onClick={openNew}
        data-testid="add-faq-btn"
        className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FFC107] to-[#FFB300] py-3 text-sm font-bold text-[#111111] shadow-[0_8px_20px_rgba(255,193,7,0.45)]"
      >
        <Plus className="h-4 w-4" /> Add FAQ
      </RippleButton>

      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#FFC107]" />
        </div>
      ) : (
        faqs.map((f, i) => (
          <motion.div
            key={f.id}
            layout
            data-testid={`admin-faq-${f.id}`}
            className="rounded-[18px] border border-[#E5E7EB] bg-white p-3 shadow-[0_6px_20px_rgba(0,0,0,0.03)]"
          >
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold text-[#111111]">{f.question}</p>
                <p className="mt-1 line-clamp-2 text-xs text-[#777777]">{f.answer}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <button onClick={() => move(i, -1)} data-testid={`faq-up-${f.id}`} disabled={i === 0} className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F8F9FA] text-[#555555] disabled:opacity-30">
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => move(i, 1)} data-testid={`faq-down-${f.id}`} disabled={i === faqs.length - 1} className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F8F9FA] text-[#555555] disabled:opacity-30">
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <button onClick={() => openEdit(f)} data-testid={`edit-faq-${f.id}`} className="flex items-center gap-1 rounded-full bg-[#F8F9FA] px-3 py-1.5 text-xs font-medium text-[#555555] hover:bg-[#FFF8E1] hover:text-[#FFB300]">
                <Pencil className="h-3 w-3" /> Edit
              </button>
              <button onClick={() => remove(f.id)} data-testid={`delete-faq-${f.id}`} className="flex items-center gap-1 rounded-full bg-[#F8F9FA] px-3 py-1.5 text-xs font-medium text-[#555555] hover:bg-red-50 hover:text-red-500">
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </div>
          </motion.div>
        ))
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[440px] rounded-[22px]">
          <DialogHeader>
            <DialogTitle className="font-display text-[#111111]">{editingId ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
            <DialogDescription className="text-xs text-[#777777]">Write a clear question and a complete answer.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#555555]">Question</Label>
              <Input data-testid="faq-question" value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#555555]">Answer</Label>
              <Textarea data-testid="faq-answer" rows={5} value={form.answer} onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))} className="rounded-xl" />
            </div>
          </div>
          <DialogFooter className="flex-row gap-2">
            <button onClick={() => setDialogOpen(false)} className="flex-1 rounded-full border border-[#E5E7EB] py-2.5 text-sm font-medium text-[#555555]">Cancel</button>
            <RippleButton onClick={save} disabled={saving} data-testid="save-faq-btn" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#FFC107] py-2.5 text-sm font-bold text-[#111111] shadow-[0_6px_16px_rgba(255,193,7,0.4)] disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editingId ? "Update" : "Add"}
            </RippleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
