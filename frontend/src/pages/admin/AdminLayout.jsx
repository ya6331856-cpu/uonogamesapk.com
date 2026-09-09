import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, Star, MessageSquare, HelpCircle,
  Tag, FileText, Award, Settings, Users, Shield, LogOut, Menu, X, RefreshCw, Database
} from "lucide-react";
import RippleButton from "@/components/RippleButton";

class SafeBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="p-8 m-6 bg-red-50 border border-red-200 rounded-2xl text-red-600 max-w-xl mx-auto mt-20 shadow-lg">
          <h2 className="text-lg font-bold mb-2">Admin Layout Crashed</h2>
          <p className="text-xs font-mono break-all bg-white p-3 rounded border border-red-100">{String(this.state.error.message)}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold">Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const navItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "APK Manager", path: "/admin/apks", icon: Package },
  { label: "Featured Apps", path: "/admin/featured-apps", icon: Star },
  { label: "Categories", path: "/admin/categories", icon: Tag },
  { label: "Blog Manager", path: "/admin/blog", icon: FileText },
  { label: "Reviews", path: "/admin/reviews", icon: MessageSquare },
  { label: "FAQ Manager", path: "/admin/faqs", icon: HelpCircle },
  { label: "Live Winners", path: "/admin/winners", icon: Award },
  { label: "Redeem Codes", path: "/admin/codes", icon: Tag },
  { label: "Hero Banner", path: "/admin/hero", icon: LayoutDashboard },
  { label: "Homepage Builder", path: "/admin/homepage", icon: LayoutDashboard },
  { label: "Media Library", path: "/admin/media-library", icon: Package },
  { label: "SEO Settings", path: "/admin/seo", icon: Shield },
  { label: "SEO Dashboard", path: "/admin/seo-dashboard", icon: Shield },
  { label: "Advertisements", path: "/admin/ads", icon: Tag },
  { label: "Notifications", path: "/admin/notifications", icon: MessageSquare },
  { label: "Users & Security", path: "/admin/users-security", icon: Users },
  { label: "Settings", path: "/admin/settings", icon: Settings },
  { label: "Backup & Restore", path: "/admin/backup", icon: Database },
];

function AdminLayoutInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("uono_token");
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-[#111]">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-[#E5E7EB] bg-white px-4 lg:hidden">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-[#555]">
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <span className="font-display font-bold text-sm">YONO GAMES ADMIN</span>
        <button onClick={logout} className="p-2 text-red-600"><LogOut className="h-4 w-4" /></button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-[#E5E7EB] bg-white transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center border-b border-[#E5E7EB] px-6">
          <span className="font-display text-base font-bold text-[#111]">YONO ADMIN</span>
        </div>
        <nav className="h-[calc(100vh-4rem)] space-y-1 overflow-y-auto p-4">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <button
                key={index}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${active ? "bg-[#FFC107] text-[#111] shadow-[0_4px_12px_rgba(255,193,7,0.3)]" : "text-[#555] hover:bg-[#F8F9FA] hover:text-[#111]"}`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {item.label}
              </button>
            );
          })}
          <div className="pt-4">
            <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64">
        <div className="min-h-screen p-4 pt-20 lg:p-8 lg:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout() {
  return <SafeBoundary><AdminLayoutInner /></SafeBoundary>;
}
