# Blog footnotes

Use ordinary Markdown footnotes in Markdown or MDX posts:

```md
A statement with a source.[^book] A repeated reference.[^book]

[^book]: Author, *Book title*, chapter 3. [Source](https://example.com).

    Additional paragraphs, lists and fenced code are supported.
```

Numbers follow first-reference order; repeated references share a number and
receive individual return links. Definitions can appear anywhere. The installed
GFM parser leaves unresolved references as literal text, omits unused definitions,
and uses the first definition of a duplicate label.

The permanent Footnotes section remains readable without scripting and is the
only notes section printed. With scripting, a fixed reading aid shows the notes
whose body markers intersect the viewport. It preserves original numbers and
hides when any positive area of the permanent section is visible. The site footer
does not affect this behavior. Hidden panels and clipped markers are excluded.

The reading aid can cover the bottom lines of prose; its height is capped at
min(30dvh, 16rem), including safe-area padding, with internal scrolling. Visibility
ignores this overlay to avoid oscillation. Fragment navigation and keyboard
scrolling use an offset based on its measured height. There are no animations or
stored preferences.

Native reference links still go to permanent notes. “All footnotes” focuses the
permanent heading. A focused floating note is retained until focus leaves, even
when scrolling would otherwise hide it. The region is nonmodal and does not
announce automatic changes.

The parser owns canonical content. `FloatingFootnotes.svelte` is the only public
UI entry point, mounted with `client:load` by the blog layout. Its optional
`articleSelector` defaults to `[data-article-body]` and is resolved after mounting.
The component discovers article-local notes through `dom.ts`, uses the pure
selection policy in `model.ts`, and observes article visibility through `observe.ts`
and geometry helpers. That observer knows nothing about dock sizing or focus and
returns only a cleanup function.
It waits for complete initial observations and batches geometry in animation frames.
Missing content or observer APIs leave the dock hidden and native notes usable.

Svelte owns the keyed note containers. Selected note IDs and dock focus are the
independent inputs; the rendered notes derive from their union in canonical order.
A private action alone owns each container's passive children; no DOM-node registry
is required. Focus events update retention immediately without a geometry scan.
The component measures the dock after DOM updates and owns its ResizeObserver
for the root scroll offset. Dock resizing does not rescan article markers. Teardown disconnects observers, events and frames and
removes that property; Astro navigation uses the normal island lifecycle.

Passive copies unwrap only recognized code-example islands. They preserve every
labeled code panel before or after hydration, remove controls, live regions,
scripts, event attributes and behavioral hooks, and namespace surviving IDs and
internal relationships. Backlinks retain canonical article marker targets.
Unrelated interactive islands are omitted; passive copies never hydrate or join
language preference synchronization.

Run `pnpm test`, `pnpm typecheck`, `pnpm build`, and `pnpm build-storybook`.
Node tests cover policies and transforms, including real Markdown/MDX production
builds through BlogPost and CodeContent and passive copies of generated islands.
Vitest compiles and mounts the real Svelte components for interaction, observation,
focus retention, stale callbacks and teardown. Storybook retains Astro composition
stories and registers the framework's Svelte renderer for island hydration.
Real browser checks establish layout and hydration; DOM tests cannot establish
geometry, visual viewport, print, zoom, or screen-reader behavior.
