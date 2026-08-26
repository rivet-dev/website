/**
 * Totality check over the route set.
 *
 * The self-host guides are generated from `deployMatrix`, and the sidebar is
 * built from the same source. If the two ever diverge the sidebar links to
 * routes that were never generated, which is invisible until someone clicks.
 * This asserts:
 *
 *   1. Every self-host guide in the matrix has a source file.
 *   2. Every self-host sidebar href resolves to a guide the matrix generates.
 *   3. Every product docs/tutorials sidebar href resolves to a content file.
 *   4. Every sidebar href appears in exactly one tab.
 *   5. Every routed, indexable product-doc page has a sidebar or content inlink.
 *
 * Run with `pnpm check:sitemap`.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import fg from "fast-glob";

import { redirects, wildcardRedirects } from "../redirects.mjs";
import { canonicalizeInternalHref } from "../src/lib/internalHref";
import { guidesFor } from "../src/sitemap/deployMatrix";
import { products } from "../src/sitemap/products";
import type { AnyPage, SidebarItem } from "../src/lib/sitemap";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SELF_HOST_CONTENT = path.join(ROOT, "src/content/self-host");
const DOCS_CONTENT = path.join(ROOT, "src/content/docs");

const errors: string[] = [];

function normalizeHref(href: string) {
  return canonicalizeInternalHref(href);
}

function isRedirectRoute(href: string): boolean {
  const bare = href === "/" ? "/" : href.replace(/\/$/, "");
  if (bare in redirects) return true;
  return wildcardRedirects.some(({ from }) =>
    bare.startsWith(`${from.replace(/\/$/, "")}/`),
  );
}

function collectHrefs(items: (SidebarItem | AnyPage)[], out: string[] = []) {
  for (const item of items) {
    if ("href" in item && typeof item.href === "string") {
      const external =
        ("external" in item && item.external) || item.href.startsWith("http");
      if (!external) out.push(normalizeHref(item.href));
    }
    if ("pages" in item && Array.isArray(item.pages)) {
      collectHrefs(item.pages, out);
    }
  }
  return out;
}

function collectContentInlinks(): Map<string, Set<string>> {
  const inlinks = new Map<string, Set<string>>();
  for (const file of fg.sync("*/*/**/*.mdx", { cwd: DOCS_CONTENT })) {
    const [product, tab, ...rest] = file.split("/");
    const stem = rest
      .join("/")
      .replace(/\.mdx$/, "")
      .replace(/(^|\/)index$/, "");
    const sourceRoute = normalizeHref(
      stem ? `/${product}/${tab}/${stem}` : `/${product}/${tab}`,
    );
    const source = readFileSync(path.join(DOCS_CONTENT, file), "utf8");
    const hrefs = [
      ...source.matchAll(/\]\((\/[^)\s]+)(?:\s+["'][^)]*["'])?\)/g),
      ...source.matchAll(/\bhref\s*=\s*["'](\/[^"']+)["']/g),
    ];
    for (const match of hrefs) {
      const pathname = match[1].split(/[?#]/, 1)[0];
      const target = normalizeHref(pathname);
      if (target === sourceRoute) continue;
      const owners = inlinks.get(target) ?? new Set<string>();
      owners.add(sourceRoute);
      inlinks.set(target, owners);
    }
  }
  return inlinks;
}

/** `workers/kubernetes` -> src/content/self-host/workers/kubernetes.mdx */
function contentFileExists(base: string, slug: string) {
  const stem = slug === "index" || slug === "" ? "index" : slug;
  return (
    existsSync(path.join(base, `${stem}.mdx`)) ||
    existsSync(path.join(base, stem, "index.mdx"))
  );
}

/** Products that actually render the Self-Host tab. Must match the route. */
const selfHostProducts = products.filter((product) =>
  product.tabs.some((tab) => tab.id === "self-host"),
);

// 1. Every guide the matrix promises has a source file.
for (const product of selfHostProducts) {
  for (const guide of guidesFor(product.id)) {
    if (!contentFileExists(SELF_HOST_CONTENT, guide.slug)) {
      errors.push(
        `matrix promises ${product.id}/self-host/${guide.slug} but src/content/self-host/${guide.slug}.mdx is missing`,
      );
    }
  }
}

// 2 + 3. Every sidebar href resolves to something that gets generated.
const seen = new Map<string, string>();
const contentInlinks = collectContentInlinks();

for (const product of products) {
  for (const tab of product.tabs) {
    const owner = `${product.id}:${tab.id}`;
    const generated = new Set(
      tab.id === "self-host"
        ? guidesFor(product.id).map((guide) =>
            guide.slug === "index"
              ? normalizeHref(tab.href)
              : normalizeHref(`${tab.href.replace(/\/$/, "")}/${guide.slug}`),
          )
        : [],
    );

    for (const href of collectHrefs(tab.sidebar)) {
      // 4. No href may belong to two tabs.
      const previous = seen.get(href);
      if (previous && previous !== owner) {
        errors.push(`${href} appears in both ${previous} and ${owner}`);
      }
      seen.set(href, owner);

      if (!href.startsWith(`/${product.id}/`)) continue;

      if (tab.id === "self-host") {
        if (!generated.has(href)) {
          errors.push(
            `${owner} sidebar links ${href}, which deployMatrix does not generate`,
          );
        }
        continue;
      }

      const slug = href
        .slice(`/${product.id}/${tab.id}/`.length)
        .replace(/\/$/, "");
      const base = path.join(DOCS_CONTENT, product.id, tab.id);
      if (
        !contentFileExists(
          base,
          href === normalizeHref(tab.href) ? "index" : slug,
        )
      ) {
        errors.push(
          `${owner} sidebar links ${href}, which has no content file`,
        );
      }
    }

    // Hidden tabs remain routable for existing inbound links, but they are
    // deliberately absent from navigation and noindexed. Everything else that
    // the product-doc route generates must be discoverable from its sidebar.
    if (
      tab.hidden ||
      tab.id === "overview" ||
      tab.id === "use-cases" ||
      tab.id === "self-host"
    ) {
      continue;
    }

    const base = path.join(DOCS_CONTENT, product.id, tab.id);
    if (!existsSync(base)) continue;
    const sidebarHrefs = new Set(collectHrefs(tab.sidebar));
    for (const file of fg.sync("**/*.mdx", { cwd: base })) {
      const stem = file.replace(/\.mdx$/, "").replace(/(^|\/)index$/, "");
      const href = normalizeHref(
        stem ? `/${product.id}/${tab.id}/${stem}` : `/${product.id}/${tab.id}`,
      );
      if (isRedirectRoute(href)) continue;
      if (!sidebarHrefs.has(href) && !contentInlinks.has(href)) {
        errors.push(
          `${owner} routes ${href}, but neither its sidebar nor another docs page links it`,
        );
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`sitemap check failed with ${errors.length} problem(s):\n`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

const guideCount = selfHostProducts.reduce(
  (total, product) => total + guidesFor(product.id).length,
  0,
);
console.log(
  `sitemap check passed: ${products.length} products, ${guideCount} generated self-host pages, ${seen.size} unique sidebar hrefs`,
);
