import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import api, { resolveUrl } from "@/lib/api";

export const ReviewsSection = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api.get("/reviews").then((r) => setReviews(r.data)).catch(() => setReviews([]));
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section data-testid="reviews-section" className="space-y-3">
      <div className="flex items-center gap-2">
        <Quote className="h-4 w-4 text-[#FFC107]" />
        <h2 className="font-display text-base font-bold text-[#111111]">What Users Say</h2>
        <span className="h-px flex-1 bg-gradient-to-r from-[#FFC107]/40 to-transparent" />
      </div>
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {reviews.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.3) }}
            data-testid={`review-${r.id}`}
            className="w-[260px] shrink-0 rounded-[18px] border border-[#E5E7EB] bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.03)]"
          >
            <div className="flex items-center gap-2.5">
              {r.photo_url ? (
                <img src={resolveUrl(r.photo_url)} alt={r.name} className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#FFC107] to-[#FFB300] font-display text-sm font-bold text-white">
                  {r.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-display text-sm font-semibold text-[#111111]">{r.name}</p>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className={`h-3 w-3 ${s < r.rating ? "fill-[#FFC107] text-[#FFC107]" : "text-[#E5E7EB]"}`} />
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-[#555555]">{r.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ReviewsSection;
