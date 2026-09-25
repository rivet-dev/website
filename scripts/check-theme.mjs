// Run against a running dev/preview server: node scripts/check-theme.mjs
// Set THEME_TEST_URL or CHROME_EXECUTABLE_PATH when needed.
import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({
  executablePath: process.env.CHROME_EXECUTABLE_PATH,
});
const baseURL = process.env.THEME_TEST_URL || "http://localhost:4321";
const context = await browser.newContext({ baseURL, colorScheme: "dark" });
const page = await context.newPage();
const toggle = page.getByRole("button", {
  name: /^Switch to (light|dark) mode$/,
});
const theme = () => page.locator("html").getAttribute("data-theme");
async function choose(value) {
  await page.waitForFunction(
    () =>
      !document.querySelector('astro-island[component-export="Header"][ssr]'),
  );
  // Pages whose React tree is regenerated after a hydration mismatch (for
  // example framer-motion under reduced motion) can drop a click that landed on
  // the pre-regeneration button, so retry rather than fail on that race.
  for (let attempt = 0; (await theme()) !== value; attempt++) {
    assert.ok(attempt < 3, `theme toggle did not switch to ${value}`);
    await toggle.click();
    await page
      .waitForFunction(
        (expected) => document.documentElement.dataset.theme === expected,
        value,
        { timeout: 2000 },
      )
      .catch(() => {});
  }
  // The button re-renders from the theme-change event, so poll for the label.
  const expectedLabel =
    value === "dark" ? "Switch to light mode" : "Switch to dark mode";
  await page.waitForFunction(
    (label) =>
      document.querySelector('button[aria-label^="Switch to "]')
        ?.getAttribute("aria-label") === label,
    expectedLabel,
  );
  assert.equal(
    await toggle
      .locator(value === "dark" ? ".lucide-sun" : ".lucide-moon")
      .count(),
    1,
  );
  if (page.viewportSize().width >= 768) {
    const logo = page
      .locator("header")
      .getByRole("img", { name: "Rivet logo", exact: true });
    assert.equal(await logo.count(), 1);
    assert.match(
      await logo.getAttribute("src"),
      value === "dark" ? /icon-text-white/ : /icon-text-black/,
    );
    assert.equal(
      await logo.evaluate((el) => getComputedStyle(el).filter),
      "none",
    );
  }
}

