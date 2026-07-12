import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LEGAL_SECTIONS } from "@/lib/legal";
import { useSettings } from "@/context/SettingsContext";

export const LegalDialog = ({ openId, onClose }) => {
  const { settings } = useSettings();
  const fallback = LEGAL_SECTIONS.find((s) => s.id === openId);
  const override = settings?.legal?.[openId];
  const title = override?.title || fallback?.title;
  const body = override?.body || fallback?.body;

  return (
    <Dialog open={!!openId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-[440px] overflow-hidden rounded-[22px]">
        <DialogHeader>
          <DialogTitle className="font-display text-[#111111]">{title}</DialogTitle>
          <DialogDescription className="sr-only">Legal information</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-3">
          <p className="whitespace-pre-line text-sm leading-relaxed text-[#555555]">{body}</p>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default LegalDialog;
