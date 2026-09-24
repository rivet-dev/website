import { Fragment, type CSSProperties, type ReactNode } from "react";
import { ProductBadge } from "@/components/ProductBar";
import { canonicalizeInternalHref } from "@/lib/internalHref";
import { products, type Product } from "@/sitemap/products";
import { SITE_SECTION_CLASS, SITE_STANDARD_RAIL_CLASS } from "../layout";
import { CARD_TITLE_CLASS, SECTION_H2_CLASS } from "../typography";
import styles from "./SolutionsSection.module.css";

// Solutions catalog: what people build on Rivet, one card per kind of
// product. Each card names the shape of the workload, the products it leans
// on, and a small hand-built vignette of the thing itself. The grid is two
// wide plates over three narrow ones so the two biggest stories get the room.
// Hook-free so the landing page renders it with no client directive. Each
// vignette replays its story on card hover via SolutionsSection.module.css;
// `stagger(i)` sets the per-element delay index those keyframes read.

type ProductId = "actors" | "agentos" | "workflows" | "dynamic-apps";

export interface Solution {
  id: string;
  title: string;
  href: string;
  linkLabel: string;
  uses: ProductId[];
  vignette: ReactNode;
  wide?: boolean;
}

const stagger = (index: number) => ({ "--i": index }) as CSSProperties;

export const productById = (id: ProductId): Product | undefined =>
  products.find((product) => product.id === id);

// Vignette frame on porcelain: white fill, hairline, clipped. Ink variants
// (terminal) paint their own surface.
const VIGNETTE_CLASS = `relative flex flex-1 flex-col overflow-hidden rounded-lg border border-ink/10 bg-white text-[12px] leading-snug text-ink-soft`;

const MiniChromeBar = ({ children }: { children?: ReactNode }) => (
  <div className="flex items-center gap-2 border-b border-ink/10 bg-ink/[0.05] px-3 py-2">
    <span aria-hidden="true" className="flex gap-1">
      <span className="h-1.5 w-1.5 rounded-full bg-ink/20" />
      <span className="h-1.5 w-1.5 rounded-full bg-ink/20" />
      <span className="h-1.5 w-1.5 rounded-full bg-ink/20" />
    </span>
    {children}
  </div>
);

