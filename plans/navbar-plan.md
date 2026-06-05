# Plan: Navbar with Command-Palette Search

> Source PRD: `plans/navbar-prd.md`

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**:
  - `/blog` — blog index; also acts as the search results page via a `?q=` query
    param (Enter from search lands here; query is shareable/bookmarkable).
  - `/blog/[slug]` — individual blog posts, addressed by slug.
  - `/uses` — the uses page.
  - `/` — unchanged; the logo continues to link home.
- **Blog index**: a static, build-time, in-memory index. Post shape:
  `{ title, slug, summary, date, tags }`. No request-time I/O, no backend.
- **Search**: a single pure function `searchPosts(query)` reused by the desktop
  Blog search, the command palette, and the `/blog` results page. Empty/
  whitespace query returns all posts ordered by recency; otherwise ranked
  (title matches first, then summary/tags), ties broken by recency.
- **Core primitive**: one headless **Combobox** (search input + filterable
  listbox, full keyboard model, ARIA combobox/listbox semantics). It is
  presentation-light and routing/data-agnostic; it powers both search surfaces.
- **Routes as data**: primary routes (Blog, Uses; palette also injects Home) live
  in a single config consumed by the link bar and the command palette.
- **Conventions** (match existing codebase): co-located
  `component.tsx` + `.module.css` + `index.ts` + `tests/`; CSS Modules + design
  tokens from `globals.css`; `clsx`; client components only for interactive
  shells; React Compiler is on (avoid manual memoization unless measured);
  Vitest + Testing Library tests that assert via roles/behavior.
- **Responsive model**: wide viewports show the full link bar with desktop
  hover/long-focus Blog search; small viewports collapse to a single command-
  palette trigger. The hover/long-focus affordance is desktop-only by design;
  touch users reach search through the palette.

---

## Phase 1: Navbar shell + routes/pages (data-driven)

**User stories**: 1, 2, 3, 4, 5, 17, 24, 39

### What to build

Replace the inline, logo-only nav currently embedded in `base-layout` with a
dedicated `Navbar` component composed into the layout. The Navbar keeps the
logo→home link and renders the primary routes (Blog, Uses) from a single
data-driven routes config. It exposes a proper navigation landmark, a logical
tab order (logo → Blog → Uses), and indicates the current section. Create
minimal real `/blog` and `/uses` pages (placeholder content is fine) so every
link lands somewhere real, and clicking/tapping Blog navigates to `/blog`.

### Acceptance criteria

- [ ] Navbar renders Blog and Uses links with correct hrefs, plus the logo
      linking to `/`.
- [ ] Routes are defined once as data; reordering/adding a route needs no layout
      changes.
- [ ] The nav is exposed as a navigation landmark with labelled links.
- [ ] Tab order is logo → Blog → Uses and every item has a visible focus
      indicator.
- [ ] The navbar indicates which section is currently active.
- [ ] `/blog` and `/uses` routes exist and render; clicking/tapping Blog goes to
      `/blog`.
- [ ] Existing layout behavior (logo, home link) is preserved; existing tests
      still pass.

---

## Phase 2: Static blog index + `searchPosts` + `/blog` list/results page

**User stories**: 12, 18, 19, 20, 38

### What to build

Introduce the static build-time blog index (post shape per architectural
decisions) and the pure `searchPosts(query)` ranking function. Make `/blog`
render the post list and filter it from the `?q=` search param: an empty query
shows all posts (by recency), a matching query shows ranked results, and a
no-match query shows a clear empty state. This makes search end-to-end
verifiable via URL before any interactive UI exists.

### Acceptance criteria

- [ ] A static index of posts exists with the agreed shape.
- [ ] `searchPosts("")` returns all posts ordered by recency.
- [ ] `searchPosts(query)` ranks title matches above summary/tag matches,
      case-insensitively, with recency as the tiebreaker.
- [ ] Visiting `/blog` lists all posts; visiting `/blog?q=term` shows the
      filtered/ranked results.
- [ ] A no-match query renders an unambiguous empty state.
- [ ] The `?q=` value is reflected in the URL so results are shareable.
- [ ] `searchPosts` is unit-tested as a pure function (ranking + empty-query).

---

## Phase 3: Reusable Combobox primitive + desktop Blog hover/long-focus search

