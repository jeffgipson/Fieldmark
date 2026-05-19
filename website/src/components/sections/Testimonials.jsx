import { Quote } from "lucide-react";

const STORIES = [
  {
    name: "Maria, Vineyard Manager",
    location: "Napa Valley, CA",
    crop: "Premium wine grapes",
    quote:
      "Water costs are everything. Fieldmark helped us model the impact of a dry year and gave us the data we needed to justify a new irrigation system to our investors. It paid for itself in one season."
  },
  {
    name: "John, Grain Operator",
    location: "Midwest USA",
    crop: "Corn & specialty soybeans",
    quote:
      "I was skeptical, but benchmarking my input costs against other operators my size—not just my local co-op's prices—was an eye-opener. We identified a 12% savings on fertilizer without sacrificing yield."
  },
  {
    name: "David, Cattle Rancher",
    location: "Queensland, AU",
    crop: "Beef cattle operation",
    quote:
      "We use Fieldmark to track and forecast our feed costs across multiple properties. The scenario planning is powerful. It's the first tool I've seen that's built for the business side of running a complex livestock operation."
  }
];

export default function Testimonials() {
  return (
    <section id="stories" className="bg-fm-cream py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-fm-teal">From the Field</p>
          <h2 className="font-display mt-3 text-3xl font-bold sm:text-4xl">
            How operators are building resilient farms
          </h2>
        </div>

        <div className="mx-auto mt-16 grid max-w-lg gap-8 lg:max-w-none lg:grid-cols-3">
          {STORIES.map((story) => (
            <blockquote
              key={story.name}
              className="flex flex-col rounded-2xl border border-fm-gray-light bg-white p-8 shadow-fm-card"
            >
              <Quote className="text-fm-teal/40" size={32} />
              <p className="mt-4 flex-1 text-fm-charcoal">&ldquo;{story.quote}&rdquo;</p>
              <footer className="mt-8 border-t border-fm-gray-light pt-6">
                <p className="font-display font-semibold text-fm-gray-dark">{story.name}</p>
                <p className="mt-1 text-sm text-fm-gray-medium">{story.location}</p>
                <p className="text-sm text-fm-teal">{story.crop}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
