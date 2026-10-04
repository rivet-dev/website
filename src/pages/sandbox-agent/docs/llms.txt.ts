import { listDocPages } from "@/metadata/docs-index";

export function GET() {
  const pages = listDocPages().filter(
    (page) => page.product === "sandbox-agent",
  );
  const body =
    "# Sandbox Agent\n\nRun coding agents in sandboxes. Control them over HTTP.\n\n" +
    pages
      .map((page) => `- [${page.title}](https://rivet.dev/${page.slug}.md)`)
      .join("\n") +
    "\n";
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
