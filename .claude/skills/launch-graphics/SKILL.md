---
name: launch-graphics
description: Generate agentOS marketing/launch graphics (launch & social heroes, code-snippet cards) from the committed generators in .claude/skills/launch-graphics/graphics. Use when asked to make, update, or render an agentOS launch image, social image, "agentOS Apps" graphic, or technical code-snippet image.
---

# agentOS launch graphics

Source generators live in **`.claude/skills/launch-graphics/graphics/`** (committed). Rendered
PNGs go to **`~/tmp/agentos-graphics/`** — never commit output images.

## Generate

```bash
node .claude/skills/launch-graphics/graphics/render-launch.mjs      # launch/social hero → ~/tmp/agentos-graphics/launch.png
node .claude/skills/launch-graphics/graphics/render-technical.mjs   # code-snippet card  → ~/tmp/agentos-graphics/technical.png
```

- Pass an output dir as arg 1 to override (default `~/tmp/agentos-graphics/`).
- `render-technical.mjs` needs `shiki` (dev-only, not a repo dep): set
  `SHIKI_DIR=/path/to/node_modules/shiki` or `pnpm add -D shiki`.
- After rendering, open the PNG to review before sharing.

## Editing

- Read `.claude/skills/launch-graphics/graphics/README.md` first — it records the brand
  decisions (palette, fonts, "Apps" treatment, tile styling) to stay on.
- Change layout/typography/snippets in the `render-*.mjs` files or
  `snippets.json`; keep new external logos vendored in `.claude/skills/launch-graphics/graphics/assets/`.
- Iterate by re-running and viewing the PNG; tune sizes/spacing until it reads right.
