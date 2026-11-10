# Blog code blocks

Ordinary fences in `.md` and `.mdx` posts are highlighted at build time with
Pierre Highlights. Unsupported languages render as escaped plain text. The browser
only runs the tab and copy controls; no highlighter or WebAssembly is shipped.

## Fence metadata

- `title="handler.ts"` sets the tab label (or standalone header).
- `highlight="1,3-5"` emphasizes one-based source lines.
- `diff` treats leading `+` and `-` as added and removed lines and strips one
  leading space from context lines. This is a snippet diff, not a unified patch:
  do not include patch headers or hunk markers. Copy omits removed lines and all
  diff prefixes. Highlight coordinates include removed lines.

````mdx
import FileTabs from '../../components/code/FileTabs.astro';
import LanguageTabs from '../../components/code/LanguageTabs.astro';

<FileTabs label="Server example">

```ts title="handler.ts" diff highlight="3"
 const greeting = 'Hello';
-console.log('Old');
+console.log(greeting);
```

```json title="config.json"
{ "enabled": true }
```

</FileTabs>

<LanguageTabs default="typescript" label="Greeting language">

```ts title="TypeScript"
console.log('Hello');
```

```python title="Python"
print('Hello')
```

</LanguageTabs>
````

Keep blank lines around fences inside wrappers. Groups accept direct fence
children; nested groups and nested file/language selectors are outside this API.
Language identity comes from the fence language, independent of its title. Common
aliases such as `ts`/`typescript`, `js`/`javascript`, and `py`/`python` are normalized.
The optional `LanguageTabs` default selects a language when the saved preference
is absent from that group. Fallbacks never change the saved preference. File tabs
stay local and default to the first snippet.

All snippets appear with labels when scripting is disabled. With scripting,
arrow keys, Home, and End select tabs; only the active panel is keyboard reachable.
Copy reports success or failure through a live region. Lines wrap visually without
changing copied whitespace. Groups retain the tallest visited panel height to
reduce page movement during switching. Colors follow system light/dark preference,
matching the site's current theme mechanism, and use the site's Berkeley Mono font.
Visual styling is an initial treatment for later iteration.

## Verification

Run `pnpm test`, `pnpm typecheck`, `pnpm build`, and `pnpm build-storybook`.
Storybook's **Blog / Code blocks** story exercises the shared renderer and controls.
Start `pnpm astro dev --background` and visit `/code-examples/fixture` to exercise
real `.md` and `.mdx` fixtures. The fixture route is development-only and generates
no production page. Use `pnpm astro dev stop`, `status`, and `logs` to manage it.

In a browser, check language synchronization and reload persistence, file-local
selection, arrow/Home/End navigation, clipboard feedback, 375px wrapping, both
system themes, and readability with scripting disabled. The fixtures include a
missing preferred-language fallback, a long filename, a long unbroken token, diffs,
and an unsupported language containing literal HTML.

## Component structure

`CodeExample.svelte` owns a complete standalone snippet or group in one
server-rendered `client:load` island. Its discriminated props distinguish standalone,
file, and language examples. It renders escaped tokens, selects panels, manages
keyboard focus, retains the tallest visited height, and handles copy feedback.
Controls remain hidden and every labeled panel remains readable until mounting.
Copy attempts have per-panel sequence numbers so old completions cannot overwrite
new feedback; teardown clears timers and ignores pending work.

`CodeContent.astro` reconstructs article HTML around ordinary fence placeholders.
`CodeSnippet.astro`, `FileTabs.astro`, and `LanguageTabs.astro` prepare source and
server-generated instance IDs. Empty groups throw at this boundary. Each adapter
renders one island, with no child islands or browser initialization API.

`snippets.server.ts` performs highlighting and `markdown.server.ts` transforms and
extracts fences. Serializable presentation contracts live in neutral `types.ts`.
Browser code imports neither server module. `language.ts` provides pure aliases
and fallback policy; private `preference.ts` lazily owns browser subscriptions and
storage. Unavailable preferences never overwrite the saved value. The service
survives island remounts, including when storage is denied, without mutable SSR
state. Svelte unsubscribes on teardown, including Astro router navigation.

Other layouts should wrap ordinary fences in `CodeContent` and import `code.css`.
Direct Astro adapters also accept source/snippet arrays; MDX authoring is unchanged.

`pnpm test` runs Node policy/transform tests, isolated production Markdown/MDX
builds, and real compiled Svelte component tests through Vitest. DOM tests check
interaction and lifecycle, not layout. To retain the production fixtures for browser
inspection, run `CUTOVER_FIXTURE_DIR=/tmp/svelte-cutover-fixture node --import tsx
--test tests/footnotes-integration.test.ts` (on one line), then serve that directory.
