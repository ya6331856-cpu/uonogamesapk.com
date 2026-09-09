import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { PageHeader, Card } from "@/components/admin/adminUI";
import { Loader2, Plus, Trash2, ExternalLink, Edit3, X, Save } from "lucide-react";

class SafeBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="p-6 m-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
          <h3 className="font-bold mb-2">Page Component Crashed</h3>
          <p className="text-xs font-mono break-all">{String(this.state.error.message)}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function ApksPageInner() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingApp, setEditingApp] = useState(null);

  // Form state for Add/Edit
  const [formData, setFormData] = useState({
    name: "",
    version: "1.0.0",
    category: "Games",
    description: "",
    icon_url: "",
    apk_url: "",
    slug: "",
    seo_title: "",
    meta_description: "",
    keywords: "",
    downloads: 500000
  });

  const fetchApps = async () => {
    try {
      setLoading(true);
      const res = await api.get("/apps?include_hidden=true");
      const appData = res.data.apps || res.data || [];
      setApps(appData);
    } catch (err) {
      toast.error("Failed to load apps");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleDelete = async (appId) => {
    if (!window.confirm("Are you sure you want to delete this app?")) return;
    try {
      await api.delete(`/admin/apps/${appId}`);
      toast.success("App deleted successfully");
      fetchApps();
    } catch (err) {
      toast.error("Failed to delete app");
    }
  };

  const handleOpenEdit = (app) => {
    setEditingApp(app.id || app._id);
    setFormData({
      name: app.name || "",
      version: app.version || "1.0.0",
      category: app.category || "Games",
      description: app.description || "",
      icon_url: app.icon_url || "",
      apk_url: app.apk_url || "",
      slug: app.slug || "",
      seo_title: app.seo_title || "",
      meta_description: app.meta_description || "",
      keywords: app.keywords || "",
      downloads: app.downloads || 500000
    });
    setShowAddModal(true);
  };

  const handleOpenAdd = () => {
    setEditingApp(null);
    setFormData({
      name: "",
      version: "1.0.0",
      category: "Games",
      description: "",
      icon_url: "",
      apk_url: "",
      slug: "",
      seo_title: "",
      meta_description: "",
      keywords: "",
      downloads: 500000
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingApp) {
        await api.put(`/admin/apps/${editingApp}`, formData);
        toast.success("App updated successfully!");
      } else {
        await api.post("/admin/apps", formData);
        toast.success("New app created successfully!");
      }
      setShowAddModal(false);
      fetchApps();
    } catch (err) {
      toast.error("Failed to save app details");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="APK Manager" desc="Manage all your apps, versions, SEO, and download links." />
        <button 
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New App</span>
        </button>
      </div>
      
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-sm text-[#111]">All Applications ({apps.length})</h3>
          <button 
            onClick={fetchApps} 
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-[#111] hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Refresh List
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          </div>
        ) : apps.length === 0 ? (
          <div className="text-center py-12 text-sm text-[#555]">
            No apps found. Click "Add New App" above to create one.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {apps.map((app) => {
              const uniqueId = app.id || app._id;
              return (
                <div key={uniqueId} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {app.icon_url ? (
                      <img src={app.icon_url} alt="" className="w-10 h-10 rounded-lg object-cover border" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                        {app.name?.[0]}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-semibold text-[#111]">{app.name}</h4>
                      <p className="text-[10px] text-[#555]">v{app.version || "1.0.0"} • {app.category || "Games"} • {app.downloads || 0} downloads</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {app.slug && (
                      <a href={`/${app.slug}`} target="_blank" rel="noreferrer" title="View Live Page" className="p-1.5 text-gray-400 hover:text-gray-600">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button 
                      onClick={() => handleOpenEdit(app)}
                      title="Edit App & SEO Details"
                      className="p-1.5 text-blue-400 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(uniqueId)}
                      title="Delete App"
                      className="p-1.5 text-red-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 my-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm text-[#111]">
                {editingApp ? "Edit App & SEO Details" : "Add New APK & Details"}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1 text-gray-700">App Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border rounded-lg p-2 text-xs" 
                    placeholder="e.g. Rummy Nabob"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700">URL Slug</label>
                  <input 
                    type="text" 
                    value={formData.slug} 
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    className="w-full border rounded-lg p-2 text-xs" 
                    placeholder="e.g. rummy-nabob-apk"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium mb-1 text-gray-700">Version</label>
                  <input 
                    type="text" 
                    value={formData.version} 
                    onChange={(e) => setFormData({...formData, version: e.target.value})}
                    className="w-full border rounded-lg p-2 text-xs" 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700">Category</label>
                  <input 
                    type="text" 
                    value={formData.category} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full border rounded-lg p-2 text-xs" 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700">Downloads Count</label>
                  <input 
                    type="number" 
                    value={formData.downloads} 
                    onChange={(e) => setFormData({...formData, downloads: Number(e.target.value)})}
                    className="w-full border rounded-lg p-2 text-xs" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1 text-gray-700">Icon Image URL</label>
                  <input 
                    type="text" 
                    value={formData.icon_url} 
                    onChange={(e) => setFormData({...formData, icon_url: e.target.value})}
                    className="w-full border rounded-lg p-2 text-xs" 
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700">Real APK Download Link</label>
                  <input 
                    type="text" 
                    value={formData.apk_url} 
                    onChange={(e) => setFormData({...formData, apk_url: e.target.value})}
                    className="w-full border rounded-lg p-2 text-xs" 
                    placeholder="https://... or /api/uploads/..."
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-700">App Description</label>
                <textarea 
                  rows={3}
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border rounded-lg p-2 text-xs" 
                  placeholder="Detailed description about the app..."
                />
              </div>

              <div className="border-t pt-3 space-y-3">
                <h4 className="font-bold text-gray-900">SEO Settings</h4>
                <div>
                  <label className="block font-medium mb-1 text-gray-700">SEO Meta Title</label>
                  <input 
                    type="text" 
                    value={formData.seo_title} 
                    onChange={(e) => setFormData({...formData, seo_title: e.target.value})}
                    className="w-full border rounded-lg p-2 text-xs" 
                    placeholder="App Name APK Download - Latest Version"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700">Meta Description</label>
                  <textarea 
                    rows={2}
                    value={formData.meta_description} 
                    onChange={(e) => setFormData({...formData, meta_description: e.target.value})}
                    className="w-full border rounded-lg p-2 text-xs" 
                    placeholder="Short description for Google search results..."
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700">Keywords (Comma separated)</label>
                  <input 
                    type="text" 
                    value={formData.keywords} 
                    onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                    className="w-full border rounded-lg p-2 text-xs" 
                    placeholder="rummy apk, download rummy, yono games"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save App Details</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApksPage() {
  return <SafeBoundary><ApksPageInner /></SafeBoundary>;
}
