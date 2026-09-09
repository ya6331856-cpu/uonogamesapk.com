import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { PageHeader, Card } from "@/components/admin/adminUI";
import { Loader2, Plus, Trash2, ExternalLink } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <PageHeader title="APK Manager" desc="Manage all your apps, versions, and downloads here." />
      
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-sm text-[#111]">All Applications ({apps.length})</h3>
          <button 
            onClick={fetchApps} 
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-[#111] hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          </div>
        ) : apps.length === 0 ? (
          <div className="text-center py-12 text-sm text-[#555]">
            No apps found. Add your first APK via backend or database seeding.
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
                      <a href={`/${app.slug}`} target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-gray-600">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button 
                      onClick={() => handleDelete(uniqueId)}
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
    </div>
  );
}

export default function ApksPage() {
  return <SafeBoundary><ApksPageInner /></SafeBoundary>;
}
