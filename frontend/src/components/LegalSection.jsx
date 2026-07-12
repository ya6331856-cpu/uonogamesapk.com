import { motion } from "framer-motion";
import {
  ShieldAlert, FileText, Copyright, Lock, ScrollText,
  Scale, Mail, HeartHandshake, AlertTriangle, Cookie, ChevronRight,
} from "lucide-react";
import { LEGAL_SECTIONS } from "@/lib/legal";

const ICONS = {
  "website-disclaimer": ShieldAlert,
  "apk-disclaimer": FileText,
  "copyright": Copyright,
  "privacy-policy": Lock,
  "terms": ScrollText,
  "dmca": Scale,
  "contact": Mail,
  "responsible-use": HeartHandshake,
  "age-notice": AlertTriangle,
  "cookies": Cookie,
};

export const LegalSection = ({ onOpen }) => (
  <section data-testid="legal-section" className="space-y-3">
    <div className="flex items-center gap-2">
      <Scale className="h-4 w-4 text-[#FFC107]" />
      <h2 className="font-display text-base font-bold text-[#111111]">Legal Information</h2>
    </div>

    <div className="grid grid-cols-2 gap-2.5">
      {LEGAL_SECTIONS.map((s, i) => {
        const Icon = ICONS[s.id] || FileText;
        return (
          <motion.button
            key={s.id}
            data-testid={`legal-card-${s.id}`}
            onClick={() => onOpen(s.id)}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.3) }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2.5 rounded-[18px] border border-[#E5E7EB] bg-white p-3 text-left shadow-[0_6px_20px_rgba(0,0,0,0.03)] transition-colors duration-200 hover:border-[#FFC107]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#FFF8E1]">
              <Icon className="h-4 w-4 text-[#FFB300]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-display text-[13px] font-semibold leading-tight text-[#111111]">
                {s.title}
              </span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-[#CCCCCC]" />
          </motion.button>
        );
      })}
    </div>
  </section>
);

export default LegalSection;
