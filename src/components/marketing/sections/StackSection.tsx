import { Icon } from "@rivet-gg/icons";
import { visibleProducts, type Product } from "@/sitemap/products";
import { productLogos } from "@/sitemap/productLogos";
import { productAccent, wordmarkMaskStyle } from "@/lib/product-accent";
import { CatalogCard } from "../editorial/CatalogCard";
import { SECTION_LEDE_CLASS, SectionHeading } from "../typography";

// The verb-led catalog of the product family: Run / Operate / Automate /
// Deploy, foundation-first (registry order). Each card leads with its verb and
// premise — the same strings the Products menu carries — then one sentence of
// evidence. Sits directly under the hero so the map of the stack precedes the
// deep dives.
const BODIES: Record<string, string> = {
  actors:
    "Durable identity, state, queues, storage, and realtime for agents, sessions, and users.",
  agentos:
    "Files, processes, shell, and networking inside an Actor — without a separate microVM fleet to operate.",
  workflows:
    "A workflow() Actor run handler records completed operation results, retries transient errors, and resumes after restarts.",
  "dynamic-apps":
    "Isolated, stateful backends for agent-generated software that can scale to zero and wake on demand.",
};

const stack = visibleProducts.map((product) => ({
  product,
  accent: productAccent(product.id),
  body: BODIES[product.id] ?? product.description,
  highlight: product.id === "actors",
}));

const StackProductMark = ({ product }: { product: Product }) => {
  const logo = productLogos[product.id];

  if (logo) {
    return (
      <span
        aria-hidden="true"
        style={wordmarkMaskStyle(logo.src)}
        className="inline-block h-[15px] w-[15px] shrink-0 bg-cream"
      />
    );
  }

  return product.icon ? (
    <Icon
      icon={product.icon}
      aria-hidden="true"
      className="h-[15px] w-[15px] shrink-0 text-cream"
    />
  ) : null;
};

export const StackSection = () => (
  <section className="relative border-t border-ink/10 bg-paper-mid px-6 py-20 md:py-32">
    <div className="mx-auto w-full max-w-7xl">
      <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <SectionHeading
          title="Run, operate, automate, deploy."
          className="max-w-2xl"
        />
        <p className={`${SECTION_LEDE_CLASS} max-w-xl lg:pt-1`}>
          Four products built on Actors — pick one or all, then compose the rest
          when the task demands it.
        </p>
      </div>
      <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
        {stack.map(({ product, accent, body }) => (
          <div key={product.id} className="min-w-0">
            <CatalogCard
              flush
              eyebrow={product.verb}
              title={
                <span className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${accent?.fill ?? "bg-ink/20"}`}
                  >
                    <StackProductMark product={product} />
                  </span>
                  {product.name}
                  {product.badge && (
                    <span className="shrink-0 rounded-sm border border-ink/10 bg-ink/[0.06] px-1.5 py-px text-[10px] font-medium leading-[1.4] text-ink-soft whitespace-nowrap">
                      {product.badge}
                    </span>
                  )}
                </span>
              }
              href={product.href}
              linkLabel={`Explore ${product.name}`}
              className="flex h-full min-h-72 flex-col"
            >
              {product.premise && (
                <p className="mt-2 text-sm font-medium text-ink">
                  {product.premise}
                </p>
              )}
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-soft">
                {body}
              </p>
            </CatalogCard>
          </div>
        ))}
      </div>
    </div>
  </section>
);
