import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, FileText, Upload, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import api, { resolveUrl } from "../../lib/api";
import { PageHeader, Card, Spinner } from "../../components/admin/adminUI";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog";
import RippleButton from "../../components/RippleButton";

const EMPTY = {
  title: "", slug: "", excerpt: "", content: "", cover_url: "", published: true,
  category: "", tags: [], author: "", scheduled_at: "",
  seo_title: "", meta_description: "", keywords: "", focus_keyword: "", og_image: "", noindex: false,
};

function CoverUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Image too large — max 15 MB");
      e.target.value = "";
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/admin/upload?kind=image", fd);
      onChange(data.url);
      toast.success("Cover image uploaded");
    } catch (err) {
      const detail = err?.response?.data?.detail || "Upload failed";
      toast.error(detail);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-[#555]">Cover Image</Label>
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative">
            <img src={resolveUrl(value)} alt="cover" className="h-14 w-14 rounded-xl object-cover ring-1 ring-black/5" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
              data-testid="clear-cover"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#F1F2F4] text-[#999]">
            <ImageIcon className="h-5 w-5" />
          </div>
        )}
        <label data-testid="blog-cover-upload" className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#E5E7EB] bg-[#F8F9FA] py-2.5 text-xs font-medium text-[#555] hover:border-[#FFC107]">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Uploading..." : value ? "Replace image" : "Upload cover"}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
      </div>
    </div>
  );
}

