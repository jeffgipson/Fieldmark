import { Link } from "react-router-dom";
import { Calendar, Clock } from "lucide-react";
import { formatPostDate, getCategoryForPost, getTagsForPost } from "../../lib/blog";

export default function BlogCard({ post, featured = false }) {
  const category = getCategoryForPost(post);
  const tags = getTagsForPost(post);

  return (
    <article
      className={[
        "blog-card group flex h-full flex-col overflow-hidden rounded-2xl border border-fm-gray-medium/15 bg-white shadow-fm-card transition hover:-translate-y-0.5 hover:shadow-fm-elevated",
        featured ? "lg:flex-row lg:items-stretch" : ""
      ].join(" ")}
    >
      <Link
        to={`/blog/${post.slug}`}
        className={[
          "block shrink-0 overflow-hidden bg-fm-gray-light",
          featured ? "lg:w-1/2" : "aspect-[16/9]"
        ].join(" ")}
      >
        <img
          src={post.heroImage}
          alt={post.heroImageAlt || post.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          loading="lazy"
        />
      </Link>

      <div className={["flex flex-1 flex-col p-6", featured ? "lg:p-8" : ""].join(" ")}>
        <div className="flex flex-wrap items-center gap-2">
          {category && (
            <Link
              to={`/blog?category=${category.slug}`}
              className="rounded-full bg-fm-teal/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-fm-teal-dark hover:bg-fm-teal/15"
            >
              {category.label}
            </Link>
          )}
          {featured && (
            <span className="rounded-full bg-fm-gold/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-fm-gray-dark">
              Featured
            </span>
          )}
        </div>

        <Link to={`/blog/${post.slug}`} className="mt-4 block flex-1">
          <h2
            className={[
              "font-display font-bold text-fm-gray-dark transition group-hover:text-fm-teal-dark",
              featured ? "text-2xl lg:text-3xl" : "text-xl"
            ].join(" ")}
          >
            {post.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-fm-charcoal">{post.excerpt}</p>
        </Link>

        <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-fm-charcoal/70">
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={14} aria-hidden />
            {formatPostDate(post.publishedAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={14} aria-hidden />
            {post.readTimeMinutes} min read
          </span>
        </div>

        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <Link
                key={tag.id}
                to={`/blog?tag=${tag.id}`}
                className="rounded-md bg-fm-gray-light px-2 py-1 text-[11px] font-bold text-fm-charcoal/80 hover:bg-fm-teal/10 hover:text-fm-teal-dark"
              >
                #{tag.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
