import { BRAND, LOGO_SRC } from "../../constants/brand";

/** Horizontal lockup — size by width (brand minimum 120px). */
const WIDTH = {
  sm: "w-32", // 128px — footer
  md: "w-44", // 176px — header default
  lg: "w-52", // 208px — hero / prominent
  xl: "w-56" // 224px
};

/** Full lockup (icon + wordmark) — do not add separate text beside it. */
export default function Logo({ size = "md", onDark = false, className = "" }) {
  return (
    <img
      src={LOGO_SRC}
      alt={BRAND.name}
      className={[
        "h-auto max-w-full shrink-0 object-contain object-left",
        WIDTH[size] || WIDTH.md,
        onDark ? "brightness-0 invert" : "",
        className
      ].join(" ")}
    />
  );
}
