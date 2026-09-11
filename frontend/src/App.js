import React, { lazy, Suspense } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";

// Initial/Critical pages jo turant load hone chahiye
import Store from "./pages/Store";
import AppDetail from "./pages/AppDetail";
import AdminLogin from "./pages/AdminLogin";
import PwaInstallBanner from "./components/PWAInstallBanner";
import Analytics from "./components/Analytics";

// Heavy/Admin pages ko lazy load kiya gaya hai taaki initial load fast ho
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const ApksPage = lazy(() => import("./pages/admin/ApksPage"));
const FeaturedAppsPage = lazy(() => import("./pages/admin/FeaturedAppsPage"));
const BlogPage = lazy(() => import("./pages/admin/BlogPage"));
const MediaLibraryPage = lazy(() => import("./pages/admin/MediaLibraryPage"));
const SeoDashboardPage = lazy(() => import("./pages/admin/SeoDashboardPage"));
const BackupPage = lazy(() => import("./pages/admin/BackupPage"));
const UsersSecurityPage = lazy(() => import("./pages/admin/UsersSecurityPages"));
const AdminReviews =- lazy(() => import("./components/admin/AdminReviews"));

// SettingsPages aur uske sub-pages
const SettingsPage = lazy(() => import("./pages/admin/SettingsPages").then(mod => ({ default: mod.default })));
const HomepagePage = lazy(() => import("./pages/admin/SettingsPages").then(mod => ({ default: mod.HomepagePage })));
const CategoriesPage = lazy(() => import("./pages/admin/SettingsPages").then(mod => ({ default: mod.CategoriesPage })));
const AdsPage = lazy(() => import("./pages/admin/SettingsPages").then(mod => ({ default: mod.AdsPage })));
const NotificationsPage = lazy(() => import("./pages/admin/SettingsPages").then(mod => ({ default: mod.NotificationsPage })));
const HeroPage = lazy(() => import("./pages/admin/SettingsPages").then(mod => ({ default: mod.HeroPage })));

function LegacyAppRedirect() {
  const { id } = useParams();
  return <Navigate to={`/${id}`} replace />;
}

function App() {
  return (
    <div className="App">
      <HelmetProvider>
        <SettingsProvider>
          <AuthProvider>
            <BrowserRouter>
              <Suspense fallback={<div style={{ textAlign: "center", padding: "50px", color: "#fff" }}>Loading...</div>}>
                <Routes>
                  <Route path="/" element={<Store />} />
                  <Route path="/app/:id" element={<LegacyAppRedirect />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="apks" element={<ApksPage />} />
                    <Route path="featured-apps" element={<FeaturedAppsPage />} />
                    <Route path="blog" element={<BlogPage />} />
                    <Route path="media-library" element={<MediaLibraryPage />} />
                    
                    {/* SEO & Ranking Management Routes */}
                    <Route path="seo" element={<SeoDashboardPage />} />
                    <Route path="seo-dashboard" element={<SeoDashboardPage />} />
                    
                    <Route path="backup" element={<BackupPage />} />
                    <Route path="users" element={<UsersSecurityPage />} />
                    
                    {/* Settings aur baaki sabhi sub-pages */}
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="homepage" element={<HomepagePage />} />
                    <Route path="categories" element={<CategoriesPage />} />
                    <Route path="ads" element={<AdsPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="hero" element={<HeroPage />} />
                    <Route path="reviews" element={<AdminReviews />} />
                  </Route>

                  <Route path="/:slug" element={<AppDetail />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
            <PwaInstallBanner />
            <Analytics />
            <Toaster position="bottom-center" offset={30} richColors />
          </AuthProvider>
        </SettingsProvider>
      </HelmetProvider>
    </div>
  );
}

export default App;
