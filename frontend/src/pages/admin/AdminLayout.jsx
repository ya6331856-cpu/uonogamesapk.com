import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, Star, Layers, Image as ImageIcon, LayoutTemplate,
  MessageSquare, HelpCircle, Trophy, Ticket, FileText, Search as SeoIcon,
  Megaphone, FolderOpen, Bell, Users, Settings, Shield, DatabaseBackup,
  Menu, X, LogOut, ChevronDown, Store as StoreIcon, PanelLeftClose, PanelLeft,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";

const NAV = [
  { group: "Overview", items: [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ]},
  { group: "Content", items: [
    { to: "/admin/apks", label: "APK Manager", icon: Package },
    { to: "/admin/featured-apps", label: "Featured Apps", icon: Star },
    { to: "/admin/categories", label: "Categories", icon: Layers },
    { to: "/admin/blog", label: "Blog", icon: FileText },
    { to: "/admin/reviews", label: "Reviews", icon: MessageSquare },
    { to: "/admin/faq", label: "FAQ", icon: HelpCircle },
    { to: "/admin/live-winners", label: "Live Winners", icon: Trophy },
    { to: "/admin/redeem-codes", label: "Redeem Codes", icon: Ticket },
  ]},
  { group: "Appearance", items: [
    { to: "/admin/hero", label: "Hero Banner", icon: ImageIcon },
    { to: "/admin/homepage", label: "Homepage", icon: LayoutTemplate },
    { to: "/admin/media-library", label: "Media Library", icon: FolderOpen },
  ]},
  { group: "Growth", items: [
    { to: "/admin/seo", label: "SEO Settings", icon: SeoIcon },
    { to: "/admin/seo-dashboard", label: "SEO Dashboard", icon: SeoIcon },
    { to: "/admin/ads", label: "Advertisements", icon: Megaphone },
    { to: "/admin/notifications", label: "Notifications", icon: Bell },
  ]},
  { group: "System", items: [
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/settings", label: "Settings", icon: Settings },
    { to: "/admin/security", label: "Security", icon: Shield },
    { to: "/admin/backup", label: "Backup", icon: DatabaseBackup },
  ]},
];

const ALL_ITEMS = NAV.flatMap((g) => g.items);

export default function AdminLayout() {
  const { user, ready, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (ready && !user) navigate("/admin/login");
  }, [ready, user, navigate]);

  useEffect(() => { setMobileOpen(false); setProfileOpen(false); }, [location.pathname]);

  if (!ready || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA]"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[#FFC107] border-t-transparent" /></div>;
  }

  const current = ALL_ITEMS.find((i) => i.to === location.pathname);
  const results = search ? ALL_ITEMS.filter((i) => i.label.toLowerCase().includes(search.toLowerCase())) : [];
  const siteName = settings?.branding?.site_name || "YONO GAMES";

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-4">
        <img src="/logo-icon-v2.png" alt="YONO GAMES" className="h-9 w-9 shrink-0 rounded-[10px] object-contain" />
        {!collapsed && (
          <div className="min-w-0 leading-none">
            <div className="font-display text-sm font-extrabold tracking-tight text-white">
              <span className="text-[#22C55E]">YONO</span>{" "}
              <span className="text-[#FFD54F]">GAMES</span>
            </div>
            <div className="mt-0.5 truncate text-[9px] font-semibold uppercase tracking-[0.16em] text-white/50">
              Play &amp; Win
            </div>
          </div>
        )}
      </div>

      <nav className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {NAV.map((grp) => (
          <div key={grp.group}>
            {!collapsed && <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-white/35">{grp.group}</p>}
            <div className="space-y-0.5">
              {grp.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  data-testid={`nav-${item.to.split("/").pop()}`}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors duration-150 ${
                      isActive ? "bg-[#FFC107] text-[#111111]" : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`
                  }
                  title={item.label}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button onClick={() => { logout(); navigate("/admin/login"); }} data-testid="sidebar-logout"
          className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white">
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 76 : 248 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-y-0 left-0 z-40 hidden bg-[#111111] lg:block"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-black/50 lg:hidden" />
            <motion.aside initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} transition={{ duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-[#111111] lg:hidden">
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className={`transition-all duration-300 ${collapsed ? "lg:pl-[76px]" : "lg:pl-[248px]"}`}>
        {/* Top navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#E5E7EB] bg-white/85 px-4 backdrop-blur-xl">
          <button onClick={() => setMobileOpen(true)} className="text-[#555555] lg:hidden" data-testid="mobile-menu-btn"><Menu className="h-5 w-5" /></button>
          <button onClick={() => setCollapsed((c) => !c)} className="hidden text-[#555555] lg:block" data-testid="collapse-btn">
            {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>

          <div className="relative hidden max-w-xs flex-1 sm:block">
            <SeoIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search admin..." data-testid="admin-search"
              className="h-9 w-full rounded-full border border-[#E5E7EB] bg-[#F8F9FA] pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC107]" />
            {results.length > 0 && (
              <div className="absolute mt-2 w-full overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-lg">
                {results.map((r) => (
                  <button key={r.to} onClick={() => { navigate(r.to); setSearch(""); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#555555] hover:bg-[#F8F9FA]">
                    <r.icon className="h-4 w-4 text-[#FFB300]" /> {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <a href="/" target="_blank" rel="noreferrer" className="hidden items-center gap-1.5 rounded-full border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#555555] hover:text-[#FFB300] sm:flex" data-testid="view-site">
              <StoreIcon className="h-3.5 w-3.5" /> View Site
            </a>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] text-[#555555]" data-testid="notif-btn">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#FF6B35]" />
            </button>
            <div className="relative">
              <button onClick={() => setProfileOpen((o) => !o)} data-testid="profile-menu-btn" className="flex items-center gap-2 rounded-full border border-[#E5E7EB] py-1 pl-1 pr-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#FFC107] to-[#FFB300] font-display text-xs font-bold text-white">
                  {(user.email || "A").charAt(0).toUpperCase()}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-[#999999]" />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-lg">
                    <div className="border-b border-[#E5E7EB] px-3 py-2.5">
                      <p className="text-sm font-semibold text-[#111111]">{user.name || "Admin"}</p>
                      <p className="truncate text-xs text-[#999999]">{user.email}</p>
                    </div>
                    <button onClick={() => navigate("/admin/settings")} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#555555] hover:bg-[#F8F9FA]"><Settings className="h-4 w-4" /> Settings</button>
                    <button onClick={() => navigate("/admin/security")} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#555555] hover:bg-[#F8F9FA]"><Shield className="h-4 w-4" /> Security</button>
                    <button onClick={() => { logout(); navigate("/admin/login"); }} data-testid="profile-logout" className="flex w-full items-center gap-2 border-t border-[#E5E7EB] px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50"><LogOut className="h-4 w-4" /> Logout</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl p-4 sm:p-6">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
