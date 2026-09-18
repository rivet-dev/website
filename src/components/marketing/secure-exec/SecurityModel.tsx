"use client";

import { motion } from "framer-motion";
import { InfoTooltip } from "./ui/InfoTooltip";

const SECURITY_DOCS = "/agentos/docs/security-model/";

// Diagram palette: the page's own grays. Structure is drawn in white at varying
// strength rather than in hues, so the figures read as part of the chrome.
const INK = "#ffffff";
const BRIGHT = "#e4e4e7";
const MUTED = "#d4d4d8";
const DIM = "#a1a1aa";
const FAINT = "#71717a";
const RED = "#f87171";
const SKY = "#38BDF8";

const columns = [
  {
    title: "Full Node.js APIs & npm packages",
    info: (
      <>
        <strong>What guest code gets:</strong> a virtual filesystem behind <code>node:fs</code>, networking through{" "}
        <code>fetch</code>, <code>node:http</code> and <code>node:net</code>, child processes with a real shell and
        coreutils, pipes and PTYs, and <code>npm install</code> into the VM's own filesystem.
        <br />
        <br />
        That is what lets unmodified packages and CLIs — Next.js, webpack, esbuild, git — run as they expect.
      </>
    ),
  },
  {
    title: "Securely run untrusted code",
    info: (
      <>
        <strong>The bar:</strong> code you did not write, and its dependencies, cannot reach your filesystem, your
        network, or your processes, cannot read another VM's state, and cannot exhaust the host.
        <br />
        <br />
        Secure Exec treats the guest as actively hostile: every syscall is serviced by the kernel, the network is
        denied by default, and CPU and memory are bounded.
        <br />
        <br />
        <a href={SECURITY_DOCS}>Security model →</a>
      </>
    ),
  },
  {
    title: "Lightweight",
    info: (
      <>
        <strong>Per execution:</strong> ~17.9 ms to first code running and ~3.4 MB of memory, against seconds and a
        ~256 MB floor for a container or microVM.
        <br />
        <br />
        It is a library, so there is no daemon, no hypervisor, no vendor account, and no egress fee. It deploys
        wherever your code already deploys.
      </>
    ),
  },
];

type Cell = "yes" | "no" | "partial";

const approaches: {
  name: string;
  detail: string;
  cells: Cell[];
  notes?: Record<number, React.ReactNode>;
  highlight?: boolean;
}[] = [
  {
    name: "Raw Node.js",
    detail: "node:vm, child_process",
    cells: ["yes", "no", "yes"],
    notes: {
      1: (
        <>
          Node's own documentation states that <code>node:vm</code> is <strong>not a security mechanism</strong>:
          guest code can escape the context and reach the host realm. <code>child_process</code> spawns real host
          processes with your permissions.
        </>
      ),
    },
  },
  {
    name: "Raw V8 isolate / QuickJS",
    detail: "a bare JS engine",
    cells: ["no", "partial", "yes"],
    notes: {
      0: (
        <>
          A bare engine is only the JavaScript language. There is no <code>fs</code>, no <code>net</code>, no{" "}
          <code>child_process</code>, so most npm packages and every CLI fail.
        </>
      ),
      1: (
        <>
          An isolate is a <strong>language</strong> boundary, not a complete security boundary. Embedded natively in
          your process it shares an address space with your secrets, so it carries real attack surface:
          speculative-execution side channels such as Spectre, resource exhaustion (CPU spin, heap and stack
          exhaustion) that takes the host down with it, and engine bugs that escape straight into your process.
          <br />
          <br />
          Containing that takes more than the isolate itself — mediated syscalls, resource accounting, and process
          separation.
          <br />
          <br />
          <a href={SECURITY_DOCS}>How Secure Exec handles it →</a>
        </>
      ),
    },
  },
  {
    name: "Container sandbox",
    detail: "microVMs, Docker",
    cells: ["yes", "yes", "no"],
    notes: {
      2: (
        <>
          Cold starts run to seconds, the memory floor is about 256 MB, and you need a vendor account, API keys, and
          per-GB egress — per execution.
        </>
      ),
    },
  },
  {
    name: "Secure Exec",
    detail: "V8 isolate + virtual OS",
    cells: ["yes", "yes", "yes"],
    highlight: true,
  },
];

