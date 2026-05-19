import { DALE_COPY } from "../../constants/dale";

export default function DaleDisclaimer({ className = "" }) {
  return (
    <p
      className={`text-fm-gray-medium text-xs leading-relaxed ${className}`}
      role="note"
    >
      {DALE_COPY.disclaimer}
    </p>
  );
}
