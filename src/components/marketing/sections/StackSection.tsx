import { Icon } from "@rivet-gg/icons";
import { visibleProducts, type Product } from "@/sitemap/products";
import { productLogos } from "@/sitemap/productLogos";
import { productAccent, wordmarkMaskStyle } from "@/lib/product-accent";
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

// The mark at plate scale, rendered cream directly on the accent field.
const StackProductMark = ({ product }: { product: Product }) => {
  const logo = productLogos[product.id];

  if (logo) {
    return (
      <span
        aria-hidden="true"
        style={wordmarkMaskStyle(logo.src)}
        className="inline-block h-6 w-6 shrink-0 bg-cream"
      />
    );
  }

  return product.icon ? (
    <Icon
      icon={product.icon}
      aria-hidden="true"
      className="h-6 w-6 shrink-0 text-cream"
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
      <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {stack.map(({ product, accent, body }) => (
          <a key={product.id} href={product.href} className="group flex min-w-0 flex-col">
            {/* Accent plate: verb, mark, name, and the premise live on the
                product color, over a cream dot grid that fades downward and
                pans slowly while hovered. */}
            <div
              className={`relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-xl p-6 ${accent?.fill ?? "bg-ink"}`}
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,black_25%,transparent_90%)]"
              >
                <div className="absolute -inset-[18px] bg-[radial-gradient(circle,rgba(244,241,231,0.38)_1px,transparent_1.5px)] bg-[size:18px_18px] will-change-transform [animation:dot-drift_7s_linear_infinite_paused] group-hover:[animation-play-state:running] motion-reduce:[animation:none]" />
              </div>
              <span className="relative self-start rounded-full border border-cream/20 bg-cream/10 px-3 py-1 text-sm font-medium text-cream/90 backdrop-blur-md backdrop-saturate-[1.3] transition-colors duration-300 [transition-timing-function:cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none group-hover:border-cream/35 group-hover:bg-cream/25 group-hover:text-cream">
              {product.verb}
            </span>
              <div className="relative">
                <div className="flex items-center gap-3">
                  <StackProductMark product={product} />
                  <div className="text-lg font-medium leading-tight text-cream">{product.name}</div>
                </div>
                {product.premise && (
                  <p className="mt-3 text-balance text-base font-medium leading-snug text-cream/90">
                    {product.premise}
                  </p>
                )}
              </div>
            </div>

            <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">{body}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-pine">
              Explore {product.name}
              <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none">→</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  </section>
);
