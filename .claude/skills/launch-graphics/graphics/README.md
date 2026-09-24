# Launch / marketing graphics

Source for internally-generated agentOS marketing graphics (launch heroes,
social images, code-snippet cards). **Only the source lives here** — rendered
PNGs are written to `~/tmp/agentos-graphics/` and are intentionally *not*
committed.

## Generators

| Script | Output | Notes |
| --- | --- | --- |
| `render-launch.mjs` | `launch.png` (2048×1024) | "agentOS Apps" launch/social hero: wordmark lockup + V8 / SQLite / Rivet-Actors app tiles + PREVIEW pill. |
| `render-technical.mjs` | `technical.png` (2048×auto) | Titled header + syntax-highlighted steps from `snippets.json`. |
| `render-dynamic-apps-technical.mjs` | `technical.png` (2048×auto) | Dynamic Apps lockup + steps from `snippets-dynamic-apps.json`. |
| `render-secure-exec-technical.mjs` | `technical.png` (1280×auto) | **Secure Exec treatment**: dark ground, horizontal chrome wordmark, chrome-bordered panel(s) from `snippets-secure-exec.json`, reaper on the top-right block. Writes to `~/tmp/secure-exec-graphics/`. |

```bash
# writes to ~/tmp/agentos-graphics/ by default (pass a dir to override)
node .claude/skills/launch-graphics/graphics/render-launch.mjs
node .claude/skills/launch-graphics/graphics/render-technical.mjs
node .claude/skills/launch-graphics/graphics/render-secure-exec-technical.mjs
```

## How it stays reproducible

- **Fonts:** Manrope + JetBrains Mono are read live from `website/public/fonts/`.
- **`assets/`** (vendored, committed):
  - `v8.svg` — official V8 logo (`v8.dev/_img/v8.svg`).
  - `sqlite.svg` — SQLite logo, color (vectorlogo.zone icon).
  - `actors.svg` — Rivet Actors mark (from the `rivet` repo), recolored to ink at render time.
  - `secure-exec-wordmark.svg` — the flat horizontal Secure Exec wordmark
    (white-on-transparent), kept as the layout reference.
  - `secure-exec-wordmark-chrome.png` — **the horizontal chrome wordmark, which
    does not exist upstream.** Only a stacked chrome lockup ships
    (`public/images/secure-exec/secure-exec-logo.png`), so this was built from
    it: the two words were separated by tracing the trough between them column
    by column, cutting at EXEC's top edge, and giving columns with no EXEC body
    entirely to SECURE (otherwise the trace slices SECURE's final E into an F).
    They were then re-laid out at the flat wordmark's spacing, with EXEC
    positioned by *cap line* rather than bounding box so SECURE's R sits
    slightly above it, as it does in the flat version. Masking chrome into the
    flat outline does not work — the two are different letterform artwork
    (best overlap ≈ 0.40 IoU on EXEC).
  - `NimbusSans-Bold.otf` — URW Helvetica clone. The agentOS wordmark's "OS"
    is a live `<text>` in Helvetica; the site renders it in the viewer's system
    Helvetica, so we embed this clone to render it faithfully off a Mac.
- **playwright** is resolved from the repo's `node_modules` and drives system
  Chromium (`/usr/bin/chromium`).
- **shiki** (`render-technical.mjs` only) is a dev-only highlighter, **not** a
  repo dependency. Resolve order: repo `node_modules` → `SHIKI_DIR=/path/to/node_modules/shiki`.
  If absent: `pnpm add -D shiki`.

## Secure Exec deviates on purpose

secureexec.dev is a dark, chrome-trimmed page, so its art matches that rather
than the Rivet paper surface: ground `#09090b`, panels `#0c0c0e`, and the site's
own conic chrome gradient as the panel border (scaled up from 1px so it reads at
render size). The reaper is layered exactly as on the benchmarks card — body
behind the panel, hand in front, hanging ~39% of its own width past the corner.
Panels come from `snippets-secure-exec.json`; one entry renders a single
untitled block, several render a two-column grid.

## Design decisions (so future edits stay on-brand)

- Background is the site's paper surface `#EFEFEF`; text is ink `#1B1916`
  (`tailwind.config` / `global.css`).
- "Apps" is **Manrope Semibold**, tracking `-0.015em` — the landing page's
  `HERO_H1_CLASS` heading treatment — sized as a supporting label, not competing
  with the wordmark. It's optically centered on the "OS" badge at render time.
- Logo tiles copy the landing page `FLOATING_AGENTS` treatment: rounded-square,
  white→`#f1f1f3` gradient, `ring-ink/10`, layered shadow, individual rotation,
  V8 dominant in the middle.
- Twitter shows 2:1 uncropped, so the canvas is 2048×1024.
