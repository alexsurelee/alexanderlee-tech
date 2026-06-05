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
  {
    title: "Design Tokens Without a Design System Team",
    slug: "design-tokens-without-a-team",
    summary: "A small set of CSS variables that scaled further than I expected.",
    date: "2025-12-18",
    tags: ["css", "design"],
  },
  {
    title: "Keyboard Navigation Patterns for Search UIs",
    slug: "keyboard-navigation-search-uis",
    summary: "Combobox semantics, roving focus, and why Enter is overloaded.",
    date: "2025-12-01",
    tags: ["accessibility", "react"],
  },
  {
    title: "Static Indexes Beat Live Search for Personal Blogs",
    slug: "static-indexes-personal-blogs",
    summary: "Build-time data, zero latency, and one pure ranking function.",
    date: "2025-11-14",
    tags: ["architecture", "nextjs"],
  },
  {
    title: "Hover Intent on Desktop Navigation",
    slug: "hover-intent-desktop-navigation",
    summary: "Debouncing open panels so incidental pointer passes do not flicker.",
    date: "2025-10-28",
    tags: ["ux", "css"],
  },
  {
    title: "Command Palettes on the Web",
    slug: "command-palettes-on-the-web",
    summary: "Modal overlays, grouped results, and global shortcuts done accessibly.",
    date: "2025-10-03",
    tags: ["ux", "accessibility"],
  },
  {
    title: "Monospace Fonts for UI Chrome",
    slug: "monospace-fonts-ui-chrome",
    summary: "When meta labels, tags, and hints deserve a different voice.",
    date: "2025-09-12",
    tags: ["typography", "design"],
  },
  {
    title: "Reducing Layout Shift in Client Components",
    slug: "reducing-layout-shift-client-components",
    summary: "Reserving space, avoiding font swaps, and measuring what users feel.",
    date: "2025-08-22",
    tags: ["performance", "react"],
  },
  {
    title: "Writing Tests That Read Like User Stories",
    slug: "tests-that-read-like-stories",
    summary: "Query by role, assert behavior, and skip implementation details.",
    date: "2025-07-30",
    tags: ["testing", "vitest"],
  },
  {
    title: "Dark Mode with prefers-color-scheme Only",
    slug: "dark-mode-prefers-color-scheme",
    summary: "No toggle yet — just respect the OS and keep tokens symmetric.",
    date: "2025-07-04",
    tags: ["css", "design"],
  },
  {
    title: "Scroll Lock Without Breaking iOS Safari",
    slug: "scroll-lock-ios-safari",
    summary: "Body overflow hidden, focus traps, and the quirks that remain.",
    date: "2025-06-11",
    tags: ["css", "accessibility"],
  },
  {
    title: "Choosing Atkinson Hyperlegible for Body Copy",
    slug: "atkinson-hyperlegible-body-copy",
    summary: "Legibility first, personality second — a font pick I kept.",
    date: "2025-05-19",
    tags: ["typography", "design"],
  },
  {
    title: "Partial Prerendering Notes from the Sidelines",
    slug: "ppr-notes-from-the-sidelines",
    summary: "Watching Next.js caching evolve without betting the whole site on it.",
    date: "2025-04-25",
    tags: ["nextjs", "performance"],
  },
  {
    title: "Small Modules, Deep Interfaces",
    slug: "small-modules-deep-interfaces",
    summary: "Why the combobox primitive owns behavior and not blog routing.",
    date: "2025-03-30",
    tags: ["architecture", "react"],
  },
  {
    title: "Fuzzy Search Is Overkill for Ten Posts",
    slug: "fuzzy-search-overkill-small-indexes",
    summary: "Substring match plus simple ranking got me surprisingly far.",
    date: "2025-03-02",
    tags: ["architecture", "search"],
  },
  {
    title: "Storybook for Component Isolation",
    slug: "storybook-component-isolation",
    summary: "Exercising navbar states without spinning up the whole app.",
    date: "2025-02-08",
    tags: ["testing", "storybook"],
  },
  {
    title: "Chromatic Snapshots for UI Regressions",
    slug: "chromatic-snapshots-ui-regressions",
    summary: "Visual diffs as a safety net while the design still moves.",
    date: "2025-01-17",
    tags: ["testing", "ci"],
  },
  {
    title: "Content-Visibility for Long Blog Indexes",
    slug: "content-visibility-long-indexes",
    summary: "Deferring off-screen rows when the archive finally grows up.",
    date: "2024-12-05",
    tags: ["performance", "css"],
  },
  {
    title: "Slug Design for Evergreen Posts",
    slug: "slug-design-evergreen-posts",
    summary: "Short, stable URLs that survive title edits and redirects.",
    date: "2024-11-20",
    tags: ["writing", "architecture"],
  },
  {
    title: "Tags as Lightweight Topic Graphs",
    slug: "tags-as-topic-graphs",
    summary: "Faceted browse without building a whole taxonomy admin.",
    date: "2024-10-31",
    tags: ["writing", "design"],
  },
  {
    title: "Why I Avoid Client-Side Full-Text Search Libraries",
    slug: "avoid-client-side-full-text-search",
    summary: "Bundle size, hydration, and a static array in memory suffice here.",
    date: "2024-10-03",
    tags: ["performance", "search"],
  },
  {
    title: "Focus Restoration After Modal Close",
    slug: "focus-restoration-after-modal-close",
    summary: "Returning focus to the trigger is easy to forget and painful when missing.",
    date: "2024-09-14",
    tags: ["accessibility", "react"],
  },
  {
    title: "Mobile-First Navigation That Still Feels Desktop-Native",
    slug: "mobile-first-navigation-desktop-native",
    summary: "One palette for touch, hover panels for pointers — same data underneath.",
    date: "2024-08-22",
    tags: ["ux", "css"],
  },
  {
    title: "Publishing Cadence for Side Projects",
    slug: "publishing-cadence-side-projects",
    summary: "Notes, drafts, and posts that exist mainly to test the blog UI.",
    date: "2024-07-30",
    tags: ["writing", "meta"],
  },
  {
    title: "Fake Posts for Scroll Testing",
    slug: "fake-posts-for-scroll-testing",
    summary: "Sometimes you just need enough rows to exercise overflow and focus traps.",
    date: "2024-07-01",
    tags: ["meta", "testing"],
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
