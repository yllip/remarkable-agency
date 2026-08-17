import { getCollection, type CollectionEntry } from "astro:content";

export type Project = CollectionEntry<"projects">;

/**
 * Every project, newest first. The year is the only order the entries carry, so
 * two projects sharing one fall back to their title and the sequence stays the
 * same between builds.
 */
export async function getProjects(): Promise<Project[]> {
  const projects = await getCollection("projects");
  return projects.sort(
    (a, b) =>
      b.data.year - a.data.year || a.data.title.localeCompare(b.data.title),
  );
}

/** Where a project is published. The entry `id` is the last segment. */
export const projectHref = (project: Project) => `/work/${project.id}`;
