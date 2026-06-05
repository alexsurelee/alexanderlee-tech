# PRD: Navbar with Command-Palette Search

## Problem Statement

As a visitor to alexanderlee.tech, today there is no real site navigation. The
"navbar" is just a logo that links home, embedded inside the base layout. There
is no way to reach a blog or a "uses" page, and there is no way to search
writing. As the site grows, I want a navbar that:

- Lets me get to the **Blog** and **Uses** sections from anywhere.
- Lets me **search blog posts quickly** without first loading a separate page,
  ideally triggered by the same gesture I'd naturally use to explore the Blog
  link (hovering it, or tabbing to it and pausing).
- **Adapts gracefully to any screen size** without feeling like a generic
  hamburger menu.
- Is built as a **reusable, well-tested piece of UX** rather than a one-off, so
  the search-as-you-type experience can be reused elsewhere (e.g. a global
  command palette).

## Solution

Introduce a `Navbar` that renders the site's primary routes (Blog, Uses) and is
driven by a single reusable headless primitive: a **Combobox** (search input +
filterable listbox with full keyboard support and ARIA wiring).

That one primitive powers two surfaces:

1. **Desktop Blog search.** On a wide viewport, hovering the **Blog** item — or
   tab-focusing it and holding focus briefly ("long focus") — expands it into a
   combobox panel with an auto-focused search input. As the user types, blog
   posts filter live. Pressing **Enter** navigates to a `/blog` results page for
   the current query; selecting a specific result navigates straight to that
   post. Clicking the Blog item itself (a normal link) navigates to `/blog`.

2. **Command-palette navigation.** On small viewports the link bar collapses
   into a single trigger that opens a **full-screen command menu**. That menu is
   the same combobox primitive, seeded with the nav routes (Blog, Uses, Home)
   *and* live blog-post search results, so search is never lost on touch
   devices. On desktop the same palette is also bound to **Cmd/Ctrl-K**.

Blog content is indexed at build time into a static, in-memory search index — no
backend, no network request. A pure `searchPosts(query)` function ranks matches
and is reused by the desktop search, the command palette, and the `/blog`
results page.

## User Stories

### Navigation basics

1. As a visitor, I want to see links to Blog and Uses in the navbar, so that I
   can reach the main sections of the site from any page.
2. As a visitor, I want the logo to continue linking home, so that I can always
   return to the landing page.
3. As a visitor, I want the navbar to indicate which section I'm currently in,
   so that I have a sense of place while browsing.
4. As a keyboard user, I want to tab through the navbar in a logical order
   (logo → Blog → Uses → palette trigger), so that navigation is predictable.
5. As a screen-reader user, I want the navbar exposed as a navigation landmark
   with labelled links, so that I can jump to and understand it.

### Desktop Blog search (hover / long-focus)

6. As a desktop visitor, I want hovering the Blog item to reveal a search input,
   so that I can start searching posts without leaving the page I'm on.
7. As a keyboard user, I want tab-focusing Blog and pausing briefly to reveal
   the same search input, so that the search affordance isn't mouse-only.
8. As a visitor, I want the search input to receive focus automatically when the
   panel opens, so that I can type immediately.
9. As a visitor, I want results to filter as I type, so that I get immediate
   feedback on what's available.
10. As a visitor, I want to see each result's title (and a short hint such as
    date or tag), so that I can tell results apart.
11. As a visitor, I want to arrow up/down through results and press Enter to open
    the highlighted post, so that I can navigate entirely by keyboard.
12. As a visitor, I want pressing Enter without a highlighted result to take me
    to the `/blog` results page for my query, so that I can see the full result
    set.
13. As a visitor, I want clicking a result to navigate directly to that post, so
    that one click gets me to what I want.
14. As a visitor, I want pressing Escape to close the search panel and return
    focus to the Blog item, so that I can back out without losing my place.
