import { Megaphone } from "lucide-react";

export const AnnouncementBar = ({ config }) => {
  if (!config?.enabled || !config?.text) return null;
  const content = (
    <div className="flex items-center justify-center gap-2 px-4 py-2 text-center">
      <Megaphone className="h-3.5 w-3.5 shrink-0 text-[#111111]" />
      <span className="text-xs font-semibold text-[#111111]">{config.text}</span>
    </div>
  );
  return (
    <div data-testid="announcement-bar" className="bg-gradient-to-r from-[#FFC107] to-[#FFB300]">
      {config.link ? (
        <a href={config.link} target="_blank" rel="noopener noreferrer">{content}</a>
      ) : (
        content
      )}
    </div>
  );
};

export default AnnouncementBar;
