import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api, { resolveUrl } from "@/lib/api";

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(null);

    const load = useCallback(async () => {
        try {
            const { data } = await api.get("/settings");
            setSettings(data);
        } catch (e) {
            setSettings({});
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    // Apply theme + SEO whenever settings change
    useEffect(() => {
        if (!settings) return;
        const root = document.documentElement;
        if (settings.theme?.primary) root.style.setProperty("--gold", settings.theme.primary);
        if (settings.theme?.secondary) root.style.setProperty("--gold-dark", settings.theme.secondary);

        const seo = settings.seo || {};
        if (seo.meta_title) document.title = seo.meta_title;
        const setMeta = (name, content, attr = "name") => {
            if (!content) return;
            let el = document.querySelector(`meta[${attr}="${name}"]`);
            if (!el) {
                el = document.createElement("meta");
                el.setAttribute(attr, name);
                document.head.appendChild(el);
            }
            el.setAttribute("content", content);
        };
        setMeta("description", seo.meta_description);
        setMeta("keywords", seo.keywords);
        setMeta("og:title", seo.meta_title, "property");
        setMeta("og:description", seo.meta_description, "property");
        if (seo.og_image) setMeta("og:image", resolveUrl(seo.og_image), "property");

        if (settings.branding?.favicon_url) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement("link");
                link.rel = "icon";
                document.head.appendChild(link);
            }
            link.href = resolveUrl(settings.branding.favicon_url);
        }
    }, [settings]);

    return (
        <SettingsContext.Provider value={{ settings, refreshSettings: load }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);

// Helper: is a section enabled?
export const sectionEnabled = (settings, id) => {
    const s = (settings?.sections || []).find((x) => x.id === id);
    return s ? s.enabled : true;
};