15. As a visitor, I want the panel to close when I click outside it or move focus
    away, so that it never feels stuck open.
16. As a visitor who briefly hovers Blog by accident, I want the panel to wait a
    short moment before opening (and to cancel if I leave), so that it doesn't
    flicker open on incidental mouse movement.
17. As a visitor, I want clicking the Blog item itself to navigate to `/blog`, so
    that the link still behaves like a link even though it can also open search.
18. As a visitor who opens search without typing, I want to see all posts
    immediately, so that the panel is useful for browsing even before I have a
    query in mind.
19. As a visitor searching with no matches, I want a clear "no results" state,
    so that a dead-end query is unambiguous.
20. As a returning visitor, I want my typed query reflected in the `/blog`
    results page URL when I press Enter, so that the search is shareable and
    bookmarkable.

### Command-palette navigation (responsive + power users)

21. As a mobile visitor, I want the navbar to collapse into a single, clearly
    labelled trigger instead of a crowded link bar, so that it fits my screen.
22. As a mobile visitor, I want tapping that trigger to open a full-screen menu
    listing Blog, Uses, and Home, so that I can navigate with large tap targets.
23. As a mobile visitor, I want that same menu to let me search blog posts, so
    that I don't lose search just because hover isn't available on touch.
24. As a mobile visitor, I want tapping Blog (outside the palette) to navigate to
    `/blog` directly, so that the primary action is fast and predictable on
    touch.
25. As a power user on desktop, I want Cmd/Ctrl-K to open the command palette
    from anywhere, so that I can navigate and search without the mouse.
26. As a command-palette user, I want routes and blog results visually grouped
    (e.g. "Pages" vs "Blog posts"), so that I can scan the list.
27. As a command-palette user, I want the same keyboard model as the desktop
    search (arrows, Enter, Escape, type-to-filter), so that I only learn one
    interaction.
28. As a command-palette user, I want opening it to lock background scroll and
    trap focus, so that the overlay behaves like a proper modal.
29. As a command-palette user, I want Escape (or tapping the backdrop) to close
    it and restore focus to the trigger, so that I can dismiss it cleanly.

### Responsive behavior

30. As a visitor on any device, I want the navbar to switch between the full link
    bar and the collapsed palette trigger based on available width, so that it
    always looks intentional.
31. As a visitor, I want the navbar to remain usable at very narrow widths
    without horizontal overflow, so that nothing is cut off or scrolls sideways.
32. As a visitor on a large screen, I want the desktop hover/long-focus search to
    be available, while on small screens search lives in the palette, so that the
    right affordance is offered for my input method.

### Accessibility & motion

33. As a screen-reader user, I want the search surfaces to use proper combobox
    semantics (input wired to a listbox, active option announced), so that I know
    what's highlighted and how many results exist.
34. As a keyboard user, I want a visible focus indicator on every interactive
    navbar element, so that I can see where I am.
35. As a user who prefers reduced motion, I want the expand/collapse and palette
    open/close animations minimized, so that motion doesn't cause discomfort.
36. As a screen-reader user, I want result-count changes announced politely, so
    that I know when typing changed the results.

### Reusability

37. As a developer, I want the search/combobox behavior implemented as a single
    headless primitive, so that the desktop Blog search and the command palette
    share one tested implementation.
38. As a developer, I want blog search logic to be a pure function over a static
    index, so that I can unit-test ranking without rendering anything.
39. As a developer, I want navbar routes defined as data in one place, so that
    adding or reordering routes doesn't require touching layout code.

## Implementation Decisions

### Modules

- **Combobox (headless primitive) — the core deep module.** Encapsulates the
  full search-as-you-type interaction behind a small interface and is reused by
  both the desktop Blog search and the command palette. Responsibilities:
  open/closed state, current query, the filtered/ranked option list, the active
  (highlighted) option, keyboard handling (Up/Down, Home/End, Enter, Escape,
  type-to-filter), and ARIA wiring (combobox input + listbox + active-descendant
  / option roles). It is presentation-light: it manages behavior and emits the
  state/handlers needed to render an input and an option list, plus an
  `onSelect(item)` callback. It does not know about routing, hover, or blog data.
