# Dark mode: asset notes

Dark mode is driven by `html[data-theme="dark"]` (see `src/components/ThemeScript.astro`,
`src/styles/theme.css`, and the CSS-variable tokens in `tailwind.config.ts`). Most of
the site retints through tokens. The assets below do not, so each one is either
handled by a CSS rule in `theme.css` or still needs a real dark variant.

Run `node scripts/check-theme.mjs` against a dev server to verify the CSS-handled cases.

## Handled in CSS (no new files needed)

| Asset | Where it is used | How dark mode is handled |
| --- | --- | --- |
| `src/images/rivet-logos/icon-text-black.svg`, `icon-text-white.svg` | `Header.tsx` `RivetLogo`, mobile menu | Both files render; `.rivet-logo-light` / `.rivet-logo-dark` show one per theme. |
| `src/images/logos/a16z.svg` (white-on-transparent) | `startups/StartupsPage.tsx`, `pricing/PricingPageClient.tsx` | `theme-light-invert`: inverted to ink on light, left white on dark. Was a hardcoded `invert`, which rendered black on black. |
| `public/images/tools/rust.svg`, `effect.svg` (black-on-transparent) | `orchestration/ToolsSection.tsx` | `theme-monochrome-logo` inverts them in dark. |
| `public/images/agent-logos/pi.svg`, `opencode.svg`, `public/images/frameworks/eve.svg` | `agentos/AgentOSPage.tsx` | `theme-monochrome-logo`. |
| `public/images/registry/*.svg` vendor marks (e.g. `vercel.svg` is `#18181B`) | `registry/RegistryIconTile.tsx`, `orchestration/ActorTypesSection.tsx` | `registry-logo-plate` keeps a literal white plate and light `color-scheme` so dark marks stay readable. |
| Brand kit light-ground specimens (`rivet-logos/icon-text-black.svg`, `icon-white.svg`) | `BrandKit.tsx` | `registry-logo-plate` on the preview so the specimen sits on white as labeled. |
| `public/images/world-map.svg` | `CareerMap.tsx` | `.career-map-artwork` gets `brightness(0) invert(1)` in dark. |
| `public/images/vendors/flue.svg`, `public/images/frameworks/flue.svg` | registry, agentOS, Actor types | Self-contained tile (ink `#1B1916` square with white glyph); works on both surfaces. On the Integrations cards and sidebar it takes `theme-monochrome-logo` with the other vendor marks, so it inverts to a white tile there. |
| `public/images/vendors/eve.svg`, `workflow.svg`, `durable-streams.svg`, `rivet.svg` (ink `#1B1916` on transparent; were `currentColor`, which resolves to black inside `<img>` on both themes) | `docs/IntegrationCards.tsx`, `DocsNavigation.tsx` sidebar icons | `theme-monochrome-logo` inverts them in dark. On the registry and the homepage wayfinder they sit on `registry-logo-plate` and stay ink. |
| Product wordmarks `src/images/products/*-logo.svg` | `ProductBadge`, `ProductLockup`, `StackSection` | Always white inside an ink or accent tile (AGENTS.md rule). No change needed. |
| Inline SVG diagrams that hardcode the light palette (`#1b1916`, `#56524a`, `#8a8578`, `#2E4034`, `#ffffff`, `#faf8f3`, `#e7ece7`) as presentation attributes | Vendored docs under `vendor/*/docs` (versions, tracing, dynamic-apps, agentOS architecture, quickstarts) and dated blog posts | `theme.css` remaps each hex to its dark token with `[fill="…" i]` / `[stroke="…" i]` selectors inside `.docs-article` and `.blog-article`; CSS wins over a presentation attribute. Surface remaps are guarded by `svg:has(ink-or-pine)` so they never touch another palette. Website-owned diagrams (`src/components/docs/*Diagram.astro`, `src/content/self-host/**`) were converted to `rgb(var(--site-*, fallback))` tokens instead and need no remap. |
| Inline SVG diagrams drawn in a foreign palette (agentOS `security-model`, `architecture/posix-syscalls`, `architecture/packages-and-command-resolution` use Tailwind zinc/slate/indigo/emerald) | `vendor/agentos/docs` | `theme.css` applies `invert(1) hue-rotate(180deg)` to any `.docs-article svg[role="img"]` that uses neither tokens, `currentColor`, nor the site palette. |
| Excalidraw PNG diagrams on an opaque white plate (`assets.rivet.dev/website/docs/general/runtime-modes/*.png`, `endpoints/endpoint-env-vars.png`, `website/learn/act-1/scene-1/*.png`) | `vendor/docs/docs/content/runtime-modes.mdx`, `endpoints.mdx`; `src/content/guides/a-radically-simpler-architecture.mdx` | `theme.css` applies `invert(1) hue-rotate(180deg)` to `.docs-article img[alt*="diagram" i]` and to `.theme-diagram-invert`. Vendored `<img>`s match on their alt text; the two guide figures whose alt lacks "diagram" carry the class. Screenshots never match. |
| Mermaid fences (`pre.mermaid`, only in `src/content/posts/2026-06-17-introducing-the-rust-sdk/page.mdx` outside the Learn section) | `MermaidScript.astro` | Picks `neutral`/`dark` from the background luminance at render, keeps the source in `data-mermaid-source`, and re-renders on the `theme-change` event so a toggle does not leave a stale light diagram. |

