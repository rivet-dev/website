# sync-docs

Publishes a product repo's `docs/` bundle to
[rivet-website](https://github.com/rivet-dev/website).

Docs live in the repo that owns the product; the website symlinks a sibling
checkout in local dev and reads `vendor/<product>/` in CI. This action is the
transport between the two, and merging its PR is also what triggers a deploy.

## Use it

Drop this in the product repo as `.github/workflows/docs-sync.yml`:

```yaml
name: Sync docs
on:
  push:
    branches: [main]
    paths: ["docs/**"]
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: rivet-dev/website/.github/actions/sync-docs@main
        with:
          product: agentos            # must match DOCS_SOURCES in the website
          token: ${{ secrets.RIVET_WEBSITE_TOKEN }}
```

`RIVET_WEBSITE_TOKEN` needs `contents: write` and `pull-requests: write` on
rivet-website only. A GitHub App installation token scoped to that single repo
is the intended shape; `GITHUB_TOKEN` cannot reach another repository.

## What it does

1. Validates the bundle — `docs/content/` exists, `docs/sidebar.json` parses,
   at least one `.mdx`, and every `<CodeSnippet>` target is shipped by the same
   product bundle. Fails on the product repo rather than breaking the website
   build.
2. Copies `docs/` to `vendor/<product>/docs/` in the website, replacing it so
   deleted pages actually disappear. Repository instruction files are excluded,
   and broken symlinks fail the sync before they can poison the website checkout.
3. Opens or force-updates `docs-sync/<product>`, and auto-merges when checks
   pass.

## Inputs

| Input | Default | Notes |
| --- | --- | --- |
| `product` | — | Required. Must match a key in the website's `DOCS_SOURCES`. |
| `token` | — | Required. Write access to rivet-website. |
| `source` | `docs` | Bundle path in this repo. |
| `website-repo` | `rivet-dev/website` | Override for forks. |
| `extra-paths` | — | Repo-root-relative paths required by the docs, such as `examples`. |
| `auto-merge` | `true` | Set `false` to review each sync. |
