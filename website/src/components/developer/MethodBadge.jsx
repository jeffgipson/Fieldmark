const STYLES = {
  GET: "bg-emerald-100 text-emerald-800 border-emerald-200",
  POST: "bg-sky-100 text-sky-800 border-sky-200",
  PATCH: "bg-amber-100 text-amber-900 border-amber-200",
  PUT: "bg-amber-100 text-amber-900 border-amber-200",
  DELETE: "bg-red-100 text-red-800 border-red-200"
};

export default function MethodBadge({ method }) {
  const style = STYLES[method] || "bg-fm-gray-light text-fm-charcoal border-fm-gray-medium/30";
  return (
    <span
      className={`inline-flex min-w-[4.5rem] justify-center rounded border px-2 py-0.5 font-mono text-xs font-bold tracking-wide ${style}`}
    >
      {method}
    </span>
  );
}
