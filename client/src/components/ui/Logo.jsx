import { BRAND, LOGO_SRC } from "../../constants/brand";

/** Horizontal wordmark — size by width (brand minimum 120px). */
const WIDTH = {
  sm: "w-32", // 128px
  md: "w-40", // 160px
  lg: "w-48", // 192px
  xl: "w-56" // 224px
};

export default function Logo({ size = "md", onDark = false, className = "" }) {
  return (
    <img
      src={LOGO_SRC}
      alt={BRAND.name}
      className={`h-auto max-w-full object-contain ${WIDTH[size] || WIDTH.md} ${
        onDark ? "brightness-0 invert" : ""
      } ${className}`}
    />
  );
}