**User stories**: 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 32 (desktop), 33, 36, 37

### What to build

Build the headless Combobox primitive (the core deep module) and the open-intent
controller (pointer hover-intent with debounce + cancellation, plus the
keyboard "long focus" equivalent). Wire them into the desktop Navbar so the Blog
item expands into a combobox panel with an auto-focused input that filters posts
live via `searchPosts`. Selecting a result navigates to that post; pressing
Enter with no active option navigates to `/blog?q=…`; arrow keys move the active
option; Escape closes and restores focus to the Blog item; outside-click/blur
closes the panel. The Blog item remains a real link to `/blog`.

### Acceptance criteria

- [ ] Hovering Blog (after a short intent delay) and sustained keyboard focus
      both reveal the search panel; incidental hover that leaves before the delay
      does not open it.
- [ ] The search input is auto-focused on open and results filter as the user
      types (empty query shows all posts).
- [ ] Each result shows a title plus a short hint (e.g. date or tag).
- [ ] Arrow Up/Down (and Home/End) move the active option; Enter on an active
      option opens that post; click on a result opens that post.
- [ ] Enter with no active option navigates to `/blog?q=…`.
- [ ] Escape closes the panel and returns focus to the Blog item; outside-click
      or focus-out closes it.
- [ ] Search surfaces use combobox/listbox ARIA semantics with active-option
      announcement and a polite result-count announcement.
- [ ] The Combobox primitive is implemented headlessly so it can be reused by the
      command palette; the Blog link still navigates to `/blog`.
- [ ] Combobox primitive behavior is tested (type-to-filter, keyboard nav,
      select vs submit, Escape, empty vs no-match).

---

## Phase 4: Command-palette navigation (responsive collapse + Cmd/Ctrl-K)

**User stories**: 21, 22, 23, 25, 26, 27, 28, 29, 30, 31, 32 (small)

### What to build

Add the responsive collapse: below the breakpoint the link bar becomes a single,
clearly labelled trigger that opens a full-screen command menu. The menu reuses
the Combobox primitive, seeded with the nav routes (Blog, Uses, Home) and live
blog-post results, visually grouped (e.g. "Pages" vs "Blog posts"), using the
same keyboard model as the desktop search. On desktop the palette is also bound
to Cmd/Ctrl-K. The palette behaves as a proper modal (scroll lock, focus trap,
Escape/backdrop dismiss, focus restored to the trigger).

### Acceptance criteria

- [ ] Below the breakpoint the navbar collapses to a single labelled trigger with
      no horizontal overflow at narrow widths; above it, the full link bar +
      desktop search remain.
- [ ] Tapping the trigger opens a full-screen menu listing Blog, Uses, and Home
      with large tap targets, plus live blog-post search results, grouped.
- [ ] Cmd/Ctrl-K opens the palette on desktop from anywhere.
- [ ] The palette uses the same keyboard model as the desktop search (arrows,
      Enter, Escape, type-to-filter); selecting a route navigates, selecting a
      post opens the post.
- [ ] Opening the palette locks background scroll and traps focus.
- [ ] Escape or backdrop tap closes the palette and restores focus to the
      trigger.
- [ ] Palette behavior is tested (open via shortcut, grouped items, route vs post
      selection, Escape/backdrop close + focus restore).

---

## Phase 5: A11y & motion polish

**User stories**: 34, 35 (cross-cutting reinforcement of 33, 36)

### What to build

Final cross-cutting pass over both search surfaces and the navbar. Ensure a
visible focus indicator across every interactive element and state, add
reduced-motion fallbacks, and apply tasteful motion: panel expand/collapse,
palette open/close, and route-change transitions via React View Transitions
where they communicate spatial continuity — all degrading gracefully under
`prefers-reduced-motion`.

### Acceptance criteria

- [ ] Every interactive navbar/search element has a visible, consistent focus
      indicator.
- [ ] Expand/collapse, palette open/close, and route transitions are animated and
      feel intentional.
- [ ] All animations are minimized/disabled under `prefers-reduced-motion`.
- [ ] Combobox semantics and result-count announcements are verified end-to-end
      across both surfaces.
- [ ] No layout shift or overflow introduced by the animations at any viewport.
