import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import Store from "./pages/Store";
import AppDetail from "./pages/AppDetail";
import AdminLogin from "./pages/AdminLogin";
import PwaInstallBanner from "./components/PwaInstallBanner";
import Analytics from "./components/Analytics";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ApksPage from "./pages/admin/ApksPage";
import FeaturedAppsPage from "./pages/admin/FeaturedAppsPage";
import BlogPage from "./pages/admin/BlogPage";
import MediaLibraryPage from "./pages/admin/MediaLibraryPage";
import SeoDashboardPage from "./pages/admin/SeoDashboardPage";
import BackupPage from "./pages/admin/BackupPage";
import UsersSecurityPage from "./pages/admin/UsersSecurityPage";
import AdminReviews from "./components/admin/AdminReviews";

// SettingsPages.jsx se saare sub-pages aur main settings import ki gayi hai
import SettingsPage, { HomepagePage, CategoriesPage, AdsPage, NotificationsPage, HeroPage } from "./pages/admin/SettingsPage";

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