- **Blog search index + `searchPosts` (pure module).** A build-time static index
  of posts (title, slug, summary/excerpt, date, tags) and a pure ranking
  function `searchPosts(query) -> rankedResults`. No I/O at request time. Reused
  by desktop search, command palette, and the `/blog` results page. Ranking
  starts simple (case-insensitive title-first match, then summary/tags), ordered
  by relevance then recency.
- **Open-intent controller (hover + long-focus).** A small reusable hook/util
  that converts pointer hover and sustained keyboard focus into an "open"
  intent with a short debounce/delay and cancellation, and respects
  reduced-motion. Used to drive the desktop Blog search panel; testable in
  isolation against fake timers.
- **Navbar (composition).** Renders the navigation landmark, the route items
  (from a single routes config), the desktop Blog search surface, and the
  responsive switch to the command-palette trigger. Holds no search logic of its
  own beyond composing the modules above.
- **CommandPalette (composition).** A modal overlay composing the Combobox
  primitive with route items + live blog results, grouped by section. Owns
  modal concerns: full-screen layout, scroll lock, focus trap, restore-focus on
  close, backdrop dismiss, and the Cmd/Ctrl-K global shortcut binding.
- **Routes config (data).** A single source-of-truth list of primary routes
  (label, href, optional grouping) consumed by both the Navbar link bar and the
  CommandPalette.

### Interfaces & contracts

- Combobox exposes: items (already filterable or raw + a filter/ranker),
  controlled-ish `query`, `onSelect(item)`, `onSubmit(query)` (Enter with no
  active option), and open-state control; it returns the props/state needed to
  render the input, the listbox, and each option, including the active option id.
- `searchPosts(query)` is synchronous and pure; an empty/whitespace query
  returns **all posts** (ordered by recency), so opening either search surface
  with no query shows the full list ready to browse.
- Routes are data: `{ label, href }[]` with Blog and Uses as the initial
  entries; the palette additionally injects Home.
- Result selection contract: selecting a post result → navigate to that post's
  route; `onSubmit` (Enter, no active option) → navigate to `/blog` with the
  query encoded in the URL (e.g. a search param) so it is shareable.

### Architecture & behavior

- New routes: a `/blog` route (also serving as the query results page via a
  search param) and a `/uses` route. Individual post routes are addressed by
  slug from the static index.
- The existing nav currently lives inside `base-layout`; the Navbar becomes its
  own component composed into the layout, replacing the inline logo-only nav
  while keeping the logo→home link.
- Desktop vs. small-viewport mode is chosen by available width (CSS-driven where
  possible; a media-query/`matchMedia`-style boolean where JS must branch).
  Desktop shows the full link bar with hover/long-focus Blog search; small
  viewports show the collapsed command-palette trigger. The hover/long-focus
  affordance is desktop-only by design; touch users reach search through the
  palette.
- Client component boundaries are kept minimal: interactive pieces (Combobox,
  open-intent, CommandPalette, the Navbar's interactive shell) are client
  components; route/data config and the static index stay server-friendly.
  Follows existing conventions: CSS Modules + design tokens from `globals.css`,
  `clsx`, co-located `component.tsx` / `.module.css` / `index.ts` / `tests/`.
  React Compiler is enabled, so manual memoization is avoided unless measured.
- Animations (panel expand/collapse, palette open/close, and any list/route
  transitions) use the project's preferred approach (CSS + React View
  Transitions where it communicates spatial continuity), with a reduced-motion
  fallback in the global stylesheet.

### Accessibility decisions

- Search surfaces follow the ARIA combobox pattern: a text input wired to a
  listbox, active-option highlighting via active-descendant, and a polite live
  announcement of result counts.
