import { DALE_COPY } from "../../constants/dale";
import DaleAvatar from "./DaleAvatar";
import DaleDisclaimer from "./DaleDisclaimer";

export default function DaleWelcome({ onContinue }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-10 text-center">
      <DaleAvatar variant="waving" size="xl" showName />
      <h1 className="font-display mt-4 text-4xl font-bold">{DALE_COPY.welcome.title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-fm-charcoal">{DALE_COPY.welcome.message}</p>
      {onContinue && (
        <button
          type="button"
          onClick={onContinue}
          className="mt-8 rounded-lg bg-fm-teal px-8 py-3 font-bold text-white transition-colors duration-200 hover:bg-fm-teal-hover"
        >
          Get started
        </button>
      )}
      <DaleDisclaimer className="mt-8 max-w-md" />
    </div>
  );
}
