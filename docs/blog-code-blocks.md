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

`CodeBlock.astro`, `CodeLine.astro`, `CopyButton.astro`, and `CodeTabs.astro` own
the HTML. File and language wrappers share `CodeTabs`, with distinct preference
semantics. A `CodeTabsController` owns each group’s selection, event listeners, and cleanup;
file and language groups use composition rather than subclasses. Copy behavior stays
a small function beside page initialization.

`snippets.server.ts` groups source preparation, highlighting, and snippet types.
`markdown.server.ts` owns the fence transform and placeholder extraction. The adapter
carries fences as source-data placeholders; `CodeContent.astro` replaces standalone
placeholders with `CodeBlock` components. It preserves surrounding HTML exactly.
The blog layout includes this boundary automatically. Other layouts rendering
ordinary fences should wrap their content with `CodeContent` and include
`CodeBehavior` plus `code.css`.

Tab wrappers consume their fence placeholders before highlighting. For direct
Astro usage, they also accept a `snippets` array of `{ source, language, meta }`
objects; ordinary MDX fence authoring is unchanged. Without scripting, the tab
buttons stay hidden and every snippet remains visible.

The five TypeScript modules in `src/code` follow a functional core with browser
controllers: `language.ts`, `snippets.server.ts`, `markdown.server.ts`, `tabs.ts`,
and `client.ts`. The shared language-preference object uses subscriptions and stays
browser-safe; neither browser entrypoint imports the highlighter or HTML parser.
Before an Astro page swap, controllers release listeners and subscriptions, copy
timers are cleared, and pending clipboard completions are ignored. Reinitialization
retains the in-memory language preference when local storage is unavailable.
