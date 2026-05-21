/**
 * Optional floating actions in the top-right (dashboard customize, report actions, etc.).
 */
export default function CompactToolbar({ children, className = "" }) {
  if (!children) return null;
  return (
    <div
      className={`pointer-events-none absolute right-0 top-0 z-10 flex justify-end print:hidden ${className}`}
    >
      <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-2">
        {children}
      </div>
    </div>
  );
}