export default function BlogPage() {
  const [items, setItems] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all"); // all | published | draft | scheduled

  const fetchItems = async () => setItems((await api.get("/admin/blog")).data);
  useEffect(() => { fetchItems(); }, []);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title.trim()) { toast.error("Title required"); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: Array.isArray(form.tags) ? form.tags : String(form.tags || "").split(",").map(s => s.trim()).filter(Boolean),
      };
      if (editingId) await api.put(`/admin/blog/${editingId}`, payload);
      else await api.post("/admin/blog", payload);
      toast.success("Saved"); setOpen(false); fetchItems();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to save");
    } finally { setSaving(false); }
  };

  const remove = async (id) => { await api.delete(`/admin/blog/${id}`); toast.success("Deleted"); fetchItems(); };

  const statusOf = (b) => {
    if (!b.published) return { label: "Draft", tone: "gray" };
    if (b.scheduled_at) {
      const dt = new Date(b.scheduled_at);
      if (!isNaN(dt.getTime()) && dt > new Date()) return { label: "Scheduled", tone: "blue" };
    }
    return { label: "Published", tone: "green" };
  };

  const filtered = (items || []).filter((b) => {
    if (filter === "all") return true;
    const s = statusOf(b).label.toLowerCase();
    return filter === s;
  });

  if (!items) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Blog"
        desc="Write posts, tag them, schedule publishing and control SEO per post."
        action={<RippleButton onClick={() => { setForm(EMPTY); setEditingId(null); setOpen(true); }} data-testid="add-blog-btn" className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FFC107] to-[#FFB300] px-5 py-2.5 text-sm font-bold text-[#111] shadow-[0_8px_20px_rgba(255,193,7,0.45)]"><Plus className="h-4 w-4" /> New Post</RippleButton>}
      />

      {/* Filters */}
      <div className="mb-3 flex items-center gap-2 overflow-x-auto">
        {["all", "published", "scheduled", "draft"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            data-testid={`blog-filter-${f}`}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${filter === f ? "border-[#FFC107] bg-[#FFF8E1] text-[#111]" : "border-[#E5E7EB] bg-white text-[#555]"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="text-center">
          <FileText className="mx-auto h-8 w-8 text-[#CCC]" />
          <p className="mt-2 text-sm text-[#777]">No posts found.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => {
            const st = statusOf(b);
            const toneCls = {
              green: "bg-[#F0FDF4] text-[#065F46]",
              gray: "bg-[#F1F2F4] text-[#555]",
              blue: "bg-[#EFF6FF] text-[#1D4ED8]",
            }[st.tone];
            return (
              <Card key={b.id} data-testid={`admin-blog-${b.id}`} className="!p-3">
                <div className="flex items-center gap-3">
                  {b.cover_url ? (
                    <img src={resolveUrl(b.cover_url)} alt="" className="h-12 w-12 rounded-lg object-cover ring-1 ring-black/5" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F1F2F4] text-[#999]">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-semibold text-[#111]">{b.title}</p>
                    <div className="flex items-center gap-2 text-[11px] text-[#777]">
                      <span>/{b.slug}</span>
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${toneCls}`}>{st.label}</span>
                      {b.category && <span className="rounded-full bg-[#F1F2F4] px-1.5 py-0.5">{b.category}</span>}
                    </div>
                  </div>
                  <button onClick={() => { setForm({ ...EMPTY, ...b, tags: b.tags || [] }); setEditingId(b.id); setOpen(true); }} data-testid={`edit-blog-${b.id}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8F9FA] text-[#555]"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => remove(b.id)} data-testid={`delete-blog-${b.id}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8F9FA] text-[#555] hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-[520px] overflow-y-auto rounded-[22px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Post" : "New Post"}</DialogTitle>
            <DialogDescription className="text-xs text-[#777]">Slug auto-generates from the title if left empty.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1"><Label className="text-xs font-semibold">Title</Label><Input data-testid="blog-title" value={form.title} onChange={(e) => setField("title", e.target.value)} className="rounded-xl" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs font-semibold">Slug</Label><Input data-testid="blog-slug" value={form.slug} onChange={(e) => setField("slug", e.target.value)} placeholder="auto" className="rounded-xl text-xs" /></div>
              <div className="space-y-1"><Label className="text-xs font-semibold">Author</Label><Input data-testid="blog-author" value={form.author} onChange={(e) => setField("author", e.target.value)} placeholder="Team Uonogamesapk" className="rounded-xl text-xs" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs font-semibold">Category</Label><Input data-testid="blog-category" value={form.category} onChange={(e) => setField("category", e.target.value)} placeholder="News, Tips, Guide..." className="rounded-xl text-xs" /></div>
              <div className="space-y-1"><Label className="text-xs font-semibold">Tags (comma sep)</Label><Input data-testid="blog-tags" value={Array.isArray(form.tags) ? form.tags.join(", ") : form.tags} onChange={(e) => setField("tags", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} placeholder="rummy, updates" className="rounded-xl text-xs" /></div>
            </div>
            <CoverUpload value={form.cover_url} onChange={(u) => setField("cover_url", u)} />
            <div className="space-y-1"><Label className="text-xs font-semibold">Excerpt</Label><Textarea data-testid="blog-excerpt" value={form.excerpt} onChange={(e) => setField("excerpt", e.target.value)} rows={2} className="rounded-xl" /></div>
            <div className="space-y-1"><Label className="text-xs font-semibold">Content (Markdown / HTML)</Label><Textarea data-testid="blog-content" value={form.content} onChange={(e) => setField("content", e.target.value)} rows={7} className="rounded-xl" /></div>

            <div className="rounded-2xl border border-[#DBEAFE] bg-[#F0F9FF] p-3 space-y-3">
              <p className="text-xs font-bold text-[#0369A1]">SEO</p>
              <div className="space-y-1"><Label className="text-xs font-semibold">SEO Title</Label><Input data-testid="blog-seo-title" value={form.seo_title} onChange={(e) => setField("seo_title", e.target.value)} className="rounded-xl bg-white text-xs" /></div>
              <div className="space-y-1"><Label className="text-xs font-semibold">Meta Description</Label><Textarea data-testid="blog-meta-description" value={form.meta_description} onChange={(e) => setField("meta_description", e.target.value)} rows={2} className="rounded-xl bg-white text-xs" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs font-semibold">Keywords</Label><Input data-testid="blog-keywords" value={form.keywords} onChange={(e) => setField("keywords", e.target.value)} className="rounded-xl bg-white text-xs" /></div>
                <div className="space-y-1"><Label className="text-xs font-semibold">Focus Keyword</Label><Input data-testid="blog-focus-keyword" value={form.focus_keyword} onChange={(e) => setField("focus_keyword", e.target.value)} className="rounded-xl bg-white text-xs" /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs font-semibold">OG Image URL</Label><Input data-testid="blog-og-image" value={form.og_image} onChange={(e) => setField("og_image", e.target.value)} placeholder="Uses cover if empty" className="rounded-xl bg-white text-xs" /></div>
              <label className="flex items-center gap-2"><input type="checkbox" data-testid="blog-noindex" checked={!!form.noindex} onChange={(e) => setField("noindex", e.target.checked)} className="h-4 w-4" /><span className="text-xs font-semibold text-[#555]">Noindex this post</span></label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Schedule Publish (optional)</Label>
                <Input type="datetime-local" data-testid="blog-scheduled-at"
                  value={form.scheduled_at ? form.scheduled_at.slice(0, 16) : ""}
                  onChange={(e) => setField("scheduled_at", e.target.value ? new Date(e.target.value).toISOString() : "")}
                  className="rounded-xl text-xs" />
              </div>
              <div className="flex items-end">
                <div className="flex w-full items-center justify-between rounded-xl bg-[#F8F9FA] px-3 py-2.5"><Label className="text-xs font-semibold">Published</Label><Switch data-testid="blog-published" checked={form.published} onCheckedChange={(v) => setField("published", v)} /></div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-row gap-2">
            <button onClick={() => setOpen(false)} className="flex-1 rounded-full border border-[#E5E7EB] py-2.5 text-sm font-medium text-[#555]">Cancel</button>
            <RippleButton onClick={save} disabled={saving} data-testid="save-blog-btn" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#FFC107] py-2.5 text-sm font-bold text-[#111] disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{editingId ? "Update" : "Publish"}</RippleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
