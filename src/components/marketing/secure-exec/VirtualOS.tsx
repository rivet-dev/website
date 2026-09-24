"use client";

import { motion } from "framer-motion";
import { InfoTooltip } from "./ui/InfoTooltip";
import { FolderTree, Globe, GitFork, PackagePlus, Shield, Gauge } from "lucide-react";

// The virtual OS, grouped by subsystem. Every feature is serviced inside the
// library and never reaches the host unless the embedder opts in. Wording
// follows the Secure Exec docs (filesystem, networking, permissions,
// resource-limits, long-running-code, contexts, host-functions).
const groups = [
  {
    icon: FolderTree,
    title: "Filesystem",
    hoverColor: "group-hover:text-blue-400",
    chromeAngle: "110deg",
    features: [
      { name: "Virtual POSIX filesystem", detail: "node:fs works as usual; writes never reach the host disk" },
      { name: "Mount anything", detail: "S3, Archil, a host directory, or a custom backend at a guest path" },
      { name: "Read & write files", detail: "vm.filesystem moves individual files in and out — no mount needed" },
    ],
  },
  {
    icon: Globe,
    title: "Networking",
    hoverColor: "group-hover:text-green-400",
    chromeAngle: "200deg",
    features: [
      { name: "Outbound requests", detail: "fetch, node:http, node:net, and DNS over a virtual network stack" },
      { name: "Servers", detail: "guest code listens on a virtual port; the host sends requests in" },
      { name: "Token injection", detail: "credentials attached at the boundary, never in guest code" },
    ],
  },
  {
    icon: GitFork,
    title: "Processes",
    hoverColor: "group-hover:text-pink-400",
    chromeAngle: "260deg",
    features: [
      { name: "Process trees", detail: "child_process spawns guest processes, never host ones" },
      { name: "Shell and coreutils", detail: "a real sh, so npm scripts and CLIs like git behave" },
      { name: "Pipes and PTYs", detail: "piped commands and interactive programs work" },
    ],
  },
  {
    icon: PackagePlus,
    title: "Packages & runtime",
    hoverColor: "group-hover:text-purple-400",
    chromeAngle: "320deg",
    features: [
      { name: "npm install", detail: "packages install into the VM's own filesystem" },
      { name: "TypeScript", detail: "execute, evaluate, and type-check it" },
      { name: "Contexts", detail: "keep variables between calls like a REPL, several in parallel" },
    ],
  },
  {
    icon: Shield,
    title: "Permissions",
    hoverColor: "group-hover:text-amber-400",
    chromeAngle: "45deg",
    features: [
      { name: "Deny by default", detail: "the network is denied until you allow it — everything, or only named hosts" },
      { name: "Per-scope policy", detail: "fs, network, childProcess, process, env, and host functions" },
      { name: "Host functions", detail: "bindings run in your process; the guest sees only inputs and outputs" },
    ],
  },
  {
    icon: Gauge,
    title: "Resource limits",
    hoverColor: "group-hover:text-orange-400",
    chromeAngle: "160deg",
    features: [
      { name: "Timeouts", detail: "runaway code returns timed_out instead of hanging your process" },
      { name: "Memory caps", detail: "bound the V8 heap per VM" },
      { name: "Kernel limits", detail: "processes, file descriptors, sockets, filesystem bytes, output buffers" },
    ],
  },
];

export function VirtualOS() {
  return (
    <section id="virtual-os" className="border-t border-white/10 py-48">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
        <div className="lg:sticky lg:top-40 lg:self-start">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-4 text-2xl font-normal tracking-tight text-white md:text-4xl"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            A sandboxed operating system, as a library
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base leading-relaxed text-zinc-500"
          >
            A bare V8 isolate can only compute. Secure Exec adds a virtual operating system inside the library, so
            Node.js gets everything it expects from a real machine. None of it touches the host unless you allow
            it.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid gap-4 sm:grid-cols-2"
        >
          {groups.map((group) => (
            <div
              key={group.title}
              className="group flex flex-col gap-4 rounded-xl p-6 chrome-gradient-border chrome-hover"
              style={{ "--chrome-angle": group.chromeAngle } as React.CSSProperties}
            >
              <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
                <div className={`text-zinc-500 transition-colors ${group.hoverColor}`}>
                  <group.icon className="h-4 w-4" />
                </div>
                <h3 className="text-base font-medium text-white">{group.title}</h3>
              </div>
              <ul className="flex flex-col gap-2.5">
                {group.features.map((feature) => (
                  <li key={feature.name} className="flex items-center gap-2.5 text-sm text-zinc-400">
                    <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                    {feature.name}
                    <InfoTooltip>{feature.detail}</InfoTooltip>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
