import { Icon } from "@rivet-gg/icons";
import { visibleProducts, type Product } from "@/sitemap/products";
import { productLogos } from "@/sitemap/productLogos";
import { productAccent, wordmarkMaskStyle } from "@/lib/product-accent";
import { BODY_CLASS, CARD_TITLE_BASE_CLASS, SectionHeading } from "../typography";
import { ProductMotif, type ProductMotifId } from "../ProductMotif";
import { SITE_SECTION_CLASS, SITE_STANDARD_RAIL_CLASS } from "../layout";
import { canonicalizeInternalHref } from "@/lib/internalHref";

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

const hasProductMotif = (productId: string): productId is ProductMotifId =>
  productId === "actors" ||
  productId === "agentos" ||
  productId === "workflows" ||
  productId === "dynamic-apps";

// The mark at plate scale, rendered white directly on the accent field.
const StackProductMark = ({ product }: { product: Product }) => {
  const logo = productLogos[product.id];

  if (logo) {
    return (
      <span
        aria-hidden="true"
        style={wordmarkMaskStyle(logo.src)}
        className="inline-block h-6 w-6 shrink-0 bg-white"
      />
    );
  }

  return product.icon ? (
    <Icon
      icon={product.icon}
      aria-hidden="true"
      className="h-6 w-6 shrink-0 text-white"
    />
  ) : null;
};

export const StackSection = () => (
  <section className={`relative bg-paper ${SITE_SECTION_CLASS}`}>
    <div className={SITE_STANDARD_RAIL_CLASS}>
      <div data-site-reveal="">
        <SectionHeading
          title="Orchestrate, operate, automate, deploy."
          className="max-w-2xl"
        />
      </div>
      <div
        data-site-reveal-group=""
        className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stack.map(({ product, accent }) => (
          <a
            key={product.id}
            href={canonicalizeInternalHref(product.href)}
            data-site-reveal-child=""
            className={`group flex min-w-0 flex-col ${product.id === "workflows" ? "workflow-card focus-visible:outline-none" : product.id === "dynamic-apps" ? "dynamic-apps-card focus-visible:outline-none" : product.id === "agentos" ? "agentos-card focus-visible:outline-none" : product.id === "actors" ? "actors-card" : ""}`}
          >
            {/* Accent plate: verb, mark, name, and the premise live on the
                product color. Each product uses its own quiet background
                field without competing with the foreground content. */}
            <div
              className={`relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-xl p-6 ${accent?.fill ?? "bg-ink"} ${product.id === "workflows" || product.id === "dynamic-apps" || product.id === "agentos" ? "transition-shadow duration-200 group-focus-visible:ring-2 group-focus-visible:ring-cream/80 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-paper motion-reduce:transition-none" : ""}`}
            >
              {hasProductMotif(product.id) ? (
                <ProductMotif productId={product.id} surface="card" />
              ) : null}
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

            <span className="mt-4 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-pine">
                Explore {product.name}
                <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none">→</span>
              </span>
              {product.badge && (
                <span className="whitespace-nowrap rounded-sm border border-ink/10 bg-white/55 px-2 py-1 text-xs font-medium leading-none text-ink-soft">
                  {product.badge}
                </span>
              )}
            </span>
          </a>
        ))}
      </div>
    </div>
  </section>
);
