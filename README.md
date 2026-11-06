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

## Content and metadata

- Blog posts live in `src/content/blog/`. The included starter posts are sample content to replace before launch.
- Pages live in `src/pages/`.
- Shared site title and description live in `src/consts.ts`.
- The production URL is configured in `astro.config.mjs` and used for canonical URLs, RSS, and the sitemap.

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
