export default function HowItWorksSidebar() {
  return (
    <div className="mt-10 hidden rounded-2xl border border-fm-gray-light bg-fm-cream p-8 lg:block">
      <p className="text-xs font-bold uppercase tracking-wider text-fm-teal">Example snapshot</p>
      <p className="font-display mt-2 text-3xl font-bold text-fm-alert">-$42/ac</p>
      <p className="text-sm text-fm-charcoal">margin in downside scenario</p>
      <dl className="mt-6 space-y-3 border-t border-fm-gray-light pt-6 text-sm">
        <div className="flex justify-between">
          <dt className="text-fm-gray-medium">Base case margin</dt>
          <dd className="font-bold text-fm-success">$118/ac</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-fm-gray-medium">Downside margin</dt>
          <dd className="font-bold text-fm-alert">$76/ac</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-fm-gray-medium">1,200-acre farm</dt>
          <dd className="font-bold text-fm-charcoal">~$50,400 swing</dd>
        </div>
      </dl>
    </div>
  );
}
