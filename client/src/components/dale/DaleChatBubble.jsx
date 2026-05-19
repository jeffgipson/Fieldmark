import DaleAvatar from "./DaleAvatar";
import MarkdownContent from "../ui/MarkdownContent";

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function hasMarkdownTable(content) {
  if (!content) return false;
  const lines = content.split("\n");
  return lines.some((line, i) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) return false;
    const next = lines[i + 1]?.trim() || "";
    return /^\|[\s\-:|]+\|$/.test(next);
  });
}

export default function DaleChatBubble({ content, timestamp, isFarmer = false }) {
  if (isFarmer) {
    return (
      <div className="mb-4 flex justify-end">
        <div className="max-w-[85%] rounded-xl rounded-tr-none bg-fm-teal px-4 py-4 text-white">
          <p className="whitespace-pre-wrap text-base leading-relaxed">{content}</p>
          {timestamp && (
            <p className="mt-2 text-right text-xs text-white/80">{formatTime(timestamp)}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 flex gap-3">
      <DaleAvatar variant="avatar" size="sm" className="mt-1 shrink-0" />
      <div className="min-w-0 max-w-[calc(100%-2.75rem)] flex-1 rounded-xl rounded-tl-none border-l-[3px] border-fm-teal bg-fm-cream px-4 py-4">
        <MarkdownContent
          content={content}
          collapsible={!hasMarkdownTable(content)}
          compact
        />
        {timestamp && (
          <p className="mt-3 text-xs text-fm-gray-medium">{formatTime(timestamp)}</p>
        )}
      </div>
    </div>
  );
}