// Shared diagram geometry: a 360-wide column, guest on top, host along the
// bottom, and whatever sits between them in the middle.
const HOST_RESOURCES = ["Filesystem", "Network", "Shell", "Processes"];
const hostX = (i: number) => 15 + i * 84;

function Guest({ y, height = 56 }: { y: number; height?: number }) {
  return (
    <>
      <rect x="100" y={y} width="160" height={height} rx="2" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.55)" />
      <text x="180" y={y + 24} textAnchor="middle" fontSize="13" fill={INK}>
        Guest code
      </text>
      <text x="180" y={y + 42} textAnchor="middle" fontSize="10.5" fill={MUTED}>
        untrusted
      </text>
    </>
  );
}

/**
 * The caller's own process. It is the outer frame of all three diagrams, so the
 * comparison is always "what is inside your process, and what is not".
 */
function YourProcess({ height, children }: { height: number; children?: React.ReactNode }) {
  return (
    <>
      <rect x="12" y="16" width="336" height={height} rx="2" fill="none" stroke={FAINT} />
      <text x="28" y="38" fontSize="13" fill={INK}>
        Your process
      </text>
      {children}
    </>
  );
}

function HostLabel({ children }: { children: string }) {
  return (
    <text x="15" y="360" className="font-mono" fontSize="9" letterSpacing="1.2" fill={DIM}>
      {children}
    </text>
  );
}

