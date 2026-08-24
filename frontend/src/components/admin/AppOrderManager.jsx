import { useCallback, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GripVertical, ChevronUp, ChevronDown, Pin, PinOff, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import api, { resolveUrl } from "@/lib/api";

/**
 * Drag-and-drop reordering + pinning for the homepage app list.
 *
 * Implementation notes
 * --------------------
 * Uses the native HTML5 drag-and-drop API rather than pulling in @dnd-kit.
 * That keeps the dependency tree untouched (this project is on React 19,
 * where several DnD libraries are still catching up) but native DnD does NOT
 * fire on touch devices — so every drag action is also reachable through the
 * up/down buttons, which work on mobile and via keyboard. The admin panel is
 * realistically used from a phone, so the buttons are the primary path and
 * dragging is the desktop convenience.
 *
 * Saving is optimistic with rollback: the list reorders instantly, and if the
 * PATCH fails the previous order is restored so the UI can never silently
 * disagree with the database.
 */
export default function AppOrderManager({ apps, onReordered }) {
  const [items, setItems] = useState(() => sortForDisplay(apps));
  const [status, setStatus] = useState("idle"); // idle | saving | saved | error
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);
  const saveSeq = useRef(0);

  const pinnedCount = useMemo(() => items.filter((a) => a.pinned).length, [items]);

  const persist = useCallback(
    async (next, previous) => {
      setItems(next);
      setStatus("saving");
      const seq = ++saveSeq.current;
      try {
        await api.patch("/admin/apps/reorder", {
          items: next.map((a, i) => ({
            id: a.id,
            sort_order: i,
            pinned: !!a.pinned,
          })),
        });
        // Ignore a stale response if a newer save has already started.
        if (seq !== saveSeq.current) return;
        setStatus("saved");
        onReordered?.(next);
      } catch (err) {
        if (seq !== saveSeq.current) return;
        setItems(previous);
        setStatus("error");
        toast.error(err?.response?.data?.detail || "Could not save order — reverted.");
      }
    },
    [onReordered]
  );

  const move = (from, to) => {
    if (to < 0 || to >= items.length || from === to) return;
    const previous = items;
    const next = items.slice();
    const [row] = next.splice(from, 1);
    next.splice(to, 0, row);
    persist(reflowPinned(next), previous);
  };

  const togglePin = (id) => {
    const previous = items;
    const next = items.map((a) => (a.id === id ? { ...a, pinned: !a.pinned } : a));
    persist(reflowPinned(next), previous);
  };

  const handleDrop = (targetId) => {
    setDragId(null);
    setOverId(null);
    if (!dragId || dragId === targetId) return;
    const from = items.findIndex((a) => a.id === dragId);
    const to = items.findIndex((a) => a.id === targetId);
    move(from, to);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#DBEAFE] bg-[#F0F9FF] px-3 py-2.5">
        <p className="text-[11px] leading-snug text-[#555555]">
          Drag the handle to reorder, or use the arrows on mobile.{" "}
          <span className="font-semibold text-[#111111]">Pinned apps always sit at the top</span> of the homepage.
          {pinnedCount > 0 && ` (${pinnedCount} pinned)`}
        </p>
        <span className="shrink-0 text-[11px] font-semibold" aria-live="polite">
          {status === "saving" && (
            <span className="inline-flex items-center gap-1 text-[#777777]">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving…
            </span>
          )}
          {status === "saved" && (
            <span className="inline-flex items-center gap-1 text-[#22C55E]">
              <Check className="h-3 w-3" /> Order saved
            </span>
          )}
          {status === "error" && <span className="text-red-500">Not saved</span>}
        </span>
      </div>

      <ul className="space-y-2" data-testid="app-order-list">
        {items.map((app, index) => {
          const isDragging = dragId === app.id;
          const isOver = overId === app.id && dragId !== app.id;
          return (
            <motion.li
              key={app.id}
              layout
              draggable
              onDragStart={() => setDragId(app.id)}
              onDragEnd={() => {
                setDragId(null);
                setOverId(null);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setOverId(app.id);
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(app.id);
              }}
              data-testid={`order-row-${app.id}`}
              className={[
                "flex items-center gap-2.5 rounded-[16px] border bg-white p-2.5",
                isOver ? "border-[#FFC107] ring-2 ring-[#FFC107]/30" : "border-[#E5E7EB]",
                isDragging ? "opacity-40" : "opacity-100",
              ].join(" ")}
            >
              <span
                aria-hidden="true"
                className="cursor-grab touch-none px-0.5 text-[#BBBBBB] active:cursor-grabbing"
              >
                <GripVertical className="h-4 w-4" />
              </span>

              <span className="w-5 shrink-0 text-center text-[11px] font-bold text-[#999999]">
                {index + 1}
              </span>

              {app.icon_url ? (
                <img
                  src={resolveUrl(app.icon_url)}
                  alt=""
                  width={36}
                  height={36}
                  loading="lazy"
                  className="h-9 w-9 shrink-0 rounded-[10px] object-cover ring-1 ring-black/5"
                />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#FFC107] to-[#FFB300] font-display text-sm font-bold text-white">
                  {app.name?.charAt(0)}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-[13px] font-semibold text-[#111111]">
                  {app.name}
                </p>
                <p className="truncate text-[10px] text-[#999999]">{app.category}</p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => togglePin(app.id)}
                  aria-pressed={!!app.pinned}
                  aria-label={app.pinned ? `Unpin ${app.name}` : `Pin ${app.name} to top`}
                  data-testid={`pin-${app.id}`}
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    app.pinned
                      ? "bg-[#FFF8E1] text-[#FFB300]"
                      : "bg-[#F8F9FA] text-[#BBBBBB] hover:text-[#555555]",
                  ].join(" ")}
                >
                  {app.pinned ? <Pin className="h-3.5 w-3.5" /> : <PinOff className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => move(index, index - 1)}
                  disabled={index === 0}
                  aria-label={`Move ${app.name} up`}
                  data-testid={`move-up-${app.id}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8F9FA] text-[#555555] disabled:opacity-30"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, index + 1)}
                  disabled={index === items.length - 1}
                  aria-label={`Move ${app.name} down`}
                  data-testid={`move-down-${app.id}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8F9FA] text-[#555555] disabled:opacity-30"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

/** Mirror the backend ordering contract so the admin sees the real homepage order. */
function sortForDisplay(list) {
  return (list || []).slice().sort((a, b) => {
    const pa = a.pinned ? 0 : 1;
    const pb = b.pinned ? 0 : 1;
    if (pa !== pb) return pa - pb;
    const sa = Number(a.sort_order || 0);
    const sb = Number(b.sort_order || 0);
    if (sa !== sb) return sa - sb;
    return (b.created_at || "").localeCompare(a.created_at || "");
  });
}

/**
 * Pinned rows must stay above unpinned ones, otherwise the admin's list and the
 * rendered homepage disagree — you could drag an unpinned app to position 1 and
 * still see a pinned app there on the live site. Stable within each group.
 */
function reflowPinned(list) {
  const pinned = list.filter((a) => a.pinned);
  const rest = list.filter((a) => !a.pinned);
  return [...pinned, ...rest];
}
