import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus, Pencil, Trash2, LogOut, Star, BadgeCheck, Crown,
  Upload, Loader2, Package, ArrowLeft, X,
} from "lucide-react";
import { toast } from "sonner";
import api, { resolveUrl } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { formatCount } from "../lib/format";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "../components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../components/ui/alert-dialog";
import RippleButton from "../components/RippleButton";
import AdminFaqs from "../components/AdminFaqs";
import AdminSettings from "../components/admin/AdminSettings";
import AdminReviews from "../components/admin/AdminReviews";
import AdminWinners from "../components/admin/AdminWinners";
import AdminCodes from "../components/admin/AdminCodes";
import AdminAnalytics from "../components/admin/AdminAnalytics";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";

const CATEGORIES = ["Games", "Puzzle", "Simulation", "Tools", "Social", "Entertainment"];

const EMPTY = {
  name: "", version: "1.0.0", size: "0 MB", rating: 4.5, downloads: 0,
  verified: true, category: "Games", description: "", icon_url: "", apk_url: "",
  featured: false, featured_order: null,
  developer: "", package_name: "", min_android: "Android 6.0+", whats_new: "",
  screenshots: [], badge: "Auto", trending: false, hidden: false,
  features: [], requirements: "", permissions: [],
};

const BADGES = ["Auto", "Hot", "New", "Popular", "Trending", "None"];

