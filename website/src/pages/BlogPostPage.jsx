import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import BlogCard from "../components/blog/BlogCard";
import BlogPostBody from "../components/blog/BlogPostBody";
import {
  formatPostDate,
  getCategoryForPost,
  getPostBySlug,
  getRelatedPosts,
  getTagsForPost
} from "../lib/blog";

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  useEffect(() => {
    if (post) {
      document.title = post.seo?.title || `${post.title} | Fieldmark Blog`;
    }
    return () => {
      document.title = "Fieldmark — Know your margins before March";
    };
  }, [post]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const category = getCategoryForPost(post);
  const tags = getTagsForPost(post);
  const related = getRelatedPosts(post);

  return (
    <div className="min-h-screen bg-fm-cream">
      <Header />

      <main className="pt-20">
        <article>
          <div className="relative overflow-hidden bg-fm-gray-dark">
            <img
              src={post.heroImage}
              alt={post.heroImageAlt || post.title}
              className="absolute inset-0 h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-fm-gray-dark via-fm-gray-dark/80 to-fm-gray-dark/40" />
            <div className="relative mx-auto max-w-4xl px-6 py-16 lg:px-8 lg:py-24">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-sm font-bold text-white/80 transition hover:text-white"
              >
                <ArrowLeft size={16} aria-hidden />
                Back to blog
              </Link>

              <div className="mt-8 flex flex-wrap items-center gap-2">
                {category && (
                  <Link
                    to={`/blog?category=${category.slug}`}
                    className="rounded-full bg-fm-teal px-3 py-1 text-xs font-bold uppercase tracking-wide text-white"
                  >
                    {category.label}
                  </Link>
                )}
              </div>

              <h1 className="mt-6 font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                {post.title}
              </h1>
              <p className="mt-4 max-w-3xl text-lg text-white/85">{post.excerpt}</p>

              <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-white/70">
                <span className="inline-flex items-center gap-2">
                  <User size={16} aria-hidden />
                  {post.author.name}
                  {post.author.role ? ` · ${post.author.role}` : ""}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Calendar size={16} aria-hidden />
                  {formatPostDate(post.publishedAt)}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock size={16} aria-hidden />
                  {post.readTimeMinutes} min read
                </span>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
            {tags.length > 0 && (
              <div className="mx-auto mb-10 flex max-w-3xl flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    to={`/blog?tag=${tag.id}`}
                    className="rounded-md bg-white px-3 py-1.5 text-xs font-bold text-fm-charcoal shadow-sm ring-1 ring-fm-gray-medium/15 hover:bg-fm-teal/10 hover:text-fm-teal-dark"
                  >
                    #{tag.label}
                  </Link>
                ))}
              </div>
            )}

            <BlogPostBody blocks={post.content} />
          </div>
        </article>

        {related.length > 0 && (
          <section className="border-t border-fm-gray-medium/15 bg-white/50 py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <h2 className="font-display text-2xl font-bold text-fm-gray-dark">Related articles</h2>
              <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <BlogCard key={item.slug} post={item} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
