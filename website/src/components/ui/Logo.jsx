import { BRAND, LOGO_SRC } from "../../constants/brand";

/** Horizontal wordmark — size by width. */
const WIDTH = {
  sm: "w-32",
  md: "w-44",
  lg: "w-52",
  xl: "w-56"
};

/** Full lockup — do not add separate text beside it. */
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
