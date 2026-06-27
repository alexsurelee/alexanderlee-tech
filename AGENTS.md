<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read
the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

Use pnpm.

@.cursor/rules/logging-wide-events.mdc

## Cursor Cloud specific instructions

Self-contained Next.js 16 / React 19 personal site (`lee.computer`). No database or external services are needed for development. Standard scripts live in `package.json` (`dev`, `lint`, `test`, `build`, `storybook`).

- `pnpm dev` serves on `http://localhost:3000` (Turbopack). `pnpm lint`, `pnpm test` (Vitest), and `pnpm dev`/`pnpm build` all run with no secrets.
- Berkeley Mono is a licensed font and is not in the repo. Without `BLOB_READ_WRITE_TOKEN`, `pnpm build` runs `fetch-fonts`, which warns and exits 0 — the site falls back to system monospace (see `README.md`). The font fetch only hard-fails on Vercel. So missing-font warnings during build are expected, not errors.
- The build scripts for `esbuild`, `sharp`, and `unrs-resolver` are not auto-approved by pnpm; this is fine — lint, tests, dev, and build all work without them.
