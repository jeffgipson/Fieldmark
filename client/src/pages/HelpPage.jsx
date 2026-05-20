import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import { BRAND } from "../constants/brand";

const FAQ = [
  {
    q: "How do I enter input costs?",
    a: "Go to My Farm, select a field, and enter per-acre seed, fertilizer, chemicals, and other costs for the current season. Save each field before running your margin model."
  },
  {
    q: "What do peer benchmarks show?",
    a: "After you run a scenario, open Benchmarks to compare your costs against anonymized peer farms in your region and MU Extension planning budgets. Dollar totals use mapped field acres."
  },
  {
    q: "How does the lender report work?",
    a: "From Reports, generate a lender-ready summary. Dale drafts it in the background — keep the API jobs worker running locally (cd api && bin/jobs). You can email or print the completed report."
  },
  {
    q: "Why don't my field acres match my farm profile?",
    a: "Your farm profile acres are what you declare for the whole operation. Mapped acres are the sum of individual fields. Add remaining fields or update your profile so totals reconcile."
  },
  {
    q: "Who is Dale?",
    a: "D.A.L.E. — Data Analytics for Land Economics — is Fieldmark's independent analyst with no ties to input vendors. Use Talk to Dale for plain-language help interpreting your margins, benchmarks, and downside scenarios."
  }
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow="Support"
        title="Help & support"
        subtitle="Quick answers before you talk to us"
      />

      <div className="space-y-4">
        {FAQ.map((item) => (
          <Card key={item.q}>
            <h2 className="font-display text-base font-semibold text-fm-ink">{item.q}</h2>
            <p className="mt-2 text-sm leading-relaxed text-fm-charcoal">{item.a}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <p className="text-sm text-fm-charcoal">
          Still stuck? Email us at{" "}
          <a
            href={`mailto:${BRAND.contact.supportEmail}?subject=${encodeURIComponent(`${BRAND.name} support`)}`}
            className="font-bold text-fm-teal hover:underline"
          >
            {BRAND.contact.supportEmail}
          </a>
          .
        </p>
        <Link to="/dashboard" className="mt-4 inline-block text-sm font-bold text-fm-teal hover:underline">
          Back to dashboard →
        </Link>
      </Card>
    </div>
  );
}
