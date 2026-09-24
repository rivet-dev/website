# SEO and Open Graph plan

Status of the site-wide Open Graph refresh and the SEO work that remains. Check items off here as they land; `pnpm check:seo` (after `pnpm build`)
is the gate for titles, descriptions, canonical URLs, JSON-LD, and internal links.

## How OG images work now

- Cards are declared in `src/lib/ogImage.ts` (`OG_CARDS`). One entry per card:
  headline, supporting line, optional product mark. Copy for product cards is
  derived from `src/sitemap/product-metadata.ts` taglines.
- `pnpm render:og [ids...]` (`scripts/render-og-images.ts`) renders each card to
  `public/images/og/<id>.png` at 2400×1260 with Playwright and quantizes it with
  sharp (160–530 KB each). The PNGs are committed so the build stays hermetic and
  no upload credentials are needed. Re-run after editing copy or product taglines.
- Pages reference a card with `ogImageFor(id)` or `productOgImage(productId)`.
  `BaseLayout` defaults to `default`; `MarketingLayout` falls back to the owning
  product's card when `productId` is set; `DocsArticlePage` does the same and
  falls back to `docs`.
- The `/secure-exec/` overview keeps its ported dark card at 1280×630
  (`SECURE_EXEC_OVERVIEW_OG_IMAGE`); its docs use the generated light card.

## Done in this pass

- [x] 18 cards rendered: default, actors, agentos, workflows, dynamic-apps, cloud,
      secure-exec, docs, deploy, guides, integrations, registry, blog, enterprise,
      startups, talk-to-an-engineer, support, brand.
- [x] Every page family wired: home and all uncustomized marketing pages (default),
      pricing (cloud), agentOS overview and registry (agentos), compare pages
      (product), product docs and overviews (product), site docs (docs), Deploy
      (deploy), Guides (guides), Integrations (integrations), blog and changelog
      index and posts without a hero image (blog), enterprise, startups, support,
      talk-to-an-engineer, brand, registry.
- [x] Secure Exec overview `og:image:height` fixed (was 640 for a 630 px image).
- [x] Stale remote cards no longer referenced:
      `assets.rivet.dev/website/public/promo/og-agentic-era.png` and
      `promo/og/{cloud,agentos}.png`.
- [x] Company facts centralized in `src/data/company.ts` and emitted as the
      site-wide Organization JSON-LD (legalName, foundingDate, address, founders
      with sameAs, LinkedIn added to sameAs, support contact URL).
- [x] FAQ questions render as `<h3>` on every FAQ (`FaqList`), so FAQ sections read
      as an outline to crawlers.

## Needs a human decision

- [ ] **Homepage positioning.** The hero says "The orchestrator for agentic
      workloads."; `CLAUDE.md` and the footer still say "Infrastructure for the
      agentic era." The default OG card and `COMPANY.description` follow the hero.
      Pick one and update the footer, `CLAUDE.md` canon, and the pricing closing
      CTA to match.
- [ ] **Founding date** in `src/data/company.ts` is 2022 (YC profile); LinkedIn
      says January 2023. Confirm which the Organization JSON-LD should carry.
- [ ] **About page.** Built to the eight-section outline, then removed at the
      founder's request. Revisit if a company page is wanted; the Organization
      JSON-LD already carries the facts it would repeat.

## Next: metadata and structured data

- [ ] Author `Person` JSON-LD on blog posts (`BlogLayout`) using `AUTHORS` in
      `src/lib/article.tsx`, linked to the founders' `sameAs` from
      `src/data/company.ts`.
- [ ] Per-post OG cards for blog posts without a hero image: extend
      `render-og-images.ts` to take a title and emit `public/images/og/blog/<slug>.png`,
      or render at build time.
- [ ] Refresh the careers OG image
      (`assets.rivet.dev/website/images/careers/careers-og-1200x630.*.webp`) as a
      generated card so it matches the set.
- [ ] Title audit: `pnpm check:seo` enforces 20–65 characters; a spot check of the
      docs titles that hit the ceiling (`contextualSeoTitle`) is worthwhile.
- [ ] Resolve the pre-existing `check:seo` failures on Secure Exec: forbidden
      `SoftwareApplication` JSON-LD on `/secure-exec/` and five
      `/secure-exec/docs/comparison/*` pages with no incoming internal links.

## Next: content

- [ ] Compare pages for systems the site does not cover yet (Kubernetes-per-tenant,
      E2B, Modal).
- [ ] Customer stories or logos section once legal clears names.
- [ ] `llms.txt`: add a short company summary block above the URL list drawn from
      `COMPANY.description`.

## Operational

- [ ] Optionally mirror `public/images/og/*.png` to `assets.rivet.dev` and switch
      `ogImageFor` to absolute URLs if the CDN is preferred over the site origin.
      Not required; social crawlers fetch from `rivet.dev` fine.
- [ ] After deploy, re-scrape the key URLs in the X Card Validator, LinkedIn Post
      Inspector, and Facebook Sharing Debugger so cached previews update.
- [ ] Check the Organization rich result report in Google Search Console for the
      new founder and address fields.
