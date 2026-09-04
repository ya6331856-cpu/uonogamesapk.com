import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Toaster from "./components/ui/sonner";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import Store from "./pages/Store";
import AppDetail from "./pages/AppDetail";
import AdminLogin from "./pages/AdminLogin";
import PWAInstallBanner from "./components/PWAInstallBanner";
import Analytics from "./components/Analytics";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ApksPage from "./pages/admin/ApksPage";
import FeaturedAppsPage from "./pages/admin/FeaturedAppsPage";
import BlogPage from "./pages/admin/BlogPage";
import MediaLibraryPage from "./pages/admin/MediaLibraryPage";

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
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="apks" element={<ApksPage />} />
                  <Route path="featured-apps" element={<FeaturedAppsPage />} />
                  <Route path="blog" element={<BlogPage />} />
                  <Route path="media-library" element={<MediaLibraryPage />} />
                </Route>
                <Route path="/:slug" element={<AppDetail />} />
              </Routes>
            </BrowserRouter>
            <PWAInstallBanner />
            <Analytics />
            <Toaster position="bottom-center" offset={30} richColors />
          </AuthProvider>
        </SettingsProvider>
      </HelmetProvider>
    </div>
  );
}

export default App;
