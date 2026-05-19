import { DALE_COPY } from "../../constants/dale";
import DaleAvatar from "./DaleAvatar";

export default function DaleEmptyState({ onAddField }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <DaleAvatar variant="sitting" size="xl" />
      <p className="mt-6 max-w-md text-base leading-relaxed text-fm-charcoal">
        {DALE_COPY.emptyState.message}
      </p>
      <button
        type="button"
        onClick={onAddField}
        className="mt-6 rounded-lg bg-fm-teal px-6 py-3 text-base font-bold text-white transition-colors duration-200 hover:bg-fm-teal-hover"
      >
        {DALE_COPY.emptyState.cta}
      </button>
    </div>
  );
}
