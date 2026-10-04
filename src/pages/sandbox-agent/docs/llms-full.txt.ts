import { listDocPages, renderDocMarkdown } from "@/metadata/docs-index";

export function GET() {
  const body = listDocPages()
    .filter((page) => page.product === "sandbox-agent")
    .map((page) => `# ${page.title}\n\n${renderDocMarkdown(page)}`)
    .join("\n\n---\n\n");
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
