import { Icon } from "@rivet-gg/icons";
import { visibleProducts, type Product } from "@/sitemap/products";
import { productLogos } from "@/sitemap/productLogos";
import { productAccent, wordmarkMaskStyle } from "@/lib/product-accent";
import { BODY_CLASS, CARD_TITLE_BASE_CLASS, SectionHeading } from "../typography";
import { SITE_SECTION_CLASS, SITE_STANDARD_RAIL_CLASS } from "../layout";

// The verb-led catalog of the product family: Orchestrate / Operate / Automate /
// Deploy, foundation-first (registry order). Each card leads with its verb and
// premise — the same strings the Products menu carries — then one sentence of
// evidence. Sits directly under the hero so the map of the stack precedes the
// deep dives.
const stack = visibleProducts.map((product) => ({
  product,
  accent: productAccent(product.id),
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
  <section className={`relative bg-paper ${SITE_SECTION_CLASS}`}>
    <div className={SITE_STANDARD_RAIL_CLASS}>
      <SectionHeading
        title="Orchestrate, operate, automate, deploy."
        className="max-w-2xl"
      />
      <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {stack.map(({ product, accent }) => (
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
                <div className={`absolute -inset-[18px] bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='18'%20height='18'%3E%3Cpath%20d='M9%205.5v7M5.5%209h7'%20stroke='rgba(244,241,231,0.42)'%20stroke-width='1'/%3E%3C/svg%3E")] bg-[size:18px_18px] will-change-transform [animation:dot-drift_7s_linear_infinite_paused] group-hover:[animation-play-state:running] motion-reduce:[animation:none]`} />
              </div>
              <span className="relative self-start rounded-full border border-cream/20 bg-cream/10 px-3 py-1 text-sm font-medium text-cream/90 backdrop-blur-md backdrop-saturate-[1.3] transition-colors duration-300 [transition-timing-function:cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none group-hover:border-cream/35 group-hover:bg-cream/25 group-hover:text-cream">
              {product.verb}
            </span>
              <div className="relative">
                <div className="flex items-center gap-3">
                  <StackProductMark product={product} />
                  <div className={`${CARD_TITLE_BASE_CLASS} text-cream`}>{product.name}</div>
                </div>
                {product.premise && (
                  <p className={`mt-3 text-balance font-medium !text-cream/90 ${BODY_CLASS}`}>
                    {product.premise}
                  </p>
                )}
              </div>
            </div>

            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-pine">
              Explore {product.name}
              <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none">→</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  </section>
);
