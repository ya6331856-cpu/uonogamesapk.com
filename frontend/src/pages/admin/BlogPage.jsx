import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { PageHeader, Card, Spinner } from "@/components/admin/adminUI";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import RippleButton from "@/components/RippleButton";

const EMPTY = { title: "", slug: "", excerpt: "", content: "", cover_url: "", published: true };

export default function BlogPage() {
  const [items, setItems] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => setItems((await api.get("/admin/blog")).data);
  useEffect(() => { fetchItems(); }, []);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const save = async () => {
    if (!form.title.trim()) { toast.error("Title required"); return; }
    setSaving(true);
    try {
      if (editingId) await api.put(`/admin/blog/${editingId}`, form);
      else await api.post("/admin/blog", form);
      toast.success("Saved"); setOpen(false); fetchItems();
    } catch { toast.error("Failed"); } finally { setSaving(false); }
  };
  const remove = async (id) => { await api.delete(`/admin/blog/${id}`); toast.success("Deleted"); fetchItems(); };

  if (!items) return <Spinner />;
  return (
    <div>
      <PageHeader title="Blog" desc="Write posts and news articles for your audience."
        action={<RippleButton onClick={() => { setForm(EMPTY); setEditingId(null); setOpen(true); }} data-testid="add-blog-btn" className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FFC107] to-[#FFB300] px-5 py-2.5 text-sm font-bold text-[#111111] shadow-[0_8px_20px_rgba(255,193,7,0.45)]"><Plus className="h-4 w-4" /> New Post</RippleButton>} />
      {items.length === 0 ? (
        <Card className="text-center"><FileText className="mx-auto h-8 w-8 text-[#CCCCCC]" /><p className="mt-2 text-sm text-[#777777]">No posts yet.</p></Card>
      ) : (
        <div className="space-y-3">
          {items.map((b) => (
            <Card key={b.id} data-testid={`admin-blog-${b.id}`} className="!p-3">
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-semibold text-[#111111]">{b.title}</p>
                  <p className="truncate text-[11px] text-[#777777]">/{b.slug} • {b.published ? "Published" : "Draft"}</p>
                </div>
                <button onClick={() => { setForm({ ...EMPTY, ...b }); setEditingId(b.id); setOpen(true); }} data-testid={`edit-blog-${b.id}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8F9FA] text-[#555555]"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => remove(b.id)} data-testid={`delete-blog-${b.id}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8F9FA] text-[#555555] hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-[460px] overflow-y-auto rounded-[22px]">
          <DialogHeader><DialogTitle>{editingId ? "Edit Post" : "New Post"}</DialogTitle><DialogDescription className="text-xs text-[#777777]">Slug auto-generates from the title if left empty.</DialogDescription></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1"><Label className="text-xs font-semibold">Title</Label><Input data-testid="blog-title" value={form.title} onChange={(e) => setField("title", e.target.value)} className="rounded-xl" /></div>
            <div className="space-y-1"><Label className="text-xs font-semibold">Slug</Label><Input data-testid="blog-slug" value={form.slug} onChange={(e) => setField("slug", e.target.value)} placeholder="auto" className="rounded-xl text-xs" /></div>
            <div className="space-y-1"><Label className="text-xs font-semibold">Cover Image URL</Label><Input value={form.cover_url} onChange={(e) => setField("cover_url", e.target.value)} className="rounded-xl text-xs" /></div>
            <div className="space-y-1"><Label className="text-xs font-semibold">Excerpt</Label><Textarea data-testid="blog-excerpt" value={form.excerpt} onChange={(e) => setField("excerpt", e.target.value)} rows={2} className="rounded-xl" /></div>
            <div className="space-y-1"><Label className="text-xs font-semibold">Content</Label><Textarea data-testid="blog-content" value={form.content} onChange={(e) => setField("content", e.target.value)} rows={6} className="rounded-xl" /></div>
            <div className="flex items-center justify-between rounded-xl bg-[#F8F9FA] px-3 py-2.5"><Label className="text-xs font-semibold">Published</Label><Switch data-testid="blog-published" checked={form.published} onCheckedChange={(v) => setField("published", v)} /></div>
          </div>
          <DialogFooter className="flex-row gap-2">
            <button onClick={() => setOpen(false)} className="flex-1 rounded-full border border-[#E5E7EB] py-2.5 text-sm font-medium text-[#555555]">Cancel</button>
            <RippleButton onClick={save} disabled={saving} data-testid="save-blog-btn" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#FFC107] py-2.5 text-sm font-bold text-[#111111] disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{editingId ? "Update" : "Publish"}</RippleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
