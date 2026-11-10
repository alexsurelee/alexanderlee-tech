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

The parser owns canonical content. A TypeScript DOM adapter resolves its semantic
attributes into an article-local model; a pure policy selects unique notes.
The controller observes visibility and size, batches events, retains keyed nodes,
and cleans up on Astro navigation. Floating content is a passive copy: controls,
live regions and hydrated islands are omitted, code presentation is retained,
and IDs and internal relationships are namespaced. Rich interactions remain in
the permanent notes. No new dependencies or build transforms are required.

Validation includes Node/happy-dom policy, adapter and lifecycle tests, plus an
isolated Astro build of actual Markdown and MDX fixtures through BlogPost and
CodeContent. Storybook provides typography and narrow-screen examples. Real
browser scrolling, mobile visual viewport, zoom, print preview, and screen reader
verification must also be performed; DOM tests do not establish those behaviors.
