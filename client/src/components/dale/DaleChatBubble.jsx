import DaleAvatar from "./DaleAvatar";

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export default function DaleChatBubble({ content, timestamp, isFarmer = false }) {
  if (isFarmer) {
    return (
      <div className="mb-4 flex justify-end">
        <div className="max-w-[80%] rounded-xl rounded-tr-none bg-fm-teal px-4 py-4 text-white">
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
      <div className="max-w-[80%] rounded-xl rounded-tl-none border-l-[3px] border-fm-teal bg-fm-cream px-4 py-4">
        <p className="whitespace-pre-wrap text-base leading-relaxed text-fm-charcoal">{content}</p>
        {timestamp && (
          <p className="mt-2 text-xs text-fm-gray-medium">{formatTime(timestamp)}</p>
        )}
      </div>
    </div>
  );
}
