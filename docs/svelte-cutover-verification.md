# Svelte cutover verification

Implemented against baseline `c97f69a`. Astro still renders pages, content, slots,
and highlighted tokens on the server. The author adapters emit one Svelte island
per example; the blog layout emits one floating-footnote island. The old document
controllers and initialization/disposal entry points have been removed.

## Automated checks

- `pnpm test`: Node policy/server tests and Vitest tests compiling and mounting
  actual Svelte components. Covers shared/local selection, aliases, unavailable
  defaults, denied storage and remounts, exact copy, rejection, overlapping copy,
  timer reset and disposal, pending completions, initial observation, focused
  keyed notes, unsupported APIs, visibility geometry policy and passive copies.
- Production fixture builds exercise real Markdown and MDX through BlogPost and
  CodeContent, including grouped fenced code inside rich MDX footnotes. They check
  native anchor relationships, unique IDs, registered `client:load` islands,
  readable labeled SSR panels, and passive copies of actual generated markup
  before and after simulated source visibility/hydration changes.
- `pnpm typecheck`: Astro/TypeScript and `svelte-check`.
- `pnpm build` and `pnpm build-storybook`.
- WebStorm `get_file_problems`: changed code/configuration files inspected with
  project-relative paths; no reported problems.
- Production JavaScript inspected for highlighter, HAST parser, Node crypto and
  WebAssembly references: none found.

## Browser checks performed

Used the IDE Chrome checker with isolated production fixtures on localhost:4322,
the background Astro server on localhost:4321, and built Storybook on localhost:6007.
The checker required execution outside the socket-restricted sandbox. The alternate
connected browser host was unavailable.

- Actual Markdown/MDX islands hydrate without hydration console errors. Built
  Astro Storybook stories hydrate Svelte islands and support language interaction.
- Shared language selection, local file selection, Home/End focus, persisted `py`
  alias after reload, unavailable-preference fallback without storage writes,
  and exact clipboard feedback using an instrumented clipboard in the browser.
- 375px layout and long filenames/tokens, light/dark system themes, and emulated
  mobile/touch visual viewport. No horizontal document overflow at 375px.
- Permanent-section suppression, scrolling selection, focus retention with the
  same DOM node, focusout dismissal, and All footnotes heading/fragment navigation.
- Real hydrated MDX footnote source: two code islands with one hidden grouped
  panel; its floating copy contains all three labeled code panels, no hidden
  panels, islands, buttons or status regions.
- Astro router navigation between code and footnote pages and back: islands
  remount and the root footnote offset is removed when leaving the note page.

The permanent section was moved below the viewport during dock checks so a short
fixture could exercise selection and suppression independently of screen height.
The production fixture origin gets a CORS rejection from the licensed font host
(which allows localhost:4321); those checks used fallback fonts.

## Size comparison

The representative payload is the existing code-heavy Markdown/MDX fixture:
three standalone examples and four tab groups. The baseline was built from Git
in an isolated directory; the replacement used the production integration fixture.
Page shells differ slightly, while snippet content is the same. Bytes are raw
UTF-8, with gzip computed locally using Python's gzip implementation.

| Measurement | Before | After | Difference |
| --- | ---: | ---: | ---: |
| Rendered code fixture HTML | 19,442 | 39,146 | +19,704 |
| Gzipped HTML | 3,393 | 5,306 | +1,913 |
| All emitted browser JS | 25,930 | 67,704 | +41,774 |
| Sum of gzipped JS assets | 9,879 | 26,756 | +16,877 |

The JS rows cover the complete generated asset set, including router, prefetch,
code and footnote modules; they are not a per-route transfer measurement. Svelte's
shared runtime accounts for most of the JS increase. Serializable highlighted
props duplicate token presentation in HTML. The simple single-island design is
retained; these measurements do not establish a performance regression or budget.

## Remaining manual checks

Actual screen-reader output, native clipboard permission behavior, print preview,
browser zoom/pinch zoom, physical mobile browser chrome/keyboard viewport changes,
and a browser with JavaScript truly disabled were not verified. SSR tests establish
readable no-script markup, not a complete JavaScript-disabled browser session.
Mobile emulation does not replace testing a physical device. Storybook retains
its large preview-chunk build warning.

Nothing was deployed or pushed.

## Follow-up simplification

Language groups now derive selection from a private Svelte preference store and
current options/defaults; Svelte owns subscription cleanup. Each code panel has
one copy record whose outcome determines both the label and announcement.
Floating notes derive from selected IDs and dock focus, with no DOM-node registry.
The article observer returns only cleanup; focus events and dock resizing are
owned by the component. Blur no longer waits for an article geometry frame, and
dock resizing no longer rescans markers.

All 41 tests, type checks, builds and changed-file WebStorm inspections pass.
Browser regressions cover production hydration, reload persistence, exact diff
copy, 375px retained panel height, built Storybook synchronization, passive code,
keyed note focus retention and immediate blur dismissal with offset reset.
The size table above describes the initial cutover, before this follow-up. The
remaining manual-check limitations above still apply. No dependencies or files
were added by this follow-up, and nothing was pushed or deployed.
