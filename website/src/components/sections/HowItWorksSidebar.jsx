import { BRAND } from "../../constants/brand";

export default function HowItWorksSidebar() {
  return (
    <div className="mt-10 hidden rounded-2xl border border-fm-gray-light bg-fm-cream p-8 lg:block">
      <p className="text-xs font-bold uppercase tracking-wider text-fm-teal">Example snapshot</p>
      <p className="font-display mt-2 text-3xl font-bold text-fm-alert">+$22/ac</p>
      <p className="text-sm text-fm-charcoal">above regional avg on fertilizer</p>
      <dl className="mt-6 space-y-3 border-t border-fm-gray-light pt-6 text-sm">
        <div className="flex justify-between">
          <dt className="text-fm-gray-medium">Your fertilizer</dt>
          <dd className="font-bold">$209/ac</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-fm-gray-medium">MU Extension avg</dt>
          <dd className="font-bold text-fm-teal">$187/ac</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-fm-gray-medium">1,200-acre farm</dt>
          <dd className="font-bold text-fm-alert">~$26,400 at stake</dd>
        </div>
      </dl>
      <p className="mt-6 text-xs text-fm-gray-medium">{BRAND.attribution.benchmark}</p>
    </div>
  );
}
