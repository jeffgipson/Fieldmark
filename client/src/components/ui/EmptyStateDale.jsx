import DaleAvatar from "../dale/DaleAvatar";
import Button from "./Button";

export default function EmptyStateDale({ message, ctaLabel, onCta }) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <DaleAvatar variant="sitting" size="xl" />
      <p className="mt-6 max-w-md text-lg leading-relaxed text-fm-charcoal">{message}</p>
      {ctaLabel && onCta && (
        <Button className="mt-6" onClick={onCta}>
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
