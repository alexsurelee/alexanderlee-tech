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

The production site uses Berkeley Mono. Its four licensed WOFF2 files are kept
outside Git in the private R2 bucket `alexanderlee-tech-fonts`, under
`berkeley-mono/`, with their original filenames. Do not enable public access on
this bucket or publish the fonts as repository/release artifacts.

Local checkouts without the files use the included Atkinson font. License holders
can copy their files into `src/assets/fonts/berkeley-mono/` (ignored by Git), or
download them with `pnpm fonts:download`. All four files must be present and match
the SHA-256 checksums in `scripts/fonts.mjs`.

The downloader can reuse `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` if
available in the build environment. The existing token needs Workers R2 Storage
Read or Edit permission. No new token is required if it already has access.
Cloudflare's default Workers Builds token includes R2 Edit permission; verify
credential availability in the build phase before relying on automatic injection.

Alternatively, set these overrides in a local ignored `.env` file or in the
production build environment:

| Variable | Value |
| :--- | :--- |
| `FONT_R2_ACCOUNT_ID` | Cloudflare account ID |
| `FONT_R2_API_TOKEN` | Secret Cloudflare API bearer token with Workers R2 Storage Read permission for the owning account |
| `FONT_R2_BUCKET` | Optional; defaults to `alexanderlee-tech-fonts` |

A dedicated read-only token is optional. The downloader uses the Cloudflare REST
API, not S3 access keys. Keep tokens in build secrets, never client-side variables.
Production builds must run `pnpm build:production` in place of `pnpm build`.
This downloads and verifies the fonts before building, and fails if credentials,
files, or checksums are incorrect. `pnpm deploy` uploads the resulting `dist/`
using the existing deployment command. Do not expose authenticated build secrets
to untrusted fork builds. Forks can use `pnpm build` without credentials.

Astro emits the fonts as same-origin static assets with generated filenames.
The deployed webfonts are necessarily downloadable by browsers; the private
bucket keeps the source files and build credentials separate from the public repo.
Run `pnpm test:fonts` to check fallback and download validation behavior.

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
