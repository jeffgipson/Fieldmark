import { BRAND, LOGO_SRC } from "../../constants/brand";

/** Horizontal wordmark — size by width (brand minimum 120px). */
const WIDTH = {
  sm: "w-32",
  md: "w-40",
  lg: "w-48",
  xl: "w-56"
};

export default function Logo({ size = "md", onDark = false, className = "" }) {
  return (
    <img
      src={LOGO_SRC}
      alt={BRAND.name}
      className={`h-auto max-w-full shrink-0 object-contain object-left ${WIDTH[size] || WIDTH.md} ${
        onDark ? "brightness-0 invert" : ""
      } ${className}`}
    />
  );
}
