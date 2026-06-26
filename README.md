# lee.computer

## Getting Started

```bash
# install dependencies
pnpm install
# run the development server
pnpm dev
```

The dev server runs on [http://localhost:3000](http://localhost:3000) by default.

## Licensed fonts

Berkeley Mono is a licensed font and is not committed to this repository.

- **Production (Vercel):** fonts are fetched from private Vercel Blob at build time. Link a Blob store to the project so `BLOB_READ_WRITE_TOKEN` is available during builds.
- **Maintainers (local dev):** copy your licensed `.woff2` files into `public/fonts/berkeley-mono/`, or — if you have access to this Vercel project — run `vercel env pull .env.local && pnpm fetch-fonts` to download them from Blob. The token is not in the repo; only Vercel project members can pull it.
- **Contributors:** you do not receive Berkeley Mono. Builds work without it; the site falls back to system monospace.

## Core Technologies

### Next.js

This project uses Next.js as a full-stack framework.

### Testing

#### Vitest

#### React Testing Library

### Deployment

#### Vercel

This project is deployed on Vercel.