function FileUpload({ label, testId, accept, value, onUploaded, isImage }) {
  const [uploading, setUploading] = useState(false);
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/admin/upload", fd);
      onUploaded(data.url);
      toast.success(`${label} uploaded`);
    } catch (err) {
      toast.error(`Upload failed`);
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-[#555555]">{label}</Label>
      <div className="flex items-center gap-3">
        {isImage && value ? (
          <img src={resolveUrl(value)} alt="preview" className="h-12 w-12 rounded-[12px] object-cover ring-1 ring-black/5" />
        ) : value ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#F0FDF4] text-[#22C55E]">
            <BadgeCheck className="h-5 w-5" />
          </div>
        ) : null}
        <label
          data-testid={testId}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#E5E7EB] bg-[#F8F9FA] py-2.5 text-xs font-medium text-[#555555] transition-colors hover:border-[#FFC107]"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Uploading..." : value ? "Replace file" : `Upload ${label}`}
          <input type="file" accept={accept} className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, ready, logout } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (ready && !user) navigate("/admin/login");
  }, [ready, user, navigate]);

  const fetchApps = async () => {
    try {
      const { data } = await api.get("/apps", { params: { include_hidden: true } });
      setApps([...data.featured, ...data.apps]);
    } catch (e) {
      toast.error("Failed to load apps");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchApps();
  }, [user]);

  const openNew = () => {
    setForm(EMPTY);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (app) => {
    setForm({ ...EMPTY, ...app });
    setEditingId(app.id);
    setDialogOpen(true);
  };

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("App name is required");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      rating: parseFloat(form.rating) || 0,
      downloads: parseInt(form.downloads) || 0,
      featured_order: form.featured ? (parseInt(form.featured_order) || 1) : null,
      features: Array.isArray(form.features) ? form.features : String(form.features || "").split(",").map((x) => x.trim()).filter(Boolean),
      permissions: Array.isArray(form.permissions) ? form.permissions : String(form.permissions || "").split(",").map((x) => x.trim()).filter(Boolean),
    };
    try {
      if (editingId) {
        await api.put(`/admin/apps/${editingId}`, payload);
        toast.success("App updated");
      } else {
        await api.post("/admin/apps", payload);
        toast.success("App created");
      }
      setDialogOpen(false);
      fetchApps();
    } catch (err) {
      toast.error("Failed to save app");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/admin/apps/${deleteId}`);
      toast.success("App deleted");
      setDeleteId(null);
      fetchApps();
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  if (!ready || !user) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#FFC107]" />
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white/85 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/")} data-testid="admin-back" className="text-[#777777]">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-display text-base font-bold text-[#111111]">Admin Dashboard</h1>
              <p className="text-[11px] text-[#999999]">{apps.length} apps</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate("/admin/login"); }}
            data-testid="logout-btn"
            className="flex items-center gap-1 rounded-full border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#555555]"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
      </header>

      <Tabs defaultValue="apps" className="w-full">
        <div className="sticky top-[57px] z-20 bg-[#F8F9FA]/95 px-4 py-3 backdrop-blur-md">
          <TabsList className="no-scrollbar flex w-full justify-start gap-1 overflow-x-auto rounded-full bg-[#F1F2F4] p-1">
            {[
              ["apps", "Apps"], ["faqs", "FAQs"], ["content", "Content"],
              ["reviews", "Reviews"], ["winners", "Winners"], ["codes", "Codes"], ["analytics", "Analytics"],
            ].map(([v, label]) => (
              <TabsTrigger key={v} value={v} data-testid={`tab-${v}`} className="shrink-0 rounded-full px-3.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-[#111111] data-[state=active]:shadow-sm">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="apps" className="mt-0">
          <div className="px-4 pt-4">
            <RippleButton
              onClick={openNew}
              data-testid="add-app-btn"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FFC107] to-[#FFB300] py-3 text-sm font-bold text-[#111111] shadow-[0_8px_20px_rgba(255,193,7,0.45)]"
            >
              <Plus className="h-4 w-4" /> Add New App
            </RippleButton>
          </div>

          <main className="space-y-3 px-4 pt-4">
            {loading ? (
              <div className="py-16 text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#FFC107]" />
              </div>
            ) : apps.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-[#E5E7EB] bg-white py-14 text-center">
                <Package className="mx-auto h-8 w-8 text-[#CCCCCC]" />
                <p className="mt-2 text-sm text-[#777777]">No apps yet. Add your first one.</p>
              </div>
            ) : (
              apps.map((app) => (
            <motion.div
              key={app.id}
              layout
              data-testid={`admin-app-${app.id}`}
              className="flex items-center gap-3 rounded-[18px] border border-[#E5E7EB] bg-white p-3 shadow-[0_6px_20px_rgba(0,0,0,0.03)]"
            >
              {app.icon_url ? (
                <img
                  src={resolveUrl(app.icon_url)}
                  alt={app.name}
                  className="h-12 w-12 shrink-0 rounded-[12px] object-cover ring-1 ring-black/5"
                  onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#FFC107] to-[#FFB300] font-display text-lg font-bold text-white ring-1 ring-black/5">
                  {app.name?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate font-display text-sm font-semibold text-[#111111]">{app.name}</h3>
                  {app.featured && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-[#FFF8E1] px-1.5 py-0.5 text-[10px] font-bold text-[#FFB300]">
                      <Crown className="h-2.5 w-2.5" />#{app.featured_order}
                    </span>
                  )}
                  {app.hidden && (
                    <span className="rounded-full bg-[#FEF2F2] px-1.5 py-0.5 text-[10px] font-bold text-red-500">Hidden</span>
                  )}
                </div>
                <p className="text-[11px] text-[#777777]">v{app.version} • {app.size} • {app.category}</p>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[#999999]">
                  <span className="inline-flex items-center gap-0.5"><Star className="h-3 w-3 fill-[#FFC107] text-[#FFC107]" />{app.rating?.toFixed(1)}</span>
                  <span>{formatCount(app.downloads)} dl</span>
                  {app.verified && <BadgeCheck className="h-3 w-3 text-[#22C55E]" />}
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <button
                  onClick={() => openEdit(app)}
                  data-testid={`edit-app-${app.id}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8F9FA] text-[#555555] transition-colors hover:bg-[#FFF8E1] hover:text-[#FFB300]"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setDeleteId(app.id)}
                  data-testid={`delete-app-${app.id}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8F9FA] text-[#555555] transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              </motion.div>
            ))
          )}
          </main>
        </TabsContent>

        <TabsContent value="faqs" className="mt-0">
          <div className="px-4 pt-4">
            <AdminFaqs />
          </div>
        </TabsContent>

        <TabsContent value="content" className="mt-0">
          <div className="px-4 pt-4">
            <AdminSettings />
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-0">
          <div className="px-4 pt-4">
            <AdminReviews />
          </div>
        </TabsContent>

        <TabsContent value="winners" className="mt-0">
          <div className="px-4 pt-4">
            <AdminWinners />
          </div>
        </TabsContent>

        <TabsContent value="codes" className="mt-0">
          <div className="px-4 pt-4">
            <AdminCodes />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-0">
          <div className="px-4 pt-4">
            <AdminAnalytics />
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-[440px] overflow-y-auto rounded-[22px]">
          <DialogHeader>
            <DialogTitle className="font-display text-[#111111]">
              {editingId ? "Edit App" : "Add New App"}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#777777]">
              Fill in the app details. Upload an icon and APK file, or paste URLs.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#555555]">App Name</Label>
              <Input data-testid="form-name" value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="e.g. Pixel Racer X" className="rounded-xl" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#555555]">Version</Label>
                <Input data-testid="form-version" value={form.version} onChange={(e) => setField("version", e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#555555]">APK Size</Label>
                <Input data-testid="form-size" value={form.size} onChange={(e) => setField("size", e.target.value)} placeholder="78 MB" className="rounded-xl" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#555555]">Rating</Label>
                <Input data-testid="form-rating" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setField("rating", e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#555555]">Downloads</Label>
                <Input data-testid="form-downloads" type="number" value={form.downloads} onChange={(e) => setField("downloads", e.target.value)} className="rounded-xl" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#555555]">Category</Label>
              <Select value={form.category} onValueChange={(v) => setField("category", v)}>
                <SelectTrigger data-testid="form-category" className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#555555]">Description</Label>
              <Textarea data-testid="form-description" value={form.description} onChange={(e) => setField("description", e.target.value)} rows={2} className="rounded-xl" />
            </div>

            <FileUpload label="App Icon" testId="upload-icon" accept="image/*" value={form.icon_url} isImage onUploaded={(url) => setField("icon_url", url)} />

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#555555]">Icon URL (optional)</Label>
              <Input data-testid="form-icon-url" value={form.icon_url} onChange={(e) => setField("icon_url", e.target.value)} placeholder="https://... or upload above" className="rounded-xl text-xs" />
            </div>

            <FileUpload label="APK File" testId="upload-apk" accept=".apk,application/vnd.android.package-archive" value={form.apk_url} onUploaded={(url) => setField("apk_url", url)} />

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#555555]">APK URL (optional)</Label>
              <Input data-testid="form-apk-url" value={form.apk_url} onChange={(e) => setField("apk_url", e.target.value)} placeholder="https://... or upload above" className="rounded-xl text-xs" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#555555]">Developer</Label>
                <Input data-testid="form-developer" value={form.developer} onChange={(e) => setField("developer", e.target.value)} placeholder="Studio name" className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#555555]">Min Android</Label>
                <Input data-testid="form-min-android" value={form.min_android} onChange={(e) => setField("min_android", e.target.value)} placeholder="Android 6.0+" className="rounded-xl" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#555555]">Package Name</Label>
              <Input data-testid="form-package" value={form.package_name} onChange={(e) => setField("package_name", e.target.value)} placeholder="com.example.app" className="rounded-xl text-xs" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#555555]">What&apos;s New</Label>
              <Textarea data-testid="form-whats-new" value={form.whats_new} onChange={(e) => setField("whats_new", e.target.value)} rows={2} placeholder="Latest changes in this version" className="rounded-xl" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#555555]">Badge / Tag</Label>
              <Select value={form.badge} onValueChange={(v) => setField("badge", v)}>
                <SelectTrigger data-testid="form-badge" className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BADGES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#555555]">Key Features (comma separated)</Label>
              <Textarea data-testid="form-features" value={Array.isArray(form.features) ? form.features.join(", ") : form.features} onChange={(e) => setField("features", e.target.value.split(",").map((x) => x.trim()).filter(Boolean))} rows={2} placeholder="Multiplayer, Offline mode, HD graphics" className="rounded-xl" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#555555]">Requirements</Label>
              <Input data-testid="form-requirements" value={form.requirements} onChange={(e) => setField("requirements", e.target.value)} placeholder="2GB RAM, 200MB free space" className="rounded-xl" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#555555]">Permissions (comma separated)</Label>
              <Textarea data-testid="form-permissions" value={Array.isArray(form.permissions) ? form.permissions.join(", ") : form.permissions} onChange={(e) => setField("permissions", e.target.value.split(",").map((x) => x.trim()).filter(Boolean))} rows={2} placeholder="Storage, Internet, Location" className="rounded-xl" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between rounded-xl bg-[#FFF3ED] px-3 py-2.5">
                <Label className="text-xs font-semibold text-[#FF6B35]">Trending</Label>
                <Switch data-testid="form-trending" checked={form.trending} onCheckedChange={(v) => setField("trending", v)} />
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[#F8F9FA] px-3 py-2.5">
                <Label className="text-xs font-semibold text-[#555555]">Hidden</Label>
                <Switch data-testid="form-hidden" checked={form.hidden} onCheckedChange={(v) => setField("hidden", v)} />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-[#F8F9FA] px-3 py-2.5">
              <Label className="text-xs font-semibold text-[#555555]">Verified Badge</Label>
              <Switch data-testid="form-verified" checked={form.verified} onCheckedChange={(v) => setField("verified", v)} />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-[#FFF8E1] px-3 py-2.5">
              <Label className="text-xs font-semibold text-[#FFB300]">Featured (Pinned)</Label>
              <Switch data-testid="form-featured" checked={form.featured} onCheckedChange={(v) => setField("featured", v)} />
            </div>

            {form.featured && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#555555]">Featured Position (1 = large top)</Label>
                <Select value={String(form.featured_order || 1)} onValueChange={(v) => setField("featured_order", parseInt(v))}>
                  <SelectTrigger data-testid="form-featured-order" className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Position #1 (Large)</SelectItem>
                    <SelectItem value="2">Position #2</SelectItem>
                    <SelectItem value="3">Position #3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter className="flex-row gap-2">
            <button onClick={() => setDialogOpen(false)} className="flex-1 rounded-full border border-[#E5E7EB] py-2.5 text-sm font-medium text-[#555555]">
              Cancel
            </button>
            <RippleButton
              onClick={save}
              disabled={saving}
              data-testid="save-app-btn"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#FFC107] py-2.5 text-sm font-bold text-[#111111] shadow-[0_6px_16px_rgba(255,193,7,0.4)] disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingId ? "Update" : "Create"}
            </RippleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="max-w-[400px] rounded-[22px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this app?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2">
            <AlertDialogCancel className="flex-1 rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              data-testid="confirm-delete-btn"
              className="flex-1 rounded-full bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