## Intentionally unchanged

| Asset | Reason |
| --- | --- |
| Oil-paint textures passed as `textureSrc` to `InkPanel` (CTA colophon, 404) | Already sit on ink; they read the same on both themes. |
| Photography (`/startups` YC and Speedrun photos, careers) | Photos are not themed. |
| Dashboard screenshots (`assets.rivet.dev/.../rivet-actors-inspector-state.png`) | The dashboard is dark already. |
| Secure Exec overview (`/secure-exec`) and the Learn section | Fixed dark via `data-fixed-theme="dark"`; the toggle is hidden there. |
| agentOS `javascript-executor-{wakeup-sequence,readiness-state}-dark.svg` (`vendor/agentos/docs/public/images/architecture/`) | Exported on their own dark plate with light text, so they are self-contained on both themes, like a screenshot. Their alt text does not contain "diagram", so the raster invert rule does not touch them. |

## Still needs a real dark variant

None are blocking. These would look sharper with dedicated files than with a filter:

| Asset | Current treatment | Better |
| --- | --- | --- |
| `public/images/tools/rust.svg`, `effect.svg`, `agent-logos/pi.svg`, `opencode.svg`, `frameworks/eve.svg` | CSS `invert(1)` | Ship `*-dark.svg` white variants and pick by theme like `RivetLogo`, so anti-aliasing and any non-black detail survive. |
| `public/images/world-map.svg` | `brightness(0) invert(1)` at 0.4 opacity | A single-color SVG using `currentColor` would remove the filter. |
| Open Graph images (`ogImage` in `BaseLayout.astro`) | Always light | Not visible in-page; only matters if a dark OG variant is wanted. |
| Vendored inline SVG diagrams (see the two diagram rows above) | Hex remap / `invert(1) hue-rotate(180deg)` | Redraw upstream in the product repos with `rgb(var(--site-ink, 27 25 22))`-style tokens and `--runtime-highlight`, as `vendor/docs/docs/content/architecture.mdx` and `jwt.mdx` already do. Once a diagram uses tokens it is excluded from both fallbacks automatically. |

## Rules of thumb for new assets

- Prefer `currentColor` SVGs inline or as React components; they retint for free.
- If an `<img>` mark is single-color black, add `theme-monochrome-logo`; if single-color white, add `theme-light-invert`.
- If a mark is multi-color and drawn for white, put it on a `registry-logo-plate` tile rather than filtering it.
- Never filter product wordmarks; they live in tiles (see AGENTS.md, Product Marks).
