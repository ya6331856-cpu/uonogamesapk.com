import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Star, BadgeCheck, Download, Gift, ArrowLeft, ShieldCheck, Zap, Wifi, Sparkles, CheckCircle2, Search, X, Flame, Home } from "lucide-react";
import { toast } from "sonner";
import api, { API, resolveUrl } from "@/lib/api";
import SEOHead from "@/components/SEOHead";
import AppIcon from "@/components/AppIcon";
import RippleButton from "@/components/RippleButton";
import SiteFooter from "@/components/SiteFooter";
import FaqSection from "@/components/FaqSection";
import AppCard from "@/components/AppCard";
import HowToInstallSection from "@/components/HowToInstallSection";
import { Input } from "@/components/ui/input";

function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "");
}

// Gold Rummy fixed at #1, showing ALL games with dynamic variation across pages
function getOrderedSimilarApps(allApps, currentAppId) {
  if (!allApps || allApps.length === 0) return [];
  
  const seen = new Set();
  let list = [];
  
  for (const a of allApps) {
    if (String(a.id) === String(currentAppId)) continue;
    const normName = normalize(a.name);
    if (seen.has(normName)) continue;
    seen.add(normName);
    list.push({ ...a, version: "v2026 Latest" });
  }
  
  const goldRummyIdx = list.findIndex(a => 
    normalize(a.name).includes("goldrummy") || 
    String(a.name).toLowerCase().includes("gold rummy")
  );

  let goldRummyObj = null;
  if (goldRummyIdx !== -1) {
    goldRummyObj = list.splice(goldRummyIdx, 1)[0];
  }

  // Rotate/vary the rest of the games dynamically based on app ID
  const seed = String(currentAppId || "yono").split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  for (let i = list.length - 1; i > 0; i--) {
    const j = (seed + i) % (i + 1);
    [list[i], list[j]] = [list[j], list[i]];
  }

  if (goldRummyObj) {
    list.unshift(goldRummyObj);
  }

  return list; // Saare games dikhege ab bina kisi limit ke!
}

export default function AppDetail() {
  const { id, slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const identifier = slug || id || pathSegments[pathSegments.length - 1];

  const cachedData = typeof window !== "undefined" ? localStorage.getItem("yono_apps_perm_cache") : null;
  const parsedCache = useMemo(() => {
    try {
      return cachedData ? JSON.parse(cachedData) : null;
    } catch (e) {
      return null;
    }
  }, [cachedData]);

  const allCachedApps = useMemo(() => {
    if (!parsedCache) return [];
    const combined = [...(parsedCache.apps || []), ...(parsedCache.featured || []), ...(parsedCache.trending || [])];
    return combined.map(app => ({ ...app, version: "v2026 Latest" }));
  }, [parsedCache]);

  const fallbackApp = useMemo(() => {
    const cleanName = identifier ? identifier.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "Rummy Ludo";
    return {
      id: identifier || "rummy-ludo",
      name: cleanName,
      slug: identifier,
      rating: 4.8,
      size: "45 MB",
      version: "v2026 Latest",
      downloads: 4200000,
      signup_bonus: "₹501",
      icon_url: "https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=150&auto=format&fit=crop&q=80",
      apk_url: "#"
    };
  }, [identifier]);

  const initialApp = useMemo(() => {
    if (location.state?.app) return { ...location.state.app, version: "v2026 Latest" };
    if (allCachedApps.length > 0 && identifier && identifier !== "undefined") {
      const found = allCachedApps.find(a => 
        String(a.id) === String(identifier) || 
        a.slug === identifier || 
        normalize(a.name) === normalize(identifier)
      );
      if (found) return { ...found, version: "v2026 Latest" };
    }
    return allCachedApps[0] || fallbackApp;
  }, [location.state, allCachedApps, identifier, fallbackApp]);

  const [app, setApp] = useState(initialApp);
  const [allStoreApps, setAllStoreApps] = useState(allCachedApps);
  const [similarApps, setSimilarApps] = useState(() => {
    const fallbackList = allCachedApps.length > 0 ? allCachedApps : (parsedCache?.apps || []);
    return getOrderedSimilarApps(fallbackList, initialApp?.id);
  });

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    let isMounted = true;

    const fetchAppData = async () => {
      try {
        const res = await api.get("/apps?limit=100");
        if (res.data && isMounted) {
          const rawAll = [...(res.data.featured || []), ...(res.data.apps || []), ...(res.data.trending || [])];
          const all = rawAll.map(a => ({ ...a, version: "v2026 Latest" }));
          
          setAllStoreApps(all);
          localStorage.setItem("yono_apps_perm_cache", JSON.stringify(
