import { DALE_COPY } from "../../constants/dale";
import DaleAvatar from "../dale/DaleAvatar";

export default function LoadingDale({ message = DALE_COPY.loading, inline = false }) {
  const wrapper = inline
    ? "flex items-center gap-3 py-4"
    : "flex flex-col items-center justify-center py-12 text-center";

  return (
    <div className={wrapper}>
      <DaleAvatar variant="analyzing" size={inline ? "md" : "lg"} pulse />
      <p className="text-base text-fm-charcoal">{message}</p>
    </div>
  );
}
