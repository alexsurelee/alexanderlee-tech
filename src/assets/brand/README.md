# Brand assets

- `public/brand/logo.svg` and `public/favicon.svg` use the supplied
  `logo-simple-small.svg`. The simplified mark works best at header and tab sizes.
- `public/favicon.ico` contains 16, 32, and 48 pixel PNG versions of that mark.
- `public/apple-touch-icon.png` uses the same mark at 180 × 180 with padding and
  an opaque background matching the site's light paper colour (`#faf6ee`).
- `crest.svg` preserves the supplied `logo-high.svg` as the full-detail master.
- `social.png` centres that crest on a 1200 × 630 paper-coloured canvas.
  `BaseHead.astro` uses it whenever a page does not supply its own preview image.

The header reserves 44 × 44 pixels for the mark to avoid layout shift. Its image
has an empty alt attribute because the adjacent site name labels the home link.
The supplied WebP, JPEG, and other PNG exports are unnecessary for these uses;
the SVG masters provide crisp output without a baked-in white or HDR background.
