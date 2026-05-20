import { useEffect } from "react";

const OVERLAY_PLACEMENT = {
  viewport: "fixed inset-0",
  mainPanel: "fixed inset-y-0 right-0 left-64",
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  className = "",
  placement = "viewport",
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`${OVERLAY_PLACEMENT[placement]} z-50 flex items-center justify-center bg-fm-gray-dark/50 p-4`}
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "fm-modal-title" : undefined}
        className={`max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-fm-gray-light bg-white px-6 py-4">
            <h2 id="fm-modal-title" className="font-display text-xl font-semibold text-fm-ink">
              {title}
            </h2>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-2 py-1 text-fm-gray-medium hover:bg-fm-gray-light/80 hover:text-fm-charcoal"
                aria-label="Close"
              >
                ✕
              </button>
            )}
          </header>
        )}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
