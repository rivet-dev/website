/**
 * Crawls the static build and enforces the SEO invariants that are otherwise
 * easy to break across Astro routes, product-owned docs, and shared chrome.
 *
 * Run after `pnpm build`. Set CHECK_REMOTE_ASSETS=1 to verify first-party
 * remote images as well as files emitted into dist/.
 */
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import fg from "fast-glob";
import { parse } from "parse5";

import { redirects, wildcardRedirects } from "../redirects.mjs";

interface HtmlAttribute {
  name: string;
  value: string;
}

interface HtmlNode {
  nodeName: string;
  tagName?: string;
  attrs?: HtmlAttribute[];
  childNodes?: HtmlNode[];
  content?: HtmlNode;
  value?: string;
}

interface Page {
  file: string;
  route: string;
  root: HtmlNode;
  redirect: boolean;
  robots: string;
  canonical?: URL;
  canonicalPage: boolean;
  indexable: boolean;
}

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIST = path.join(ROOT, "dist");
const SITE_ORIGIN = "https://rivet.dev";
const MIN_TITLE = 20;
const MAX_TITLE = 65;
const MIN_DESCRIPTION = 100;
const MAX_DESCRIPTION = 160;
const MAX_STATIC_POST_IMAGE_BYTES = 350_000;
const MAX_ANIMATED_POST_IMAGE_BYTES = 900_000;
const MAX_IMAGE_BYTES = 1_000_000;

// These paths intentionally leave the site at the edge and therefore do not
// have a generated HTML target. `/discord` is the public short link retained
// for dated posts and support documentation.
const ALLOWED_EDGE_REDIRECT_LINKS = new Set(["/discord", "/discord/"]);

// Dated posts are records, so their original links remain in the article body
// and are served by the legacy redirect map. Keep the exemption explicit: a
// newly introduced redirect link in a post must be reviewed and added here.
const ALLOWED_HISTORICAL_REDIRECT_LINKS = new Set([
  "/docs/actors",
  "/docs/actors/",
  "/docs/actors/actions/",
  "/docs/actors/ai-and-user-generated-actors/",
  "/docs/actors/authentication/",
  "/docs/actors/communicating-between-actors/",
  "/docs/actors/connections/",
  "/docs/actors/crash-course/",
  "/docs/actors/debugging/",
  "/docs/actors/ephemeral-variables/",
  "/docs/actors/events/",
  "/docs/actors/fetch-and-websocket-handler/",
  "/docs/actors/keys/",
  "/docs/actors/lifecycle/",
  "/docs/actors/queues/",
  "/docs/actors/quickstart/",
  "/docs/actors/quickstart/effect/",
  "/docs/actors/quickstart/next-js/",
  "/docs/actors/quickstart/rust/",
  "/docs/actors/scaling/",
  "/docs/actors/schedule/",
  "/docs/actors/sqlite-drizzle/",
  "/docs/actors/sqlite/",
  "/docs/actors/state/",
  "/docs/actors/websocket-handler/",
  "/docs/actors/workflows/",
  "/docs/cli/",
  "/docs/clients/javascript/",
  "/docs/clients/react/",
  "/docs/clients/swift/",
  "/docs/clients/swiftui/",
  "/docs/cloud/",
  "/docs/cloud/api/actors/create/",
  "/docs/cloud/api/routes/update/",
  "/docs/cloud/self-hosting/single-container/",
  "/docs/deploy/",
  "/docs/deploy/rivet-compute/",
  "/docs/self-hosting/",
  "/integrations/better-auth/",
  "/pricing/",
  "/sales/",
]);

const errors: string[] = [];
const warnings: string[] = [];

const AUDITED_OVERSIZED_IMAGES = new Set([
  "https://assets.rivet.dev/website/blog/2026-07-20-introducing-cron-jobs-for-rivet-actors/image.png",
  "https://assets.rivet.dev/website/blog/2025-1-12-rivet-inspector/rivet-inspector-launch.gif",
  "https://assets.rivet.dev/website/blog/2026-07-28-introducing-agentos-execution-api-for-javascript-and-python/image.png",
  "https://assets.rivet.dev/website/blog/2026-07-06-introducing-the-agentos-package-registry/image.png",
  "https://assets.rivet.dev/website/blog/2026-06-17-introducing-the-rust-sdk/image.png",
  "https://assets.rivet.dev/website/blog/2026-06-15-introducing-rivet-2-3/image.png",
  "https://assets.rivet.dev/website/blog/2024-12-21-rivet-actors-launch/image.png",
  "https://assets.rivet.dev/website/blog/godot-multiplayer-compared-to-unity/image.png",
  "https://assets.rivet.dev/website/blog/2026-07-26-sandboxes-vs-webassembly-lambda-vs-workers-round-two/software-registry.png",
  "https://assets.rivet.dev/website/blog/2026-06-16-introducing-the-effect-sdk/image.png",
  "https://assets.rivet.dev/website/blog/2026-06-19-secure-exec-v0-3/image.png",
]);

