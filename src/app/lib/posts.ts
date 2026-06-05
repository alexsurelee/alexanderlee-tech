export type Post = {
  title: string;
  slug: string;
  summary: string;
  /** ISO `YYYY-MM-DD`; used for ordering by recency. */
  date: string;
  tags: string[];
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Formats an ISO `YYYY-MM-DD` date deterministically (no locale/timezone drift). */
export function formatPostDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

/** Returns the post with the given slug, or `undefined` if none matches. */
export function getPost(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}

/**
 * Static, build-time blog index. The single source of truth for the blog list,
 * the desktop search, and the command palette.
 */
export const posts: Post[] = [
  {
    title: "Building a Typewriter Effect in React",
    slug: "typewriter-effect-react",
    summary:
      "How I built the animated title on this site with a small hook and CSS.",
    date: "2026-05-20",
    tags: ["react", "animation", "css"],
  },
  {
    title: "Why I Switched to CSS Modules",
    slug: "why-css-modules",
    summary: "Scoped styles, design tokens, and far fewer naming headaches.",
    date: "2026-04-02",
    tags: ["css", "architecture"],
  },
  {
    title: "Testing React Components with Vitest",
    slug: "testing-react-vitest",
    summary: "A practical setup for fast, behavior-focused component tests.",
    date: "2026-03-15",
    tags: ["testing", "react", "vitest"],
  },
  {
    title: "Notes on the Next.js App Router",
    slug: "nextjs-app-router-notes",
    summary: "Server components, async params, and what actually changed for me.",
    date: "2026-02-10",
    tags: ["nextjs", "react"],
  },
  {
    title: "A Minimal Approach to Personal Sites",
    slug: "minimal-personal-sites",
    summary: "Less framework, more content — my take on a calm homepage.",
    date: "2026-01-05",
    tags: ["design", "minimalism"],
  },
];

const TITLE_MATCH = 2;
const SECONDARY_MATCH = 1;
const NO_MATCH = 0;

function scorePost(post: Post, query: string): number {
  if (post.title.toLowerCase().includes(query)) {
    return TITLE_MATCH;
  }
  if (
    post.summary.toLowerCase().includes(query) ||
    post.tags.some((tag) => tag.toLowerCase().includes(query))
  ) {
    return SECONDARY_MATCH;
  }
  return NO_MATCH;
}

function byRecency(a: Post, b: Post): number {
  return b.date.localeCompare(a.date);
}

/**
 * Ranks the blog index against `query`. An empty/whitespace query returns every
 * post ordered by recency. Otherwise, title matches outrank summary/tag matches
 * (case-insensitive), with recency as the tiebreaker. Non-matching posts are
 * excluded.
 */
export function searchPosts(query: string): Post[] {
  const normalized = query.trim().toLowerCase();

  if (normalized === "") {
    return posts.toSorted(byRecency);
  }

  return posts
    .map((post) => ({ post, score: scorePost(post, normalized) }))
    .filter((entry) => entry.score > NO_MATCH)
    .toSorted((a, b) => b.score - a.score || byRecency(a.post, b.post))
    .map((entry) => entry.post);
}