// Coding agent working a task inside its own computer: run, fail, patch,
// pass, open the PR. Flat ink, per the code-and-terminal rule.
const CodingAgentVignette = () => (
  <div
    className={`ink-panel selection-paper relative flex flex-1 flex-col overflow-hidden rounded-lg border border-ink/20 bg-ink font-mono text-[12px] leading-[1.7] text-cream/85`}
  >
    <div className="flex items-center justify-between border-b border-cream/10 px-3 py-2 text-[11px] text-cream/45">
      <span className="flex items-center gap-2">
        <span aria-hidden="true" className="flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-cream/20" />
          <span className="h-1.5 w-1.5 rounded-full bg-cream/20" />
          <span className="h-1.5 w-1.5 rounded-full bg-cream/20" />
        </span>
        <span className="font-sans">agent-7f2c · acme/shop</span>
      </span>
      <span className="flex items-center gap-1.5 font-sans">
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full bg-sage ${styles.runDot}`}
        />
        running
      </span>
    </div>
    <div className="px-4 py-3">
      <p className={styles.typeLine} style={stagger(0)}>
        <span className="text-sage">›</span> Fix the flaky test in
        checkout.spec.ts
      </p>
      <p className={styles.typeLine} style={stagger(1)}>
        <span className="text-sage">$</span> pnpm vitest run checkout
      </p>
      <p className={`text-cream/55 ${styles.typeLine}`} style={stagger(2)}>
        {"  "}12 passed · <span className="text-cream/85">1 failed</span> ·
        total.ts:41 rounding
      </p>
      <p className={styles.typeLine} style={stagger(3)}>
        <span className="text-sage">~</span> src/checkout/total.ts{" "}
        <span className="text-sage">+3</span>{" "}
        <span className="text-cream/45">−1</span>
      </p>
      <p className={styles.typeLine} style={stagger(4)}>
        <span className="text-sage">$</span> pnpm vitest run checkout
      </p>
      <p className={`text-cream/55 ${styles.typeLine}`} style={stagger(5)}>
        {"  "}13 passed
      </p>
      <p className={styles.typeLine} style={stagger(6)}>
        <span className="text-sage">›</span> Opened PR #482 · resumed after 2
        restarts
      </p>
    </div>
  </div>
);

// Prompt in, deployed app out. The builder's user describes a tool; the
// generated backend ships as its own release and the app fills with data.
const AppBuilderVignette = () => {
  const quotes = [
    { job: "Hendricks · full replacement", amount: "$12,400", stage: "Sent" },
    { job: "Okafor · re-shingle", amount: "$8,900", stage: "New" },
    { job: "Lindqvist · leak repair", amount: "$3,250", stage: "Won" },
  ];
  return (
    <div className={VIGNETTE_CLASS}>
      <MiniChromeBar>
        <span className="ml-1 flex-1 truncate rounded-sm border border-ink/10 bg-white px-2 py-0.5 font-mono text-[11px] text-ink-faint">
          northwind-crm.example.app
        </span>
      </MiniChromeBar>
      <div className="grid flex-1 gap-3 p-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="flex flex-col gap-2.5">
          <div className="ml-auto w-fit max-w-[92%] ink-panel rounded-2xl rounded-br-md bg-ink px-3 py-1.5 text-cream">
            Build a CRM for my roofing business with a quotes pipeline.
          </div>
          <ul className="space-y-1.5 px-1 text-[11px] text-ink-faint">
            {[
              "Generated schema · 4 tables",
              "Wrote API · 11 routes",
              "Deployed release v3",
            ].map((step, i) => (
              <li key={step} className={styles.step} style={stagger(i)}>
                <span className="text-highlight">✓</span> {step}
              </li>
            ))}
          </ul>
          <p className="mt-auto px-1 text-[11px] text-ink-faint">
            Release v3 · live for 2 users
          </p>
        </div>
        <div className="flex flex-col rounded-md border border-ink/10 p-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-ink">Quotes</span>
            <span className="flex items-center gap-1.5 text-ink-faint">
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full bg-highlight ${styles.liveDot}`}
              />
              Live
            </span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5 text-[10px]">
            {[
              ["New", "6"],
              ["Sent", "3"],
              ["Won", "9"],
            ].map(([stage, count], i) => (
              <div
                key={stage}
                className={`flex items-baseline justify-between rounded-sm bg-ink/[0.05] px-2 py-1 ${styles.stat}`}
                style={stagger(i)}
              >
                <span className="text-ink-faint">{stage}</span>
                <span className="font-mono text-[12px] text-ink">{count}</span>
              </div>
            ))}
          </div>
          <ul className="mt-2 divide-y divide-ink/10 text-[11px]">
            {quotes.map((quote, i) => (
              <li
                key={quote.job}
                className={`flex items-center gap-2 py-1.5 ${styles.row}`}
                style={stagger(i)}
              >
                <span className="min-w-0 flex-1 truncate text-ink">
                  {quote.job}
                </span>
                <span className="shrink-0 font-mono text-ink-soft">
                  {quote.amount}
                </span>
                <span
                  className={`w-9 shrink-0 text-right text-[10px] ${quote.stage === "Won" ? "text-highlight" : "text-ink-faint"}`}
                >
                  {quote.stage}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// An agent inside the company boundary, reading the systems it is allowed to.
const CompanyAgentVignette = () => (
  <div className={`${VIGNETTE_CLASS} p-3`}>
    <div className="relative rounded-md border border-dashed border-highlight/50 p-3 pt-5">
      <span className="absolute -top-2 left-3 bg-white px-1.5 text-[10px] font-medium text-highlight">
        Your VPC · no data leaves your cloud
      </span>
      <div
        className={`flex items-center justify-between gap-3 rounded-md bg-ink/[0.05] px-3 py-1.5 text-[11px] ${styles.ticket}`}
      >
        <span className="flex min-w-0 items-center gap-2 text-ink">
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 shrink-0 rounded-full bg-highlight ${styles.ticketDot}`}
          />
          <span className="truncate">#4821 · Refund not processed</span>
        </span>
        <span className="shrink-0 font-mono text-ink-faint">Helpdesk · 2m</span>
      </div>
      {/* One SVG spans the three system rows; rows are equal height (chip +
          margin, no row gap) so its 1/6, 1/2, 5/6 endpoints sit on the chip
          centers at any width. Wires fan out from the agent's vertical center. */}
      <div className="mt-2.5 grid auto-rows-fr grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3">
        <div
          className={`row-span-3 self-center rounded-md border border-ink/10 bg-ink/[0.05] px-2.5 py-2 ${styles.agentBox}`}
        >
          <div className="text-[10px] text-ink-faint">Agent</div>
          <div className="font-medium text-ink">Support triage</div>
        </div>
        {/* Out of flow so the SVG's square viewBox never contributes height to the rows. */}
        <div className="relative row-span-3 self-stretch">
          <svg
            aria-hidden="true"
            className="absolute inset-0 h-full w-full overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            fill="none"
          >
            {[
              "M0 50 C 55 50, 45 16.667, 100 16.667",
              "M0 50 H 100",
              "M0 50 C 55 50, 45 83.333, 100 83.333",
            ].map((d, i) => (
              <path
                key={d}
                d={d}
                vectorEffect="non-scaling-stroke"
                className={`stroke-highlight/40 ${styles.wire}`}
                style={stagger(i)}
              />
            ))}
          </svg>
        </div>
        {["Postgres", "Orders API", "Helpdesk"].map((system, i) => (
          <span
            key={system}
            className={`my-[3px] rounded-sm border border-ink/10 bg-white px-2 py-0.5 font-mono text-[11px] text-ink-soft ${styles.system}`}
            style={stagger(i)}
          >
            {system}
          </span>
        ))}
      </div>
    </div>
    <p className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-0.5 pt-2.5 text-[11px] text-ink-faint">
      <span
        className={`flex w-fit items-center gap-1 rounded-sm border border-highlight/30 bg-white px-1.5 py-px text-[10px] text-highlight ${styles.resultChip}`}
      >
        <span aria-hidden="true">✓</span> Refund issued · ticket resolved
      </span>
      <span className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full bg-highlight ${styles.connectedDot}`}
        />
        3 systems connected
      </span>
    </p>
  </div>
);

const CheckGlyph = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 12 12"
    className={`h-2.5 w-2.5 text-white ${className ?? ""}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2.5 6.3 4.9 8.6 9.5 3.6" />
  </svg>
);

// One long-lived agent per person: a standing schedule, a conversation that
// picks up where it left off, memory that outlives any single request. On
// hover the schedule fires, the request lands, the agent types, replies, sets
// the reminder, and the memory count ticks up by one.
const PersonalAgentVignette = () => (
  <div className={`${VIGNETTE_CLASS} p-3`}>
    <div
      className={`flex items-center justify-between rounded-md bg-ink/[0.05] px-3 py-2 text-[11px] ${styles.schedule}`}
    >
      <span className="flex items-center gap-2 text-ink">
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full bg-highlight ${styles.scheduleDot}`}
        />
        Morning briefing
      </span>
      <span className="font-mono text-ink-faint">weekdays · 07:00</span>
    </div>
    <div className="mt-2.5 space-y-2">
      <div
        className={`ml-auto w-fit max-w-[82%] ink-panel rounded-2xl rounded-br-md bg-ink px-3 py-1.5 text-cream ${styles.bubbleOut}`}
      >
        Move my 3pm with Sam to tomorrow.
      </div>
      <div className="relative">
        <div
          aria-hidden="true"
          className={`absolute left-0 top-0 flex h-8 items-center gap-1 rounded-2xl rounded-bl-md bg-ink/[0.05] px-3 opacity-0 ${styles.typing}`}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full bg-ink/30 ${styles.typingDot}`}
              style={stagger(i)}
            />
          ))}
        </div>
        <div
          className={`w-fit max-w-[88%] rounded-2xl rounded-bl-md bg-ink/[0.05] px-3 py-2 ${styles.bubbleIn}`}
        >
          Done. Sam accepted 10am tomorrow, and I&apos;ll remind you at 9:45.
          <span
            className={`mt-1.5 flex w-fit items-center gap-1 rounded-sm border border-highlight/30 bg-white px-1.5 py-px text-[10px] text-highlight ${styles.chip}`}
          >
            <span aria-hidden="true">✓</span> Reminder · tomorrow 9:45
          </span>
        </div>
      </div>
    </div>
    <p className="mt-auto flex items-center justify-between px-0.5 pt-2.5 text-[11px] text-ink-faint">
      <span>Online 214 days</span>
      <span className="grid overflow-hidden font-mono">
        <span
          aria-hidden="true"
          className={`col-start-1 row-start-1 opacity-0 ${styles.countOld}`}
        >
          1,204 memories
        </span>
        <span className={`col-start-1 row-start-1 ${styles.countNew}`}>
          1,205 memories
        </span>
      </span>
    </p>
  </div>
);

// A line of text typed by a named collaborator. On hover the text is revealed
// by a clip-path wipe while one marker (caret + name tag) sweeps across the
// line on the same linear clock, so the tag glides and the text edge always
// sits at the caret. `startMs`/`stepMs` set the delay and per-character pace
// consumed by SolutionsSection.module.css.
const TypedLine = ({
  text,
  tag,
  caretClass,
  startMs,
  stepMs,
}: {
  text: string;
  tag: string;
  caretClass: string;
  startMs: number;
  stepMs: number;
}) => (
  <span
    className={`${styles.typed} ${caretClass}`}
    style={
      {
        "--start": `${startMs}ms`,
        "--dur": `${[...text].length * stepMs}ms`,
      } as CSSProperties
    }
  >
    <span className={`inline-block ${styles.typedText}`}>{text}</span>
    <span aria-hidden="true" className={styles.typedMarker}>
      <span className={styles.typedCaret} />
      <span className={styles.typedTag}>{tag}</span>
    </span>
  </span>
);

// Several people in one document, one authoritative state. On hover the
// collaborators arrive, JM types the second line, the item
// ticks, RS types a new line, and the sync settles.
const RealtimeVignette = () => {
  const people = [
    { initials: "AK", fill: "bg-highlight" },
    { initials: "JM", fill: "bg-product-actors" },
    { initials: "RS", fill: "bg-product-workflows" },
  ];
  return (
    <div className={VIGNETTE_CLASS}>
      <MiniChromeBar>
        <span className="ml-1 flex-1 truncate text-[11px] text-ink-faint">
          Q3 launch plan
        </span>
        <span aria-hidden="true" className="flex -space-x-1.5">
          {people.map((person, i) => (
            <span
              key={person.initials}
              className={`flex h-5 w-5 items-center justify-center rounded-full border-2 border-white text-[8px] font-medium text-white ${person.fill} ${styles.avatar}`}
              style={stagger(i)}
            >
              {person.initials}
            </span>
          ))}
        </span>
      </MiniChromeBar>
      <div className="flex flex-1 flex-col p-3">
        <p className="font-medium text-ink">Launch checklist</p>
        <ul className="mt-2 space-y-2 text-ink-soft">
          <li className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="flex h-3 w-3 items-center justify-center rounded-sm border border-ink/25 bg-highlight"
            >
              <CheckGlyph />
            </span>
            Ship pricing page
          </li>
          <li className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`flex h-3 w-3 items-center justify-center rounded-sm border border-ink/25 ${styles.tick}`}
            >
              <CheckGlyph className={`opacity-0 ${styles.tickMark}`} />
            </span>
            <TypedLine
              text="Draft announcement post"
              tag="JM"
              caretClass="[--caret:theme(colors.product-actors)]"
              startMs={450}
              stepMs={48}
            />
          </li>
          <li className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-3 w-3 rounded-sm border border-ink/25"
            />
            Schedule webinar
          </li>
          <li className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-3 w-3 rounded-sm border border-ink/25"
            />
            <TypedLine
              text="Send launch email"
              tag="RS"
              caretClass="[--caret:theme(colors.product-workflows)]"
              startMs={1950}
              stepMs={53}
            />
          </li>
        </ul>
        <p className="mt-auto flex items-center justify-between pt-3 text-[11px] text-ink-faint">
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full bg-highlight ${styles.connectedDot}`}
            />
            3 editing now
          </span>
          <span className="grid font-mono">
            <span className={`col-start-1 row-start-1 ${styles.synced}`}>
              synced · 12 ms
            </span>
            <span
              aria-hidden="true"
              className={`col-start-1 row-start-1 opacity-0 ${styles.syncing}`}
            >
              syncing…
            </span>
          </span>
        </p>
      </div>
    </div>
  );
};

