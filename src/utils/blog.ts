import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog">;

/**
 * Every post, newest first. Drafts are left in during development so they can
 * be previewed, and dropped from the production build.
 */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection("blog", ({ data }) =>
    import.meta.env.PROD ? !data.draft : true,
  );
  return posts.sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );
}

/** Where a post is published. The entry `id` is the last segment. */
export const postHref = (post: Post) => `/blog/${post.id}`;
