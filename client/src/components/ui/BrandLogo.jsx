import { useState } from "react";

const SIZE_CLASSES = {
  sm: { box: "h-10 w-10", img: "h-7 w-7", wordmarkBox: "h-10 min-w-[5.5rem] px-2", wordmarkImg: "h-7 w-auto max-w-full", stackedBox: "h-12 w-12", stackedImg: "h-10 w-10", icon: 18 },
  md: { box: "h-11 w-11", img: "h-8 w-8", wordmarkBox: "h-11 min-w-[6.25rem] px-2.5", wordmarkImg: "h-8 w-auto max-w-full", stackedBox: "h-14 w-14", stackedImg: "h-12 w-12", icon: 22 },
  lg: { box: "h-14 w-14", img: "h-10 w-10", wordmarkBox: "h-14 min-w-[7.5rem] px-3", wordmarkImg: "h-10 w-auto max-w-full", stackedBox: "h-16 w-16", stackedImg: "h-14 w-14", icon: 26 }
};

export default function BrandLogo({ logoUrl, icon: Icon, size = "md", fit = "square", className = "" }) {
  const [failed, setFailed] = useState(false);
  const dims = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const wordmark = fit === "wordmark";
  const stacked = fit === "stacked";
  const tileBox = stacked ? dims.stackedBox : wordmark ? dims.wordmarkBox : dims.box;
  const tileImg = stacked ? dims.stackedImg : wordmark ? dims.wordmarkImg : dims.img;

  if (!logoUrl || failed) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-xl bg-fm-teal/10 text-fm-teal ${tileBox} ${className}`}
      >
        <Icon size={dims.icon} strokeWidth={1.75} aria-hidden />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-fm-gray-light/80 bg-white ${
        wordmark ? `${dims.wordmarkBox} py-1` : stacked ? `${dims.stackedBox} p-1` : `${dims.box} p-1.5`
      } ${className}`}
    >
      <img
        src={logoUrl}
        alt=""
        className={`${tileImg} object-contain`}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
