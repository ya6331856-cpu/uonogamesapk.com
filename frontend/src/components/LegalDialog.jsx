import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LEGAL_SECTIONS } from "@/lib/legal";

export const LegalDialog = ({ openId, onClose }) => {
  const section = LEGAL_SECTIONS.find((s) => s.id === openId);
  return (
    <Dialog open={!!openId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-[440px] overflow-hidden rounded-[22px]">
        <DialogHeader>
          <DialogTitle className="font-display text-[#111111]">{section?.title}</DialogTitle>
          <DialogDescription className="sr-only">Legal information</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-3">
          <p className="text-sm leading-relaxed text-[#555555]">{section?.body}</p>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default LegalDialog;
