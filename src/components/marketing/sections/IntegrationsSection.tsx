import { Blocks, LayoutGrid, Terminal, Wrench } from "lucide-react";
import { integrationsFor } from "@/data/integrations";
import {
  EYEBROW_CLASS,
  SECTION_H2_CLASS,
} from "../typography";
import { SITE_SECTION_CLASS, SITE_STANDARD_RAIL_CLASS } from "../layout";
import { canonicalizeInternalHref } from "@/lib/internalHref";

const integrations = integrationsFor("actors");

const frameworks = [
  { name: "React", href: "/actors/docs/clients/react" },
  { name: "Next.js", href: "/actors/docs/clients/javascript" },
  { name: "Svelte", href: "/actors/docs/clients/javascript" },
  {
    name: "Hono",
    href: "https://github.com/rivet-dev/rivet/tree/main/examples/hono",
    external: true,
  },
  {
    name: "Express",
    href: "https://github.com/rivet-dev/rivet/tree/main/examples/express",
    external: true,
  },
  {
    name: "Elysia",
    href: "https://github.com/rivet-dev/rivet/tree/main/examples/elysia",
    external: true,
  },
  {
    name: "tRPC",
    href: "https://github.com/rivet-dev/rivet/tree/main/examples/trpc",
    external: true,
  },
];

const runtimes = [
  { name: "Node.js", href: "/actors/docs/quickstart/backend" },
  { name: "Bun", href: "/actors/docs/quickstart/backend" },
  {
    name: "Deno",
    href: "https://github.com/rivet-dev/rivet/tree/main/examples/deno",
    external: true,
  },
];

const tools = [
  { name: "Vitest", href: "/actors/docs/testing" },
  { name: "Pino", href: "/actors/docs/general/logging" },
  {
    name: "AI SDK",
    href: "https://github.com/rivet-dev/rivet/tree/main/examples/ai-agent",
    external: true,
  },
  {
    name: "OpenAPI",
    href: "https://github.com/rivet-dev/rivet/tree/main/rivetkit-openapi",
    external: true,
  },
  {
    name: "AsyncAPI",
    href: "https://github.com/rivet-dev/rivet/tree/main/rivetkit-asyncapi",
    external: true,
  },
];

// Quiet chip per technology. Shape comes from the hairline and fill, so the
// name itself carries no underline.
const STACK_CHIP_CLASS =
  "inline-flex items-center rounded-md border border-ink/10 bg-white/55 px-2.5 py-1 text-sm text-ink-soft transition-colors hover:border-ink/25 hover:bg-white hover:text-ink";

interface StackLink {
  name: string;
  href: string;
  external?: boolean;
}

interface StackGroup {
  label: string;
  icon: typeof LayoutGrid;
  items: StackLink[];
}

const groups: StackGroup[] = [
  { label: "Frameworks", icon: LayoutGrid, items: frameworks },
  { label: "Runtimes", icon: Terminal, items: runtimes },
  { label: "Tools", icon: Wrench, items: tools },
  {
    label: "Integrations",
    icon: Blocks,
    items: integrations.map((integration) => ({
      name: integration.title,
      href: `/actors/integrations/${integration.slug}`,
    })),
  },
];

export const IntegrationsSection = () => (
  <section className={`bg-paper ${SITE_SECTION_CLASS}`}>
    <div className={SITE_STANDARD_RAIL_CLASS}>
      <div data-site-reveal="" className="max-w-3xl">
        <h2 className={`text-balance ${SECTION_H2_CLASS}`}>
          Works with your stack.
        </h2>
      </div>

      <div
        data-site-reveal-group=""
        className="mt-12 grid items-start gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4"
      >
        {groups.map((group) => {
          const Icon = group.icon;
          return (
            <div
              key={group.label}
              data-site-reveal-child=""
              className="border-t border-ink/15 pt-5"
            >
              <div className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 text-pine" aria-hidden="true" />
                <h3 className={EYEBROW_CLASS}>{group.label}</h3>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <a
                    key={item.name}
                    href={canonicalizeInternalHref(item.href)}
                    {...(item.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className={STACK_CHIP_CLASS}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);
