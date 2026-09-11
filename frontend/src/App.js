import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";
import { SettingsProvider } from "./context/SettingsContext";
import { AuthProvider } from "./context/AuthContext";

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
const SettingsPage = lazy(() => import("./pages/admin/SettingsPages"));

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
              <Suspense fallback={<div style={{ textAlign: "center", marginTop: "20vh", color: "#fff" }}>Loading...</div>}>
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
                    <Route path="seo" element={<SeoDashboardPage />} />
                    <Route path="seo-dashboard" element={<SeoDashboardPage />} />
                    <Route path="backup" element={<BackupPage />} />
                    <Route path="users" element={<UsersSecurityPage />} />
                    <Route path="settings" element={<SettingsPage />} />
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