const redirectPaths = new Set<string>();
for (const from of Object.keys(redirects)) {
  const bare = from === "/" ? "/" : from.replace(/\/$/, "");
  redirectPaths.add(bare);
  redirectPaths.add(bare === "/" ? "/" : `${bare}/`);
}

function walk(node: HtmlNode, visit: (node: HtmlNode) => void) {
  visit(node);
  for (const child of node.childNodes ?? []) walk(child, visit);
  if (node.content) walk(node.content, visit);
}

function elements(root: HtmlNode, tagName: string): HtmlNode[] {
  const result: HtmlNode[] = [];
  walk(root, (node) => {
    if (node.tagName === tagName) result.push(node);
  });
  return result;
}

function attr(node: HtmlNode, name: string): string | undefined {
  return node.attrs?.find((item) => item.name === name)?.value;
}

function hasAttr(node: HtmlNode, name: string): boolean {
  return node.attrs?.some((item) => item.name === name) ?? false;
}

function textContent(node: HtmlNode): string {
  if (node.nodeName === "#text") return node.value ?? "";
  return (node.childNodes ?? []).map(textContent).join("");
}

function normalizedText(node: HtmlNode): string {
  return textContent(node).replace(/\s+/g, " ").trim();
}

function routeForFile(file: string): string {
  const relative = path.relative(DIST, file).split(path.sep).join("/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) {
    return `/${relative.slice(0, -"index.html".length)}`;
  }
  return `/${relative}`;
}

function isDirectoryPath(pathname: string): boolean {
  if (pathname === "/") return true;
  const lastSegment = pathname.slice(pathname.lastIndexOf("/") + 1);
  return !lastSegment.includes(".");
}

function ensureDirectorySlash(pathname: string): string {
  if (!isDirectoryPath(pathname) || pathname.endsWith("/")) return pathname;
  return `${pathname}/`;
}

function pathFromHref(href: string, pageRoute: string): string | null {
  if (!href || href.startsWith("#")) return null;
  if (/^(?:mailto|tel|javascript|data):/i.test(href)) return null;
  try {
    const url = new URL(href, `${SITE_ORIGIN}${pageRoute}`);
    if (url.origin !== SITE_ORIGIN) return null;
    return url.pathname;
  } catch {
    return null;
  }
}

function isRedirectPath(pathname: string): boolean {
  if (redirectPaths.has(pathname)) return true;
  return wildcardRedirects.some(({ from }) => {
    const prefix = from.endsWith("/") ? from : `${from}/`;
    return pathname.startsWith(prefix);
  });
}

function isHistoricalPage(route: string): boolean {
  return /^\/(?:blog|changelog)\//.test(route);
}

function metaByName(root: HtmlNode, name: string): HtmlNode[] {
  return elements(root, "meta").filter(
    (node) => attr(node, "name")?.toLowerCase() === name.toLowerCase(),
  );
}

function metaByProperty(root: HtmlNode, property: string): HtmlNode[] {
  return elements(root, "meta").filter(
    (node) => attr(node, "property")?.toLowerCase() === property.toLowerCase(),
  );
}

function canonicalNodes(root: HtmlNode): HtmlNode[] {
  return elements(root, "link").filter((node) =>
    (attr(node, "rel") ?? "").toLowerCase().split(/\s+/).includes("canonical"),
  );
}

