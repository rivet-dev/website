"use client";

import { useState } from "react";

export function CopyInstallCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Install command copied" : `Copy ${command}`}
      className="group relative flex w-full items-center justify-center gap-2.5 rounded-md border border-ink/15 bg-white/55 px-3.5 py-2.5 font-mono text-[13px] text-ink-soft transition-colors motion-reduce:transition-none hover:border-ink/30 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine/60 focus-visible:ring-offset-2 focus-visible:ring-offset-paper sm:w-auto"
    >
      <span aria-hidden="true" className="select-none text-pine">
        $
      </span>
      <span className="whitespace-nowrap">{command}</span>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded bg-ink px-2 py-1 font-sans text-xs text-white shadow-sm transition-opacity motion-reduce:transition-none ${copied ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"}`}
      >
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}
