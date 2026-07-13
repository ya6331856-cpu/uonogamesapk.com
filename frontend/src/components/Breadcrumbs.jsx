import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Visible breadcrumb trail. JSON-LD BreadcrumbList is handled in SEOHead.
 * items: [{name, url}]  — last item is the current page (not linked).
 */
export default function Breadcrumbs({ items = [] }) {
  if (!items.length) return null;
  return (
    <nav
      aria-label="Breadcrumb"
      data-testid="breadcrumbs"
      className="flex items-center gap-1 overflow-x-auto py-1 text-[11px] font-medium text-[#777777]"
    >
      <Link to="/" className="flex items-center gap-1 hover:text-[#111]">
        <Home className="h-3 w-3" />
        <span>Home</span>
      </Link>
      {items.map((b, i) => (
        <span key={i} className="flex items-center gap-1 whitespace-nowrap">
          <ChevronRight className="h-3 w-3 text-[#BBB]" />
          {i === items.length - 1 ? (
            <span aria-current="page" className="truncate text-[#111] max-w-[180px]">
              {b.name}
            </span>
          ) : (
            <Link to={b.url} className="truncate hover:text-[#111] max-w-[140px]">
              {b.name}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
