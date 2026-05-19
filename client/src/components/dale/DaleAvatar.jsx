import { DALE_COPY, DALE_VARIANTS } from "../../constants/dale";

const SIZE_CLASSES = {
  xs: "h-8 w-8",
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
  "2xl": "h-32 w-32"
};

const FULL_BODY_VARIANTS = new Set(["sitting", "standing", "analyzing", "waving"]);

export default function DaleAvatar({
  variant = "avatar",
  size = "md",
  showName = false,
  pulse = false,
  className = ""
}) {
  const src = DALE_VARIANTS[variant] || DALE_VARIANTS.avatar;
  const isCircle = variant === "avatar";
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  return (
    <figure className={`flex flex-col items-center gap-1 ${className}`}>
      <div
        className={`relative ${pulse ? "animate-dale-pulse" : ""} ${
          isCircle ? "rounded-full overflow-hidden" : ""
        }`}
      >
        <img
          src={src}
          alt={DALE_COPY.name}
          className={`object-contain ${
            FULL_BODY_VARIANTS.has(variant) ? "h-auto w-auto max-h-48" : `${sizeClass} object-cover`
          }`}
        />
      </div>
      {showName && (
        <figcaption className="font-display text-sm font-bold text-fm-teal">{DALE_COPY.name}</figcaption>
      )}
    </figure>
  );
}