/** Raw Node.js: the guest is in your process with nothing between it and the host. */
function RawNodeDiagram() {
  return (
    <svg
      viewBox="0 0 360 420"
      className="w-full"
      role="img"
      aria-label="Raw Node.js: untrusted guest code runs inside your own process, and reaches the host filesystem, network, shell, and processes directly."
    >
      <defs>
        <marker id="se-arrow-open" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={RED} />
        </marker>
      </defs>
      <YourProcess height={168} />
      <Guest y={66} />
      <text x="180" y="154" textAnchor="middle" fontSize="10.5" fill={RED}>
        node:vm · child_process — not a security boundary
      </text>

      <text x="180" y="262" textAnchor="middle" className="font-mono" fontSize="9" letterSpacing="1" fill={RED}>
        NO BOUNDARY
      </text>
      <HostLabel>HOST</HostLabel>
      {HOST_RESOURCES.map((label, i) => {
        const cx = hostX(i) + 39;
        return (
          <g key={label}>
            <line x1={cx} y1="184" x2={cx} y2="366" stroke={RED} strokeWidth="1.75" markerEnd="url(#se-arrow-open)" />
            <rect x={hostX(i)} y="370" width="78" height="40" rx="2" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.45)" />
            <text x={cx} y="394" textAnchor="middle" fontSize="11" fill={INK}>
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** A bare engine: still inside your process, and with no I/O to call. */
function RawIsolateDiagram() {
  return (
    <svg
      viewBox="0 0 360 420"
      className="w-full"
      role="img"
      aria-label="A raw V8 isolate or QuickJS: the isolate runs inside your own process, and the filesystem, network, shell, and processes are unreachable because no API for them exists."
    >
      <YourProcess height={176}>
        <rect x="40" y="52" width="280" height="124" rx="2" fill="none" stroke="rgba(248,113,113,0.85)" />
        <text x="56" y="74" fontSize="12" fill={RED}>
          V8 isolate · QuickJS
        </text>
      </YourProcess>
      <Guest y={96} />

      <text x="180" y="222" textAnchor="middle" className="font-mono" fontSize="9" letterSpacing="1" fill={DIM}>
        NO API
      </text>
      <HostLabel>HOST</HostLabel>
      {HOST_RESOURCES.map((label, i) => {
        const cx = hostX(i) + 39;
        return (
          <g key={label}>
            <line x1={cx} y1="192" x2={cx} y2="370" stroke={FAINT} strokeDasharray="4 4" />
            <circle cx={cx} cy="272" r="9" fill="#0c0c0e" stroke={FAINT} />
            <path d={`M${cx - 4} 268 l8 8 M${cx + 4} 268 l-8 8`} stroke={DIM} strokeWidth="1.75" strokeLinecap="round" />
            <rect x={hostX(i)} y="370" width="78" height="40" rx="2" fill="none" stroke={FAINT} />
            <text x={cx} y="394" textAnchor="middle" fontSize="11" fill={DIM}>
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Secure Exec: the guest is not in your process at all. */
function SecureExecDiagram() {
  const kernelCells = ["Virtual filesystem", "Socket table", "Process table", "Pipes · PTYs · DNS"];
  const grants = ["Mounts", "Network allowlist", "Bindings"];
  return (
    <svg
      viewBox="0 0 360 420"
      className="w-full"
      role="img"
      aria-label="Secure Exec: your process calls across a security boundary into a separate sidecar process, where guest code runs in a V8 isolate and every syscall is serviced by a virtual OS kernel. The host is reached only through opt-in mounts, a network allowlist, and bindings."
    >
      <defs>
        <marker id="se-arrow-ink" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={BRIGHT} />
        </marker>
      </defs>
      <YourProcess height={56} />

      {/* The boundary is a process boundary: the guest never runs in your process. */}
      <line x1="12" y1="88" x2="348" y2="88" stroke="rgba(56,189,248,0.95)" strokeDasharray="4 4" />
      <text x="348" y="82" textAnchor="end" className="font-mono" fontSize="8.5" letterSpacing="1" fill={SKY}>
        SECURITY BOUNDARY
      </text>
      <line x1="180" y1="72" x2="180" y2="102" stroke={BRIGHT} strokeWidth="1.75" markerEnd="url(#se-arrow-ink)" />
      <text x="172" y="100" textAnchor="end" fontSize="10" fill={MUTED}>
        syscalls
      </text>

      <rect x="12" y="104" width="336" height="212" rx="2" fill="none" stroke={FAINT} />
      <text x="28" y="126" fontSize="13" fill={INK}>
        Sidecar process
      </text>
      <text x="332" y="126" textAnchor="end" fontSize="10.5" fill={MUTED}>
        separate from yours
      </text>

      <rect x="40" y="136" width="280" height="84" rx="2" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.5)" />
      <text x="56" y="154" fontSize="11" fill={MUTED}>
        V8 isolate
      </text>
      <Guest y={162} height={52} />

      <rect x="28" y="230" width="304" height="78" rx="2" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.5)" />
      <text x="40" y="248" fontSize="11" fill={INK}>
        Virtual OS kernel
      </text>
      {kernelCells.map((label, i) => {
        const x = 40 + (i % 2) * 148;
        const y = 256 + Math.floor(i / 2) * 26;
        return (
          <g key={label}>
            <rect x={x} y={y} width="140" height="22" rx="2" fill="none" stroke="rgba(255,255,255,0.4)" />
            <text x={x + 8} y={y + 15} fontSize="10" fill={BRIGHT}>
              {label}
            </text>
          </g>
        );
      })}

      <HostLabel>HOST</HostLabel>
      {/* Sits between the first two arrows (x=68 and x=180) so neither crosses it. */}
      <text x="84" y="360" className="font-mono" fontSize="9" letterSpacing="1.2" fill={MUTED}>
        OPT-IN ONLY
      </text>
      {grants.map((label, i) => {
        const x = 15 + i * 112;
        const cx = x + 53;
        return (
          <g key={label}>
            <line x1={cx} y1="316" x2={cx} y2="366" stroke={BRIGHT} strokeWidth="1.75" markerEnd="url(#se-arrow-ink)" />
            <rect x={x} y="370" width="106" height="40" rx="2" fill="none" stroke="rgba(255,255,255,0.45)" />
            <text x={cx} y="394" textAnchor="middle" fontSize="11" fill={INK}>
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Marks what is unsafe about an architecture. */
function Bad({ children }: { children: React.ReactNode }) {
  return <span className="text-red-400">{children}</span>;
}

/** Marks what Secure Exec puts in its place. */
function Good({ children }: { children: React.ReactNode }) {
  return <span className="text-sky-400">{children}</span>;
}

const panels = [
  {
    label: "Raw Node.js",
    text: (
      <>
        Untrusted code runs on the host with <Bad>full access to your operating system</Bad>.
      </>
    ),
    Diagram: RawNodeDiagram,
    className: "bg-white/[0.02]",
    chromeAngle: "110deg",
  },
  {
    label: "Raw V8 isolate / QuickJS",
    text: (
      <>
        A naive architecture runs untrusted code inside your process, with{" "}
        <Bad>subtle vulnerabilities and denial of service</Bad>.
      </>
    ),
    Diagram: RawIsolateDiagram,
    className: "bg-white/[0.02]",
    chromeAngle: "180deg",
  },
  {
    label: "Secure Exec",
    text: (
      <>
        <Good>Process isolation</Good>, <Good>Spectre mitigations</Good>, and <Good>resource limits</Good> run code
        securely.
      </>
    ),
    Diagram: SecureExecDiagram,
    className: "bg-white/[0.04]",
    chromeAngle: "250deg",
  },
];

function Mark({ cell, note, align }: { cell: Cell; note?: React.ReactNode; align: "left" | "right" }) {
  const glyph =
    cell === "yes" ? (
      <span className="text-sky-400" aria-label="Yes">
        ✓
      </span>
    ) : cell === "no" ? (
      <span className="text-zinc-600" aria-label="No">
        ✗
      </span>
    ) : (
      <span className="text-base leading-none text-zinc-500" aria-label="Partial">
        –
      </span>
    );

  return (
    <span className="inline-flex items-center">
      {glyph}
      {note && (
        <InfoTooltip placement="bottom" align={align}>
          {note}
        </InfoTooltip>
      )}
    </span>
  );
}

export function SecurityModel() {
  return (
    <section id="security-model" className="border-t border-white/10 py-48">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-2 text-2xl font-normal tracking-tight text-white md:text-4xl"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Secure Node.js that works the way agents need it
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-2xl text-base leading-relaxed text-zinc-500"
          >
            Every other way to run untrusted JavaScript makes you trade something away. Secure Exec keeps the V8
            isolate and puts a virtual OS kernel behind it.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-xl bg-[#0c0c0e] chrome-gradient-border"
          style={{ "--chrome-angle": "50deg" } as React.CSSProperties}
        >
          {/* Scrolls only where the table does not fit. From `lg` up it is
              `visible`, so an info bubble can spill past the card instead of
              being clipped by the scroll container. */}
          <div className="overflow-x-auto lg:overflow-visible">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th scope="col" className="px-6 py-4 font-normal">
                    <span className="sr-only">Approach</span>
                  </th>
                  {columns.map((column, i) => (
                    <th key={column.title} scope="col" className="px-6 py-4 text-center font-normal">
                      <span className="inline-flex items-center text-white">
                        {column.title}
                        <InfoTooltip placement="bottom" align={i === columns.length - 1 ? "right" : "left"}>
                          {column.info}
                        </InfoTooltip>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {approaches.map((approach) => (
                  <tr
                    key={approach.name}
                    className={`border-b border-white/10 last:border-b-0 ${approach.highlight ? "bg-sky-500/[0.06]" : ""}`}
                  >
                    <th scope="row" className="px-6 py-4 font-normal">
                      <span className={`block ${approach.highlight ? "text-white" : "text-zinc-300"}`}>
                        {approach.name}
                      </span>
                      <span className="block font-mono text-xs text-zinc-500">{approach.detail}</span>
                    </th>
                    {approach.cells.map((cell, i) => (
                      <td key={columns[i].title} className="px-6 py-4 text-center text-base">
                        <Mark
                          cell={cell}
                          note={approach.notes?.[i]}
                          align={i === columns.length - 1 ? "right" : "left"}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-24"
        >
          <h3 className="mb-2 text-xl font-normal text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
            How the security compares
          </h3>
          <p className="mb-8 max-w-2xl text-base leading-relaxed text-zinc-500">
            Secure Exec <span className="text-sky-400">uses the same architecture as Cloudflare Workers and
            Chromium</span>, so untrusted code gets the security you would expect.
          </p>
          <div className="grid gap-4 lg:grid-cols-3">
            {panels.map((panel) => (
              <div
                key={panel.label}
                className={`min-w-0 rounded-xl p-6 chrome-gradient-border ${panel.className}`}
                style={{ "--chrome-angle": panel.chromeAngle } as React.CSSProperties}
              >
                <span className="font-mono text-sm text-zinc-500">{panel.label}</span>
                <p className="mb-6 mt-2 text-sm text-zinc-400 lg:min-h-[4.5rem]">{panel.text}</p>
                <div className="mx-auto max-w-[400px]">
                  <panel.Diagram />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 text-center"
        >
          <a
            href={SECURITY_DOCS}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm btn-chrome-outline"
          >
            Read the full security model
            <span aria-hidden="true">→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