export const solutions: Solution[] = [
  {
    id: "coding-agents",
    title: "Coding agents",
    href: "/agentos/",
    linkLabel: "Explore agentOS",
    uses: ["agentos", "actors", "workflows"],
    vignette: <CodingAgentVignette />,
    wide: true,
  },
  {
    id: "agent-app-builders",
    title: "Agent app builders",
    href: "/dynamic-apps/docs/",
    linkLabel: "Explore Dynamic Apps",
    uses: ["dynamic-apps", "actors"],
    vignette: <AppBuilderVignette />,
    wide: true,
  },
  {
    id: "company-agents",
    title: "Company-specific agents",
    href: "/enterprise/",
    linkLabel: "Explore Enterprise",
    uses: ["actors", "agentos"],
    vignette: <CompanyAgentVignette />,
  },
  {
    id: "personal-agents",
    title: "Personal agents",
    href: "/actors/docs/",
    linkLabel: "Explore Actors",
    uses: ["actors", "workflows"],
    vignette: <PersonalAgentVignette />,
  },
  {
    id: "realtime-apps",
    title: "Realtime apps",
    href: "/actors/docs/",
    linkLabel: "Explore Actors",
    uses: ["actors"],
    vignette: <RealtimeVignette />,
  },
];

const SolutionCard = ({ solution }: { solution: Solution }) => (
  <a
    href={canonicalizeInternalHref(solution.href)}
    data-site-reveal-child=""
    className={`group flex h-full flex-col rounded-xl border border-ink/10 bg-white/55 p-6 transition-colors duration-200 hover:border-ink/25 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 focus-visible:ring-offset-paper motion-reduce:transition-none md:p-8 ${styles.card}`}
  >
    <div className="flex items-start justify-between gap-4">
      <h3 className={CARD_TITLE_CLASS}>{solution.title}</h3>
      <ul
        aria-label="Built with"
        className="flex shrink-0 items-center gap-1.5"
      >
        {solution.uses.map((id) => {
          const product = productById(id);
          if (!product) return null;
          return (
            <li key={id} title={product.name}>
              <ProductBadge product={product} className="size-6" />
              <span className="sr-only">{product.name}</span>
            </li>
          );
        })}
      </ul>
    </div>
    <div className="mt-6 flex flex-1 flex-col">{solution.vignette}</div>
    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-pine">
      {solution.linkLabel}
      <span
        aria-hidden="true"
        className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
      >
        →
      </span>
    </span>
  </a>
);

export const SolutionsSection = () => (
  <section
    aria-labelledby="landing-solutions-title"
    className={`bg-paper ${SITE_SECTION_CLASS}`}
  >
    <div className={SITE_STANDARD_RAIL_CLASS}>
      <div className="max-w-3xl" data-site-reveal="">
        <h2 id="landing-solutions-title" className={SECTION_H2_CLASS}>
          Built for everything agents need.
        </h2>
      </div>

      <ul
        className="mt-12 grid gap-6 lg:grid-cols-6"
        data-site-reveal-group=""
        data-site-reveal-stagger="70"
      >
        {solutions.map((solution) => (
          <li
            key={solution.id}
            className={`min-w-0 ${solution.wide ? "lg:col-span-3" : "lg:col-span-2"}`}
          >
            <SolutionCard solution={solution} />
          </li>
        ))}
      </ul>
    </div>
  </section>
);
