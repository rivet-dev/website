# Hidden & unfinished

Everything deliberately not shown on the site, and why. Delete a row when the
thing ships; do not delete a row because it got stale.

Tabs are hidden by narrowing `tabs` in `src/sitemap/product-metadata.ts`. A
hidden tab's pages still build and still resolve, so existing links keep
working — they are just unreachable from the nav.

## Hidden tabs

| Product | Tab | Why | To restore |
| --- | --- | --- | --- |
| All | Use Cases | Only agentOS has real copy; the other three are stubs | Write the three, add `"use-cases"` back to each `tabs` |
| Actors | Learn | Cookbooks are thin and the section has no landing copy | Add `"learn"` to `optionalTabs` and `tabs` |
| agentOS | Learn | Was generated from `examples/*/README.md` by a loader that did not survive the split. Content deleted; READMEs still in `~/agentos/examples/` | Port the loader or convert the READMEs to MDX |
| Dynamic Apps | Learn | Placeholder only, deleted | Write it |
| Workflows | Learn | Placeholder only, deleted | Write it |

### Pages behind the hidden Actors Learn tab

Still routed at `/actors/learn/*`, unreachable from the nav:

- `a-radically-simpler-architecture` — a full essay, the strongest piece here
- `ai-agent`, `chat-room`, `collaborative-text-editor`, `cron-jobs`,
  `live-cursors`, `multiplayer-game`, `per-tenant-database` — cookbooks

## Hidden products

| Product | Why |
| --- | --- |
| Agents (`/agents/docs`) | **Temporary, until Agents launches.** Built and routed, but `unlaunched: true` in `product-metadata.ts` drops it from every listing: the homepage "there's an Actor for it" plates (the Actors primitive stands in its slot wearing the Agents blue — see `HOMEPAGE_ACTOR_PLATES` in `src/data/actor-types.ts`), the docs tab strip, the Documentation menu, the footer, the registry, and the `/docs/` card grid (commented out in `src/content/docs/docs/index.mdx`). To restore: delete `unlaunched`, delete the stand-in, uncomment the card |
| Sandboxes (`/agentos/docs`) | **Temporary.** Sandboxes is agentOS as an API, so its Sandboxes tab in the docs strip and its listings link to the agentOS docs at `/agentos/docs/` (`docsHome` in `product-metadata.ts`); it owns no bundle or routes of its own. The plan is to serve the agentOS bundle under `/sandboxes/docs/` (`bundleOf` + `RerootLinks.astro` already support it) once the agentOS pages are ready to move; until then no `/sandboxes/*` path exists |
| Rivet Cloud | Managed platform, not one of the four pillars. It has no product vertical: its bundle renders inside the Deploy section (`/orchestrate/deploy/{cloud,byoc}/`) and its marketing page is `/pricing/`. `hidden: true` keeps it out of the switcher |
| Secure Exec (`/secure-exec`) | The isolate runtime underneath agentOS, moved here from secureexec.dev. A library, not one of the four pillars. `hidden: true` keeps it out of the switcher and the `/docs` index; it is reachable from the footer. Its Overview keeps secureexec.dev's own dark design on purpose, scoped under `.secure-exec-page`, with the header and footer forced dark for that page only (`darkChrome`) |

## TODO pages

Pages that render a TODO callout. These are live and indexed.

| Page | Owner |
| --- | --- |
| `/actors/integrations` | this repo — now a card grid, remove once copy lands |
| `/agentos/integrations` | this repo |
| `/actors/docs/http-api` | rivet repo |
| `/agentos/docs/software` (was `/agentos/docs/software`) | agentos repo |
| `/dynamic-apps/docs`, `/docs/concepts`, `/docs/quickstart` | dynamic-apps repo — whole vertical unwritten |
| `/secure-exec/docs` | secure-exec repo — docs not ported from secureexec.dev yet. `vendor/secure-exec` is a one-page placeholder bundle, and the Overview's deep docs links still point at `https://secureexec.dev/docs/*` until they land |

## Content parked, not published

`src/content/_pending-rewrite/` holds the pre-split originals. Nothing there is
routed.

- 24 files superseded by the rewritten Self-Host section. Safe to delete.
- `quickstart/index.mdx` — a product quickstart card grid that was swept in by
  mistake. Not self-hosting content.

## Removed outright

Recorded so nobody re-derives them from an old sitemap.

| Thing | Note |
| --- | --- |
| `/typedoc/*` | Generated API docs, output was stale. Regenerate in the rivet repo if it comes back |
| `/llms-full.txt` | `/llms.txt` remains and is generated at build time |
| `/rivet.schema.json` | |
| `.md` variants of docs URLs | The feature was documented but never built. Its docs page is gone too |
| `/meme/wired-in` | |
| `/docs/tools/*` | Redirect-only route, now a redirect map entry |
| `/learn` course landing | Its one real page became an Actors Learn guide |

## Deployment platforms not offered

Adding one means an entry in `packages/shared-data/src/deploy.ts`, which also
puts it on the homepage hosting row.

| Platform | Why not |
| --- | --- |
| Hetzner | It is a VM. Named in both VM guides; `/docs/deploy/hetzner` redirects there |
| AWS Lambda (worker) | Listed, but the guide is a placeholder: no source material existed and the 15-minute invocation cap needs real guidance |
