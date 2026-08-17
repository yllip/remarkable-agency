import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * Case studies. One Markdown file per project in `src/content/projects`, listed
 * on `/work` and rendered at `/work/{filename}`.
 */
const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "**/*.md" }),
  schema: ({ image }) =>
    z.object({
      /** The project's name. Used as the card label and the page heading. */
      title: z.string(),
      /** A sentence or two of positioning. Also the page's meta description. */
      summary: z.string(),
      /** Cover image, as a path relative to the entry's own file. */
      image: image(),
      /** Describe the image for anyone who can't see it. The title is not a substitute. */
      imageAlt: z.string(),
      /** What the studio did on the project. */
      services: z.array(z.string()),
      /** The year the work shipped. Orders the listing, newest first. */
      year: z.number().int(),
    }),
});

/**
 * Blog posts. One Markdown file per post in `src/content/blog`, listed on
 * `/blog` and rendered at `/blog/{filename}`.
 */
const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.md" }),
  schema: ({ image }) =>
    z.object({
      /** The post's title. Used as the card heading and the page's `h1`. */
      title: z.string(),
      /** A sentence or two of summary. Also the page's meta description. */
      description: z.string(),
      /** Category label, drawn as the pill on the card. */
      tag: z.string(),
      /** Publication date. Orders the listing, newest first. */
      pubDate: z.coerce.date(),
      /** Shown on the post when it differs from the publication date. */
      updatedDate: z.coerce.date().optional(),
      /** Lead image, as a path relative to the entry's own file. */
      heroImage: image().optional(),
      /** Describe the image for anyone who can't see it. The title is not a substitute. */
      heroImageAlt: z.string().optional(),
      /** Kept off the built site, but still visible while running `astro dev`. */
      draft: z.boolean().default(false),
    }),
});

export const collections = { projects, blog };
