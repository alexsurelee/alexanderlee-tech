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

Berkeley Mono is served directly from the R2 bucket `alexanderlee-tech-fonts`
through `https://fonts.alexanderlee.tech/berkeley-mono/v1/`. The licensed WOFF2
files are never committed to Git. Builds require no font downloads or credentials.
The font faces live in `src/styles/global.css`; `BaseHead.astro` preloads the
regular face. System monospace fonts provide the fallback when offline.

Cloudflare caches the versioned fonts for one year at the edge and in browsers.
Upload changed fonts under a new version directory and update the CSS URLs,
preload URL, and cache rule's version path. Do not overwrite a published version. The cache rule applies
only to this font hostname and version path, and excludes caching error responses.

The bucket uses Standard storage and a custom domain, with the `r2.dev` endpoint
turned off. CORS permits read requests from the production site and localhost
on ports 4321 (Astro) and 6006 (Storybook). CORS controls browser use; the font URLs
are publicly readable. Cache misses read from R2 and count toward its free
allowance; this setup does not enforce a hard spending cap. No paid caching
features are enabled. Cloudflare's production build command remains `pnpm build`.

## Content and metadata

- Blog posts live in `src/content/blog/`. The included starter posts are sample content to replace before launch.
- Pages live in `src/pages/`.
- Shared site title and description live in `src/consts.ts`.
- The production URL is configured in `astro.config.ts` and used for canonical URLs, RSS, and the sitemap.

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
