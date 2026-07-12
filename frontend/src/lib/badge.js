// Resolve the tag/badge to show on an app card.
// If admin set an explicit badge, use it; otherwise auto-derive.
const STYLES = {
  Hot: { label: "HOT", color: "#FF6B35", bg: "#FFF3ED" },
  New: { label: "NEW", color: "#22C55E", bg: "#F0FDF4" },
  Popular: { label: "POPULAR", color: "#229ED9", bg: "#E8F6FD" },
  Trending: { label: "TRENDING", color: "#EC4899", bg: "#FDF2F8" },
};

export const getBadge = (app) => {
  if (!app) return null;
  let key = app.badge && app.badge !== "Auto" && app.badge !== "None" ? app.badge : null;
  if (app.badge === "None") return null;
  if (!key) {
    // Auto rules
    if (app.trending) key = "Hot";
    else if ((app.downloads || 0) >= 1_000_000) key = "Popular";
    else key = "New";
  }
  return STYLES[key] || null;
};
