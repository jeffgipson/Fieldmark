import { DALE_COPY } from "../../constants/dale";
import DaleAvatar from "./DaleAvatar";
import DaleDisclaimer from "./DaleDisclaimer";
import Button from "../ui/Button";
import Card from "../ui/Card";

export default function DaleBriefingCard({ findings = [], onTalkToDale }) {
  const bullets = findings.slice(0, 3);

  return (
    <Card variant="dale" className="!p-0 overflow-hidden">
      <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start">
        <DaleAvatar variant="analyzing" size="lg" className="shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="fm-eyebrow">Your review</p>
          <h3 className="font-display mt-1 text-xl font-semibold text-fm-ink">
            {DALE_COPY.briefingCard.header}
          </h3>
          {bullets.length > 0 ? (
            <ul className="mt-4 space-y-3 border-l-2 border-fm-gray-light pl-4">
              {bullets.map((item, index) => (
                <li key={index} className="text-base leading-relaxed text-fm-charcoal">
                  {typeof item === "string" ? item : item.text || item.summary}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-base text-fm-gray-medium">
              Run your scenario and Dale will highlight what matters before March.
            </p>
          )}
          {onTalkToDale && (
            <Button variant="secondary" className="mt-5 !py-2.5" onClick={onTalkToDale}>
              {DALE_COPY.briefingCard.cta}
            </Button>
          )}
          <DaleDisclaimer className="mt-4" />
        </div>
      </div>
    </Card>
  );
}