- The Blog item is a real link (navigates to `/blog`) that *also* exposes the
  search affordance; the affordance must not break link semantics or keyboard
  activation.
- The command palette is a modal: focus trap, scroll lock, Escape + backdrop
  dismiss, and focus restoration to the trigger on close.
- Visible focus indicators on all interactive elements (reusing the existing
  `:focus-visible` token styling).

## Testing Decisions

Good tests here assert **observable behavior through the accessibility tree and
user-facing outcomes**, not internal state or class names — matching the
existing suite, which uses Vitest + Testing Library and queries by role/text
(see `base-layout` and `typewriter-title` tests). Prefer `getByRole`,
user-event interactions, and `findBy*`/`waitFor` for async/timed behavior.

Modules to test:

- **Combobox primitive (highest priority — it's the deep module).**
  - Typing filters the rendered options.
  - Arrow keys move the active option; the active option is exposed to assistive
    tech.
  - Enter on an active option fires `onSelect` with that item.
  - Enter with no active option fires `onSubmit` with the current query.
  - Escape closes and returns focus to the invoker.
  - Empty query renders all options; a no-match query renders the empty state.
- **`searchPosts` (pure function).** Unit tests for ranking/matching: title
  matches rank above summary/tag matches; case-insensitive; ties broken by
  recency; empty query returns all posts ordered by recency. No rendering
  required.
- **Open-intent controller.** With fake timers: hover after the delay opens;
  leaving before the delay cancels; sustained focus opens; blur cancels;
  reduced-motion path behaves sanely.
- **Navbar.** Renders Blog and Uses links with correct hrefs; exposes a nav
  landmark; reflects the current section; clicking Blog navigates to `/blog`
  (the link still links). Behavior is asserted by role/href, mirroring existing
  `base-layout` link tests.
- **CommandPalette.** Cmd/Ctrl-K opens it; it lists routes and blog results
  grouped; selecting a route navigates; selecting a post navigates to the post;
  Escape/backdrop closes and restores focus. (Focus-trap/scroll-lock asserted at
  a behavioral level; jsdom limitations noted where relevant.)

Decide with the author which of these get tests first. Recommended minimum:
Combobox primitive + `searchPosts` (the two deep modules) and the Navbar
link/landmark behavior.

## Out of Scope

- Authoring the actual blog content/MDX pipeline and the visual design of the
  `/blog` index, individual post pages, and `/uses` page beyond what the navbar
  needs to link to. (The static index's shape is in scope; populating real posts
  is not.)
- Server-side / full-text search, fuzzy search libraries, search analytics, and
  any backend or API for search. Search is a static, client-side index.
- Cross-page shared-element/view-transition choreography beyond the navbar's own
  open/close and route-change animations.
- Theming/dark-mode work beyond reusing existing tokens (the app already adapts
  via `prefers-color-scheme`).
- Internationalization/localization of nav labels.
- Persisting recent searches or search history.

## Further Notes

- The unifying idea is **one combobox primitive, two surfaces**: desktop Blog
  hover/long-focus search and the responsive command palette are the same tested
  behavior wearing different chrome. This keeps the interaction model consistent
  and the test surface small.
- "Long focus" is implemented as sustained keyboard focus with a short delay —
  the keyboard-equivalent of hover-intent — so the search affordance is fully
  reachable without a mouse on desktop, while touch users get it through the
  palette.
- Pressing Enter encoding the query into the `/blog` URL makes searches
  shareable and gives a natural full-results destination, satisfying the "both"
  selection behavior (item click → post; Enter → results page).
- Build-time indexing keeps search instant and dependency-free, consistent with
  the site's current minimal stack (Next.js 16, React 19, CSS Modules, no data
  layer).
- Consider eventually binding the desktop link-bar Blog search and the palette
  to the same `searchPosts` ranking tweaks so improvements land everywhere at
  once.
