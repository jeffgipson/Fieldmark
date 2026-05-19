import { DALE_COPY } from "../../constants/dale";
import DaleAvatar from "../dale/DaleAvatar";

function BlinkingBubble({ message }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className="max-w-[80%] rounded-xl rounded-tl-none border-l-[3px] border-fm-teal bg-fm-cream px-4 py-4 animate-fm-shimmer"
    >
      <p className="text-base leading-relaxed text-fm-charcoal">{message}</p>
    </div>
  );
}

export default function LoadingDale({
  message = DALE_COPY.loading,
  variant = "page",
  inline = false
}) {
  const resolvedVariant = inline ? "chat" : variant;

  if (resolvedVariant === "chat") {
    return (
      <div className="mb-4 flex gap-3">
        <DaleAvatar variant="avatar" size="sm" className="mt-1 shrink-0" />
        <BlinkingBubble message={message} />
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <DaleAvatar variant="avatar" size="md" className="mb-3" />
      <p className="animate-fm-shimmer text-base text-fm-charcoal">{message}</p>
    </div>
  );
}
