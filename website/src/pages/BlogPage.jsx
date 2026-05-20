import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import BlogCard from "../components/blog/BlogCard";
import {
  getAllPosts,
  getCategories,
  getPostsByCategory,
  getPostsByTag,
  getTags,
  categoryPostCount
} from "../lib/blog";

export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const tagFilter = searchParams.get("tag");

  const categories = getCategories();
  const tags = getTags();

  const posts = useMemo(() => {
    if (tagFilter) return getPostsByTag(tagFilter);
    return getPostsByCategory(
      categories.find((c) => c.slug === categoryFilter)?.id ?? categoryFilter
    );
  }, [categoryFilter, tagFilter, categories]);

  const featured = useMemo(
    () => getAllPosts().filter((p) => p.featured).slice(0, 1)[0] ?? null,
    []
  );

  const gridPosts = useMemo(() => {
    const list = tagFilter || categoryFilter ? posts : posts.filter((p) => p.slug !== featured?.slug);
    return list;
  }, [posts, featured, tagFilter, categoryFilter]);

  useEffect(() => {
    document.title = "Fieldmark Blog — Know your margins before March";
    return () => {
      document.title = "Fieldmark — Know your margins before March";
    };
  }, []);

  const activeCategory = categories.find((c) => c.slug === categoryFilter);
  const activeTag = tags.find((t) => t.id === tagFilter);

  function setFilter(key, value) {
    const next = new URLSearchParams();
    if (value) next.set(key, value);
    setSearchParams(next);
  }

  function clearFilters() {
    setSearchParams({});
  }

  return (
    <div className="min-h-screen bg-fm-cream">
      <Header />

      <main className="pt-20">
        <section className="border-b border-fm-gray-medium/15 bg-fm-gray-dark text-white">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
            <p className="text-sm font-bold uppercase tracking-widest text-fm-gold">Before March</p>
            <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Fieldmark Blog</h1>
            <p className="mt-4 max-w-2xl text-lg text-white/80">
              Independent benchmarks, peer context, and plain-language margin planning for Missouri corn
              and soybean farmers — built from our content marketing plan and MU Extension 2026 data.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={clearFilters}
              className={[
                "rounded-full px-4 py-2 text-sm font-bold transition",
                !categoryFilter && !tagFilter
                  ? "bg-fm-teal text-white"
                  : "bg-white text-fm-charcoal hover:bg-fm-gray-light"
              ].join(" ")}
            >
              All posts
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilter("category", cat.slug)}
                className={[
                  "rounded-full px-4 py-2 text-sm font-bold transition",
                  categoryFilter === cat.slug
                    ? "bg-fm-teal text-white"
                    : "bg-white text-fm-charcoal hover:bg-fm-gray-light"
                ].join(" ")}
              >
                {cat.label}
                <span className="ml-1.5 opacity-70">({categoryPostCount(cat.id)})</span>
              </button>
            ))}
          </div>

          {(activeCategory || activeTag) && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <p className="text-sm text-fm-charcoal">
                Filtering by{" "}
                <strong>{activeCategory?.label || activeTag?.label}</strong>
                {" · "}
                {posts.length} {posts.length === 1 ? "post" : "posts"}
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-bold text-fm-teal-dark hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => setFilter("tag", tag.id)}
                className={[
                  "rounded-md px-2.5 py-1 text-xs font-bold transition",
                  tagFilter === tag.id
                    ? "bg-fm-gold/30 text-fm-gray-dark"
                    : "bg-white text-fm-charcoal/70 hover:bg-fm-gray-light"
                ].join(" ")}
              >
                #{tag.label}
              </button>
            ))}
          </div>
        </section>

        {!categoryFilter && !tagFilter && featured && (
          <section className="mx-auto max-w-7xl px-6 pb-12 lg:px-8">
            <BlogCard post={featured} featured />
          </section>
        )}

        <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
          {gridPosts.length === 0 ? (
            <div className="rounded-2xl border border-fm-gray-medium/15 bg-white p-12 text-center">
              <p className="text-fm-charcoal">No posts match this filter.</p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 text-sm font-bold text-fm-teal-dark hover:underline"
              >
                View all posts
              </button>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {gridPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