try {
  await page.goto("/");
  assert.equal(await theme(), "dark");
  assert.equal(
    await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el).backgroundColor),
    "rgb(10, 10, 11)",
  );
  const glass = page.locator(".site-header-glass");
  assert.equal(
    await glass.evaluate((el) => getComputedStyle(el).backgroundColor),
    "rgba(10, 10, 11, 0.95)",
  );
  assert.equal(
    await glass.evaluate((el) => getComputedStyle(el).boxShadow),
    "none",
  );
  console.log(
    "PASS: Actors near-black background and header without light glass sheen",
  );
  // Until the first click, follow live OS changes without saving an override.
  await page.emulateMedia({ colorScheme: "light" });
  await page.waitForFunction(
    () => document.documentElement.dataset.theme === "light",
  );
  await choose("light");
  await page.emulateMedia({ colorScheme: "dark" });
  await page.waitForFunction(
    () => document.documentElement.dataset.theme === "dark",
  );
  await toggle.focus();
  await toggle.press("Space");
  await page.waitForFunction(
    () => document.documentElement.dataset.theme === "light",
  );
  await choose("light");
  assert.equal(
    await page.evaluate(() => localStorage.getItem("rivet-theme")),
    "light",
  );
  await page.reload();
  assert.equal(await theme(), "light");
  await choose("dark");
  await page.emulateMedia({ colorScheme: "light" });
  assert.equal(
    await theme(),
    "dark",
    "Explicit choice must override system changes",
  );
  console.log(
    "PASS: sun/moon toggle, keyboard activation, system preference, explicit override and reload persistence",
  );

  // Actual client-side navigation must retain both the palette and the control.
  await choose("dark");
  await page
    .getByRole("link", { name: "Documentation", exact: true })
    .first()
    .click();
  await page.waitForURL("**/docs/");
  assert.equal(await theme(), "dark");
  await choose("light");
  assert.equal(await theme(), "light");
  await choose("dark");
  console.log("PASS: Astro navigation and theme control after swap");

  const second = await context.newPage();
  await second.goto("/docs/");
  await second.evaluate(() => localStorage.setItem("rivet-theme", "light"));
  await page.waitForFunction(
    () => document.documentElement.dataset.theme === "light",
  );
  await second.close();
  console.log("PASS: cross-tab preference synchronization");

  await page.goto("/actors/docs/quickstart/backend/");
  await choose("dark");
  assert.equal(
    await page
      .locator("[data-code-block] .bg-white")
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor),
    "rgb(12, 12, 14)",
  );
  const code = page.locator(".shiki").first();
  assert.equal(
    await code.evaluate((el) => getComputedStyle(el).color),
    "rgb(225, 228, 232)",
  );
  const link = page.getByRole("link", { name: "hello-world", exact: true });
  const darkLinkColor = await link.evaluate((el) => getComputedStyle(el).color);
  await choose("light");
  assert.notEqual(
    await code.evaluate((el) => getComputedStyle(el).color),
    "rgb(225, 228, 232)",
  );
  assert.notEqual(
    await link.evaluate((el) => getComputedStyle(el).color),
    darkLinkColor,
  );
  console.log(
    "PASS: docs syntax highlighting and product link colors switch in both directions",
  );


  await page.setViewportSize({ width: 1142, height: 1073 });
  const css = (locator, property) => locator.evaluate((el, prop) => getComputedStyle(el)[prop], property);
  for (const mode of ["dark", "light"]) {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/agentos/");
    await choose(mode);
    const foundation = page.locator('a[href="#execution"]');
    assert.match(await css(foundation.locator(".bg-gradient-to-t"), "backgroundImage"),
      mode === "dark" ? /rgb\(12, 12, 14\)/ : /rgb\(255, 255, 255\)/);
    assert.equal(await page.locator(".theme-monochrome-logo").count(), 3);
    for (const logo of await page.locator(".theme-monochrome-logo").all()) {
      assert.equal(await css(logo, "filter"), mode === "dark" ? "invert(1)" : "none");
    }
    assert.equal(await css(page.locator('a[aria-label="Claude Code"] img'), "filter"), "none");
    assert.equal(await css(page.locator(".runtime-benchmark-dot--fast").first(), "backgroundColor"),
      mode === "dark" ? "rgba(147, 162, 134, 0.65)" : "rgba(48, 91, 70, 0.65)");
    assert.equal(await css(page.locator("#bench-memory .bg-current"), "backgroundColor"),
      mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(27, 25, 22, 0.1)");

    await page.goto("/agentos/registry/");
    const indicators = page.locator('button[aria-label^="Show "]');
    // The carousel is a client island; a click before hydration is ignored.
    await page.waitForFunction(() =>
      !document.querySelector('button[aria-label^="Show "]')?.closest("astro-island")?.hasAttribute("ssr"));
    await indicators.nth(1).click();
    assert.equal(await indicators.nth(1).getAttribute("aria-current"), "true");
    assert.equal(await css(indicators.nth(1).locator("span"), "backgroundColor"),
      mode === "dark" ? "rgb(212, 212, 216)" : "rgb(46, 64, 52)");
    assert.equal(await css(indicators.first().locator("span"), "backgroundColor"),
      mode === "dark" ? "rgba(255, 255, 255, 0.25)" : "rgba(27, 25, 22, 0.25)");

    for (const path of ["/agentos/registry/everything/", "/startups/"]) {
      await page.goto(path);
      for (const panel of await page.locator(".ink-panel").all()) {
        assert.equal(await css(panel, "backgroundColor"), mode === "dark" ? "rgb(22, 22, 24)" : "rgb(27, 25, 22)");
        assert.equal(await css(panel, "borderTopColor"), mode === "dark" ? "rgba(255, 255, 255, 0.12)" : "rgba(27, 25, 22, 0.2)");
      }
    }
    // The light CTA inside a dark panel must keep its black-on-white contrast.
    const claim = page.getByRole("link", { name: "Claim the deal", exact: true }).last();
    assert.equal(await css(claim, "backgroundColor"), "rgb(255, 255, 255)");
    assert.equal(await css(claim, "color"), "rgb(27, 25, 22)");

    await page.emulateMedia({ reducedMotion: "no-preference" });
  }
  console.log("PASS: agentOS card fades, monochrome logos, runtime marks, registry indicators and code/CTA panels in both themes");

  // Inline SVG diagrams: token-drawn (BYOC), hex-drawn and remapped by
  // theme.css (vendored versions page), and foreign-palette inverted
  // (vendored agentOS security model). Font Awesome icons share role="img"
  // and must stay untouched.
  for (const mode of ["dark", "light"]) {
    const ink = mode === "dark" ? "rgb(255, 255, 255)" : "rgb(27, 25, 22)";
    const card = mode === "dark" ? "rgb(12, 12, 14)" : "rgb(255, 255, 255)";
    await page.goto("/docs/deploy/byoc/architecture/");
    await choose(mode);
    const byoc = page.locator('svg[aria-labelledby="byoc-diagram-title byoc-diagram-description"]');
    assert.equal(await css(byoc.getByText("Rivet Cloud", { exact: true }), "fill"), ink);
    assert.equal(await css(byoc.locator('rect[width="168"]').first(), "fill"), card);
    assert.equal(await css(byoc, "filter"), "none");

    await page.goto("/docs/versions/");
    await choose(mode);
    const versions = page.locator(".docs-article svg[role=img]:not(.svg-inline--fa)").first();
    assert.equal(await css(versions.locator('[fill="#1b1916"]').first(), "fill"), ink);
    assert.equal(await css(versions.locator('[fill="#faf8f3"]').first(), "fill"),
      mode === "dark" ? "rgb(22, 22, 24)" : "rgb(250, 248, 243)");
    assert.equal(await css(versions.locator('[stroke="#2E4034"]').first(), "stroke"),
      mode === "dark" ? "rgb(212, 212, 216)" : "rgb(46, 64, 52)");
    assert.equal(await css(versions, "filter"), "none");

    await page.goto("/agentos/docs/security-model/");
    await choose(mode);
    const foreign = page.locator(".docs-article svg[role=img]:not(.svg-inline--fa)").first();
    assert.equal(await css(foreign, "filter"), mode === "dark" ? "invert(1) hue-rotate(180deg)" : "none");
    assert.equal(await css(page.locator(".docs-article svg.svg-inline--fa").first(), "filter"), "none");

    const raster = mode === "dark" ? "invert(1) hue-rotate(180deg)" : "none";
    await page.goto("/docs/runtime-modes/");
    await choose(mode);
    assert.equal(await css(page.getByRole("img", { name: "Runner architecture diagram" }), "filter"), raster);

    await page.goto("/guides/a-radically-simpler-architecture/");
    await choose(mode);
    assert.equal(await css(page.locator("img.theme-diagram-invert").first(), "filter"), raster);
    assert.equal(await css(page.getByRole("img", { name: /^Diagram showing actors with isolated state/ }), "filter"), raster);
  }
  console.log("PASS: docs diagrams retint in dark mode (tokens, hex remap, foreign-palette inversion, raster inversion) and icons stay untouched");

  await page.goto("/actors/docs/quickstart/backend/");
  await choose("dark");
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await toggle.isVisible());
  await choose("light");
  await choose("dark");
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.getByRole("button", { name: "Toggle navigation menu" }).click();
  await page.getByRole("dialog", { name: "Navigation menu" }).waitFor();
  assert.equal(
    await page
      .getByRole("dialog")
      .evaluate((el) => getComputedStyle(el).backgroundColor),
    "rgb(10, 10, 11)",
  );
  const mobileLogo = page
    .getByRole("dialog")
    .getByRole("img", { name: "Rivet logo", exact: true });
  assert.equal(await mobileLogo.count(), 1);
  assert.match(await mobileLogo.getAttribute("src"), /icon-text-white/);
  assert.equal(
    await mobileLogo.evaluate((el) => getComputedStyle(el).filter),
    "none",
  );
  await page.keyboard.press("Escape");
  console.log(
    "PASS: mobile theme control, no horizontal overflow, dark navigation sheet",
  );

  await page.goto("/secure-exec/");
  assert.equal(
    await page.locator("html").getAttribute("data-fixed-theme"),
    "dark",
  );
  assert.equal(
    await page
      .locator("html")
      .evaluate((el) =>
        getComputedStyle(el).getPropertyValue("--site-paper").trim(),
      ),
    "",
  );
  console.log("PASS: fixed dark Secure Exec palette is preserved");

  await page.setViewportSize({ width: 1142, height: 1073 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/careers/");
  for (const mode of ["dark", "light"]) {
    await choose(mode);
    assert.equal(await css(page.locator(".career-map-artwork"), "filter"),
      mode === "dark" ? "brightness(0) invert(1)" : "brightness(0)");
    const marker = page.getByRole("button", { name: /^Team location:/ }).first();
    await marker.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => !document.querySelector('astro-island[component-export="CareerMap"][ssr]'));
    // The tooltip closes itself on window scroll, so let the scroll settle
    // before focusing the marker.
    await page.evaluate(() => new Promise((resolve) => {
      let last = scrollY, still = 0;
      const tick = () => { still = scrollY === last ? still + 1 : 0; last = scrollY; still >= 3 ? resolve() : requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }));
    await marker.focus();
    await page.locator("[data-location-pill]").first().waitFor();
    await page.keyboard.press("Escape");
    const card = page.locator('.career-product-card[href="/workflows/docs/"]');
    await card.hover();
    assert.equal(await css(card, "backgroundColor"), mode === "dark" ? "rgb(22, 22, 24)" : "rgba(255, 255, 255, 0.7)");
    await page.mouse.move(0, 0);
  }
  await page.goto("/talk-to-an-engineer/");
  for (const width of [1024, 1142, 1440]) {
    await page.setViewportSize({ width, height: 1073 });
    const marks = page.locator('#main-content a[aria-label]');
    assert.equal(await marks.count(), 5);
    await page.waitForFunction(() => [...document.querySelectorAll('#main-content a[aria-label]')].every(el => getComputedStyle(el).opacity === "1"));
    const formRight = await page.locator("#main-content form").evaluate(el => el.getBoundingClientRect().right);
    const boxes = await marks.evaluateAll((els) => els.map(el => {
      const { left, right, top, bottom } = el.getBoundingClientRect();
      return { name: el.getAttribute("aria-label"), left, right, top, bottom };
    }));
    for (let i = 0; i < boxes.length; i++) {
      assert.ok(boxes[i].left > formRight, `${boxes[i].name} stays clear of the form at ${width}px`);
      assert.ok(boxes[i].left >= 0 && boxes[i].right <= width, `${boxes[i].name} stays inside ${width}px viewport`);
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        assert.ok(a.right < b.left || b.right < a.left || a.bottom + 20 < b.top || b.bottom + 20 < a.top,
          `${a.name} and ${b.name} have room to float independently at ${width}px`);
      }
    }
  }
  console.log("PASS: careers map and hover in both themes; five independent thinker badges at 1024, 1142 and 1440px");

  const blocked = await browser.newContext({ baseURL, colorScheme: "dark" });
  await blocked.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Blocked", "SecurityError");
      },
    });
  });
  const blockedPage = await blocked.newPage();
  await blockedPage.goto("/docs/");
  assert.equal(
    await blockedPage.locator("html").getAttribute("data-theme"),
    "dark",
  );
  await blockedPage.waitForFunction(
    () =>
      !document.querySelector('astro-island[component-export="Header"][ssr]'),
  );
  await blockedPage
    .getByRole("button", { name: "Switch to light mode" })
    .click();
  await blockedPage.waitForFunction(
    () => document.documentElement.dataset.theme === "light",
  );
  await blocked.close();
  console.log(
    "PASS: unavailable localStorage does not prevent theme switching",
  );
} finally {
  await browser.close();
}