function hasMarkdown(value: string): boolean {
  return /(?:\*\*|__|`|\[[^\]]+\]\([^)]+\)|(?:^|\s)#{1,6}\s)/.test(value);
}

function schemaTypes(value: unknown, out = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) schemaTypes(item, out);
    return out;
  }
  if (!value || typeof value !== "object") return out;
  for (const [key, child] of Object.entries(value)) {
    if (key === "@type") {
      for (const type of Array.isArray(child) ? child : [child]) {
        if (typeof type === "string") out.add(type);
      }
    } else {
      schemaTypes(child, out);
    }
  }
  return out;
}

function schemaContainsMarkdown(value: unknown): boolean {
  if (typeof value === "string") return hasMarkdown(value);
  if (Array.isArray(value)) return value.some(schemaContainsMarkdown);
  if (!value || typeof value !== "object") return false;
  return Object.values(value).some(schemaContainsMarkdown);
}

function localAssetPath(urlPath: string): string {
  return path.join(DIST, decodeURIComponent(urlPath.replace(/^\//, "")));
}

async function fileSize(urlPath: string): Promise<number | null> {
  try {
    const stats = await stat(localAssetPath(urlPath));
    return stats.isFile() ? stats.size : null;
  } catch {
    return null;
  }
}

async function isAnimatedWebp(urlPath: string): Promise<boolean> {
  try {
    const bytes = await readFile(localAssetPath(urlPath));
    return (
      bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
      bytes.subarray(8, 12).toString("ascii") === "WEBP" &&
      bytes.includes(Buffer.from("ANIM"))
    );
  } catch {
    return false;
  }
}

function imageUrls(node: HtmlNode): string[] {
  const urls = new Set<string>();
  const src = attr(node, "src");
  if (src) urls.add(src);
  const srcset = attr(node, "srcset");
  if (srcset) {
    for (const candidate of srcset.split(",")) {
      const url = candidate.trim().split(/\s+/)[0];
      if (url) urls.add(url);
    }
  }
  return [...urls];
}

function srcsetWidths(node: HtmlNode): number[] {
  const srcset = attr(node, "srcset");
  if (!srcset) return [];
  return srcset
    .split(",")
    .map((candidate) => candidate.trim().match(/\s(\d+)w$/)?.[1])
    .filter((width): width is string => Boolean(width))
    .map(Number)
    .sort((a, b) => a - b);
}

function sameNumbers(actual: number[], expected: number[]): boolean {
  return (
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index])
  );
}

function normalizedAuditedImage(url: string): string | null {
  try {
    const parsed = new URL(url, SITE_ORIGIN);
    if (parsed.origin !== "https://assets.rivet.dev") return null;
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return null;
  }
}

function remotePayloadSize(response: Response): number | null {
  const contentRange = response.headers.get("content-range");
  const rangeTotal = contentRange?.match(/\/(\d+)$/)?.[1];
  if (rangeTotal) return Number(rangeTotal);
  const contentLength = response.headers.get("content-length");
  return contentLength ? Number(contentLength) : null;
}

async function checkFirstPartyRemoteImage(url: string): Promise<string | null> {
  const parsed = new URL(url);
  if (parsed.hostname !== "assets.rivet.dev") return null;

  let lastStatus: number | undefined;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      let response = await fetch(url, {
        method: "HEAD",
        headers: { "user-agent": "rivet-seo-check/1.0" },
        signal: AbortSignal.timeout(10_000),
      });
      if (
        response.status === 403 ||
        response.status === 405 ||
        (response.ok && remotePayloadSize(response) === null)
      ) {
        response = await fetch(url, {
          headers: {
            "user-agent": "rivet-seo-check/1.0",
            range: "bytes=0-0",
          },
          signal: AbortSignal.timeout(10_000),
        });
      }
      lastStatus = response.status;
      if (response.ok || response.status === 206) {
        const size = remotePayloadSize(response);
        await response.body?.cancel();
        if (size === null || !Number.isFinite(size)) {
          return `${url} did not expose a verifiable payload size`;
        }
        if (size >= MAX_IMAGE_BYTES) {
          return `${url} is ${size} bytes (limit is under ${MAX_IMAGE_BYTES})`;
        }
        return null;
      }
    } catch {
      // Retry transient network failures before reporting the URL.
    }
  }
  return `${url} returned ${lastStatus ?? "a network error"}`;
}

async function mapWithConcurrency<T, R>(
  values: T[],
  limit: number,
  worker: (value: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(values.length);
  let cursor = 0;
  async function run() {
    while (cursor < values.length) {
      const index = cursor++;
      results[index] = await worker(values[index]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, values.length) }, () => run()),
  );
  return results;
}

const htmlFiles = await fg("**/*.html", { cwd: DIST, absolute: true });
if (htmlFiles.length === 0) {
  console.error(
    "SEO check failed: dist/ contains no HTML. Run `pnpm build` first.",
  );
  process.exit(1);
}

const pages: Page[] = [];
for (const file of htmlFiles) {
  const route = routeForFile(file);
  const root = parse(await readFile(file, "utf8")) as unknown as HtmlNode;
  const redirect = elements(root, "meta").some(
    (node) => attr(node, "http-equiv")?.toLowerCase() === "refresh",
  );
  const robots =
    attr(metaByName(root, "robots")[0] ?? { nodeName: "" }, "content") ?? "";
  const canonicals = canonicalNodes(root);
  let canonical: URL | undefined;
  if (!redirect && canonicals.length !== 1) {
    errors.push(
      `${route}: expected one canonical link, found ${canonicals.length}`,
    );
  } else if (canonicals.length === 1) {
    const href = attr(canonicals[0], "href");
    try {
      canonical = href ? new URL(href, SITE_ORIGIN) : undefined;
    } catch {
      errors.push(`${route}: canonical URL is invalid: ${href}`);
    }
    if (canonical?.origin !== SITE_ORIGIN) {
      errors.push(`${route}: canonical must use ${SITE_ORIGIN}`);
    }
    if (
      canonical &&
      ensureDirectorySlash(canonical.pathname) !== canonical.pathname
    ) {
      errors.push(`${route}: canonical directory URL needs a trailing slash`);
    }
  }
  const canonicalPage = canonical?.pathname === route;
  const indexable = !robots.toLowerCase().includes("noindex") && canonicalPage;
  pages.push({
    file,
    route,
    root,
    redirect,
    robots,
    canonical,
    canonicalPage,
    indexable,
  });
}

const pageRoutes = new Set(pages.map((page) => page.route));
const sitemapFile = path.join(DIST, "sitemap-0.xml");
let sitemapXml = "";
try {
  sitemapXml = await readFile(sitemapFile, "utf8");
} catch {
  errors.push("sitemap-0.xml is missing from dist/");
}
const sitemapPaths = new Set(
  [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => {
    try {
      return new URL(match[1]).pathname;
    } catch {
      return match[1];
    }
  }),
);

const titleOwners = new Map<string, string>();
const descriptionOwners = new Map<string, string>();
const incoming = new Map<string, Set<string>>();
const firstPartyRemoteImages = new Set<string>();

for (const page of pages) {
  if (page.redirect) {
    if (sitemapPaths.has(page.route)) {
      errors.push(`${page.route}: redirect page appears in the sitemap`);
    }
    continue;
  }

  const titles = elements(page.root, "title");
  const descriptions = metaByName(page.root, "description");
  const h1s = elements(page.root, "h1").filter((node) => normalizedText(node));
  const title = titles.length === 1 ? normalizedText(titles[0]) : "";
  const description =
    descriptions.length === 1
      ? (attr(descriptions[0], "content")?.trim() ?? "")
      : "";

  if (page.indexable && (titles.length !== 1 || !title)) {
    errors.push(
      `${page.route}: expected one non-empty title, found ${titles.length}`,
    );
  }
  if (page.indexable && (descriptions.length !== 1 || !description)) {
    errors.push(
      `${page.route}: expected one non-empty meta description, found ${descriptions.length}`,
    );
  }
  if (page.indexable && h1s.length !== 1) {
    errors.push(
      `${page.route}: expected one non-empty H1, found ${h1s.length}`,
    );
  }

  if (page.indexable) {
    for (const name of [
      "twitter:card",
      "twitter:title",
      "twitter:description",
      "twitter:image",
    ]) {
      if (metaByName(page.root, name).length !== 1) {
        errors.push(`${page.route}: expected one ${name} meta tag`);
      }
    }
    for (const property of [
      "og:title",
      "og:description",
      "og:url",
      "og:image",
    ]) {
      if (metaByProperty(page.root, property).length !== 1) {
        errors.push(`${page.route}: expected one ${property} meta tag`);
      }
    }
  }

  const noindex = page.robots.toLowerCase().includes("noindex");
  const nofollow = page.robots.toLowerCase().includes("nofollow");
  if (page.route.includes("/compare/") && (!noindex || nofollow)) {
    errors.push(`${page.route}: comparison pages must use noindex, follow`);
  }
  if ((noindex || !page.canonicalPage) && sitemapPaths.has(page.route)) {
    errors.push(`${page.route}: non-indexable page appears in the sitemap`);
  }
  if (page.indexable && !sitemapPaths.has(page.route)) {
    errors.push(
      `${page.route}: indexable canonical page is absent from the sitemap`,
    );
  }

  if (page.indexable) {
    if (title.length < MIN_TITLE || title.length > MAX_TITLE) {
      errors.push(
        `${page.route}: title length ${title.length} is outside ${MIN_TITLE}-${MAX_TITLE}`,
      );
    }
    if (
      description.length < MIN_DESCRIPTION ||
      description.length > MAX_DESCRIPTION
    ) {
      errors.push(
        `${page.route}: description length ${description.length} is outside ${MIN_DESCRIPTION}-${MAX_DESCRIPTION}`,
      );
    }
    if (hasMarkdown(title)) {
      errors.push(`${page.route}: title contains Markdown syntax`);
    }
    if (hasMarkdown(description)) {
      errors.push(`${page.route}: meta description contains Markdown syntax`);
    }

    const priorTitle = titleOwners.get(title);
    if (priorTitle)
      errors.push(`${page.route}: duplicates title from ${priorTitle}`);
    else titleOwners.set(title, page.route);

    const priorDescription = descriptionOwners.get(description);
    if (priorDescription) {
      errors.push(
        `${page.route}: duplicates meta description from ${priorDescription}`,
      );
    } else {
      descriptionOwners.set(description, page.route);
    }
  }

  for (const script of elements(page.root, "script").filter(
    (node) => attr(node, "type") === "application/ld+json",
  )) {
    try {
      const schema = JSON.parse(textContent(script));
      const types = schemaTypes(schema);
      for (const forbidden of ["SoftwareApplication", "SearchAction"]) {
        if (types.has(forbidden)) {
          errors.push(`${page.route}: JSON-LD contains forbidden ${forbidden}`);
        }
      }
      if (schemaContainsMarkdown(schema)) {
        errors.push(`${page.route}: JSON-LD metadata contains Markdown syntax`);
      }
    } catch (error) {
      errors.push(`${page.route}: invalid JSON-LD (${String(error)})`);
    }
  }

  for (const anchor of elements(page.root, "a")) {
    const href = attr(anchor, "href");
    if (!href) continue;
    const pathname = pathFromHref(href, page.route);
    if (!pathname) continue;
    if (ALLOWED_EDGE_REDIRECT_LINKS.has(pathname)) continue;

    const redirectLink = isRedirectPath(pathname);
    const allowedHistoricalRedirect =
      isHistoricalPage(page.route) &&
      ALLOWED_HISTORICAL_REDIRECT_LINKS.has(pathname);
    if (redirectLink && !allowedHistoricalRedirect) {
      errors.push(`${page.route}: links to redirect ${pathname}`);
    }
    if (
      !redirectLink &&
      isDirectoryPath(pathname) &&
      pathname !== "/" &&
      !pathname.endsWith("/")
    ) {
      errors.push(
        `${page.route}: internal directory link lacks trailing slash: ${href}`,
      );
    }

    const canonicalTarget = ensureDirectorySlash(pathname);
    if (!redirectLink && canonicalTarget !== page.route) {
      incoming.set(
        canonicalTarget,
        (incoming.get(canonicalTarget) ?? new Set()).add(page.route),
      );
    }

    if (
      !redirectLink &&
      !pageRoutes.has(canonicalTarget) &&
      (await fileSize(pathname)) === null
    ) {
      errors.push(
        `${page.route}: internal link target does not exist: ${href}`,
      );
    }
  }

  for (const image of elements(page.root, "img")) {
    if (!hasAttr(image, "alt")) {
      errors.push(
        `${page.route}: image is missing an alt attribute (${attr(image, "src") ?? "unknown src"})`,
      );
    }

    const postVariant = attr(image, "data-post-image");
    const postFormat = attr(image, "data-post-image-format");
    const blogContentImage = hasAttr(image, "data-blog-content-image");
    if (
      (postVariant || blogContentImage) &&
      (!attr(image, "srcset") || !attr(image, "sizes"))
    ) {
      errors.push(
        `${page.route}: optimized content image is missing srcset or sizes`,
      );
    }
    if (postVariant || blogContentImage) {
      const width = Number(attr(image, "width"));
      const height = Number(attr(image, "height"));
      if (
        !Number.isFinite(width) ||
        width <= 0 ||
        !Number.isFinite(height) ||
        height <= 0
      ) {
        errors.push(
          `${page.route}: optimized content image needs positive width and height`,
        );
      }
      if (attr(image, "decoding") !== "async") {
        errors.push(
          `${page.route}: optimized content image must decode asynchronously`,
        );
      }
    }
    if (postVariant === "hero" && attr(image, "loading") !== "eager") {
      errors.push(`${page.route}: post hero image must load eagerly`);
    }
    if (
      (postVariant === "card" || blogContentImage) &&
      attr(image, "loading") !== "lazy"
    ) {
      errors.push(`${page.route}: non-hero content image must load lazily`);
    }
    if (postVariant) {
      const profileWidths =
        postFormat === "gif"
          ? postVariant === "hero"
            ? [400, 600, 800]
            : [320, 480]
          : postVariant === "hero"
            ? [480, 800, 1200, 1600]
            : [320, 480, 640, 800];
      const targetWidth = Number(attr(image, "width"));
      const expectedWidths = profileWidths.filter(
        (candidate) => candidate <= targetWidth,
      );
      if (!expectedWidths.includes(targetWidth))
        expectedWidths.push(targetWidth);
      const widths = srcsetWidths(image);
      if (!sameNumbers(widths, expectedWidths)) {
        errors.push(
          `${page.route}: ${postVariant} post image has srcset widths ${widths.join(",") || "none"}; expected ${expectedWidths.join(",")}`,
        );
      }
    }
    if (blogContentImage) {
      const widths = srcsetWidths(image);
      const expectedWidths = [480, 800, 1200, 1600];
      if (!sameNumbers(widths, expectedWidths)) {
        errors.push(
          `${page.route}: blog content image has srcset widths ${widths.join(",") || "none"}; expected ${expectedWidths.join(",")}`,
        );
      }
    }

    for (const url of imageUrls(image)) {
      const audited = normalizedAuditedImage(url);
      if (audited && AUDITED_OVERSIZED_IMAGES.has(audited)) {
        errors.push(`${page.route}: renders audited oversized original ${url}`);
      }

      let parsed: URL;
      try {
        parsed = new URL(url, SITE_ORIGIN);
      } catch {
        errors.push(`${page.route}: invalid image URL ${url}`);
        continue;
      }
      if (parsed.origin === SITE_ORIGIN) {
        const size = await fileSize(parsed.pathname);
        if (size === null) {
          errors.push(`${page.route}: local image does not exist: ${url}`);
          continue;
        }
        if (
          postFormat === "gif" &&
          (!parsed.pathname.endsWith(".webp") ||
            !(await isAnimatedWebp(parsed.pathname)))
        ) {
          errors.push(
            `${page.route}: GIF-derived rendition is not an animated WebP: ${url}`,
          );
        }
        let limit = MAX_IMAGE_BYTES;
        if (postVariant || blogContentImage) {
          limit =
            postFormat === "gif"
              ? MAX_ANIMATED_POST_IMAGE_BYTES
              : MAX_STATIC_POST_IMAGE_BYTES;
        }
        const overLimit =
          limit === MAX_IMAGE_BYTES ? size >= limit : size > limit;
        if (overLimit) {
          errors.push(
            `${page.route}: image ${url} is ${size} bytes (limit ${limit})`,
          );
        }
      } else if (parsed.hostname === "assets.rivet.dev") {
        firstPartyRemoteImages.add(parsed.href);
      }
    }
  }
}

for (const sitemapPath of sitemapPaths) {
  if (!pageRoutes.has(sitemapPath)) {
    errors.push(`${sitemapPath}: sitemap URL has no generated HTML page`);
  }
}

for (const page of pages.filter(
  (item) => item.indexable && item.route !== "/",
)) {
  if ((incoming.get(page.route)?.size ?? 0) === 0) {
    errors.push(
      `${page.route}: indexable canonical page has no incoming internal links`,
    );
  }
}

if (process.env.CHECK_REMOTE_ASSETS === "1") {
  const remoteErrors = await mapWithConcurrency(
    [...firstPartyRemoteImages],
    8,
    checkFirstPartyRemoteImage,
  );
  for (const error of remoteErrors) {
    if (error) errors.push(`remote image: ${error}`);
  }
} else if (firstPartyRemoteImages.size > 0) {
  warnings.push(
    `${firstPartyRemoteImages.size} first-party remote image(s) were not fetched; set CHECK_REMOTE_ASSETS=1 to verify them`,
  );
}

if (warnings.length > 0) {
  console.warn(`SEO check warnings (${warnings.length}):`);
  for (const warning of warnings) console.warn(`  - ${warning}`);
}

if (errors.length > 0) {
  console.error(`SEO check failed with ${errors.length} problem(s):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(
  `SEO check passed: ${pages.length} HTML pages, ${sitemapPaths.size} sitemap URLs, ${firstPartyRemoteImages.size} first-party remote images`,
);
