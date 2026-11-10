# Alexander Lee

Alexander Lee’s personal website, primarily a blog, at [alexanderlee.tech](https://alexanderlee.tech).

Built with Astro, with Markdown and MDX posts, RSS, and a sitemap.

## Development

Use Node.js 22.23.4 or newer and pnpm. Run commands from the project root.
Use pnpm for all dependency management and project commands, and commit changes
to `pnpm-lock.yaml` when dependencies change. Do not introduce other package
manager lockfiles.

| Command | Action |
| :--- | :--- |
| `pnpm install` | Install dependencies |
| `pnpm astro dev --background` | Start the background development server |
| `pnpm astro dev status` | Check the server status |
| `pnpm astro dev logs` | Read server logs |
| `pnpm astro dev stop` | Stop the server |
| `pnpm typecheck` | Check Astro and TypeScript files |
| `pnpm build` | Build the site to `dist/` |
| `pnpm preview` | Preview the production build |

Work directly on `main`. Run `pnpm typecheck` and inspect IDE diagnostics before committing and pushing changes.

## Licensed fonts

The site uses Berkeley Mono, hosted separately on Cloudflare. Its licensed font
files are not included in this repository. No font setup is needed to build the site.

## Content and metadata

- Blog posts live in `src/content/blog/`.
- Pages live in `src/pages/`.
- Shared site title and description live in `src/consts.ts`.
- The production URL is configured in `astro.config.ts` and used for canonical URLs, RSS, and the sitemap.

Create a blank blog entry from the project root:

```sh
pnpm new:post "My new post"
```

This creates `src/content/blog/my-new-post.md` with the title, an empty
`description`, and today's local date as `pubDate`. The body is blank. Optional
`updatedDate` and `heroImage` fields are included as commented examples; uncomment
them when needed and point `heroImage` to an existing image. Fill in the description
and body before publishing. Posts are included in the next site build; there is no
draft flag in the current schema.

Omit the title to create `untitled-post.md` with the title “Untitled post”. The
command refuses to overwrite an existing Markdown or MDX post with the same name.

## Artefacts

Add standalone `.html` documents to `public/artefacts/`. For example,
`public/artefacts/project-name/pr-123.html` gets a viewer page at
`https://alexanderlee.tech/artefacts/view/project-name/pr-123/` for linking from PRs.
Keep published paths stable so existing PR links continue to work.

The `/artefacts/` page automatically lists HTML files alphabetically by their
relative paths, including subdirectories. No manifest or frontmatter is needed.
The catalogue updates on each site build; it shows an empty state until the first
document is added. Search is not implemented yet.

During development, adding, removing, or renaming an HTML artefact automatically
restarts the dev server to refresh viewer routes. Bulk file changes are debounced.
Editing an existing document uses the normal development reload.

Artefact catalogue and viewer pages include a `noindex` meta tag and are excluded
from the sitemap. `public/_headers` applies `X-Robots-Tag: noindex` to the entire
`/artefacts` section on Cloudflare, including standalone HTML documents and assets,
without requiring changes to individual files. These headers apply after deployment;
Astro's local dev server does not read `_headers`.

Each viewer page uses the site's header and footer with a wide, scrollable iframe
and an “Open standalone” link. HTML documents are copied unchanged and loaded from
their original `/artefacts/project-name/pr-123.html` URLs inside the iframe, so
their styles and scripts work independently of the site's client router. Place any
supporting assets alongside them and use relative URLs. Only HTML documents are
listed. These are public, trusted documents running on the site's origin.
`public/artefacts/index.html` is reserved for the generated catalogue; use a
different filename or a subdirectory for an artefact named `index.html`.
The `public/artefacts/view/` directory is also reserved for generated viewer pages.

## Storybook

Run `pnpm storybook` to browse component stories at `http://localhost:6006`.
Run `pnpm build-storybook` to generate a static Storybook in `storybook-static/`.

Stories live alongside components as `src/components/*.stories.js`. The preview
loads the site's global styles and fonts, and serves assets from `public/`.
The initial stories cover `FormattedDate` and `Footer`.

This project uses the [community Astro framework](https://github.com/storybook-astro/storybook-astro).
Astro stories in static builds are pre-rendered; use the development server to
preview changes to args with Controls.

## Credit

Started from the Astro blog template, whose theme is based on [Bear Blog](https://github.com/HermanMartinus/bearblog/).
