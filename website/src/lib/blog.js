import { BLOG_POSTS, BLOG_CATEGORIES, BLOG_TAGS, categoryById, tagById } from "../data/blog/index.js";

export function getAllPosts() {
  return [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
  );
}

export function getPostBySlug(slug) {
  return BLOG_POSTS.find((post) => post.slug === slug) ?? null;
}

export function getFeaturedPosts() {
  return getAllPosts().filter((post) => post.featured);
}

export function getPostsByCategory(categoryId) {
  if (!categoryId || categoryId === "all") return getAllPosts();
  return getAllPosts().filter((post) => post.categoryId === categoryId);
}

export function getPostsByTag(tagId) {
  if (!tagId) return getAllPosts();
  return getAllPosts().filter((post) => post.tagIds.includes(tagId));
}

export function getRelatedPosts(post, limit = 3) {
  return getAllPosts()
    .filter((p) => p.slug !== post.slug && p.categoryId === post.categoryId)
    .slice(0, limit);
}

export function getCategories() {
  return BLOG_CATEGORIES;
}

export function getTags() {
  return BLOG_TAGS;
}

export function getCategoryForPost(post) {
  return categoryById[post.categoryId] ?? null;
}

export function getTagsForPost(post) {
  return post.tagIds.map((id) => tagById[id]).filter(Boolean);
}

export function formatPostDate(isoDate) {
  return new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

export function categoryPostCount(categoryId) {
  return BLOG_POSTS.filter((p) => p.categoryId === categoryId).length;
}
