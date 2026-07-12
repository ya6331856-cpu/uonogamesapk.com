import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import api from "@/lib/api";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

export const FaqSection = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/faqs")
      .then((res) => setFaqs(res.data))
      .catch(() => setFaqs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section data-testid="faq-section" className="space-y-3">
      <div className="flex items-center gap-2">
        <HelpCircle className="h-4 w-4 text-[#FFC107]" />
        <h2 className="font-display text-base font-bold text-[#111111]">Frequently Asked Questions</h2>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shimmer h-14 rounded-[18px]" />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4 }}
        >
          <Accordion type="single" collapsible className="space-y-2.5">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                data-testid={`faq-item-${faq.id}`}
                className="overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white px-4 shadow-[0_6px_20px_rgba(0,0,0,0.03)]"
              >
                <AccordionTrigger className="py-3.5 text-left font-display text-sm font-semibold text-[#111111] hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm leading-relaxed text-[#555555]">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      )}
    </section>
  );
};

export default FaqSection;
