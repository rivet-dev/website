"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { useId, useRef, useState } from "react";
import { canonicalizeInternalHref } from "@/lib/internalHref";

export interface WorkflowCodeTab {
  key: string;
  label: string;
  raw: string;
  highlighted: string;
  documentationUrl: string;
  sourceUrl: string;
}

export function WorkflowCodeTabs({ tabs }: { tabs: WorkflowCodeTab[] }) {
  const [activeKey, setActiveKey] = useState(tabs[0]?.key ?? "");
  const [copied, setCopied] = useState(false);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const id = useId().replace(/:/g, "");
  const activeTab = tabs.find((tab) => tab.key === activeKey) ?? tabs[0];

  if (!activeTab) return null;

  const selectByIndex = (index: number) => {
    const next = tabs[(index + tabs.length) % tabs.length];
    setActiveKey(next.key);
    tabRefs.current[(index + tabs.length) % tabs.length]?.focus();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(activeTab.raw);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2_000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-ink/10 bg-white/55 text-ink">
      <div className="workflow-code-controls flex min-h-12 items-stretch justify-between border-b border-ink/10 bg-white/35">
        <div
          role="tablist"
          aria-label="Source examples"
          className="scrollbar-hide flex min-w-0 overflow-x-auto"
        >
          {tabs.map((tab, index) => {
            const selected = tab.key === activeTab.key;
            return (
              <button
                key={tab.key}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                id={`${id}-tab-${tab.key}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${id}-panel-${tab.key}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveKey(tab.key)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight") {
                    event.preventDefault();
                    selectByIndex(index + 1);
                  } else if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    selectByIndex(index - 1);
                  } else if (event.key === "Home") {
                    event.preventDefault();
                    selectByIndex(0);
                  } else if (event.key === "End") {
                    event.preventDefault();
                    selectByIndex(tabs.length - 1);
                  }
                }}
                className={`whitespace-nowrap border-b-2 px-4 py-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pine ${
                  selected
                    ? "border-pine bg-paper-mid/70 text-ink"
                    : "border-transparent text-ink-faint hover:bg-white/55 hover:text-ink-soft"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Code copied" : `Copy ${activeTab.label} code`}
          className="flex w-12 shrink-0 items-center justify-center border-l border-ink/10 text-ink-faint transition-colors hover:bg-white/55 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pine"
        >
          {copied ? (
            <Check className="h-4 w-4 text-pine" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {tabs.map((tab) => {
        const selected = tab.key === activeTab.key;
        return (
          <div
            key={tab.key}
            id={`${id}-panel-${tab.key}`}
            role="tabpanel"
            aria-labelledby={`${id}-tab-${tab.key}`}
            hidden={!selected}
            tabIndex={0}
            className="max-h-[34rem] overflow-auto bg-white/45 p-5 font-mono text-[12px] leading-6 text-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pine sm:p-6"
          >
            <div
              className="[&_.shiki]:!m-0 [&_.shiki]:!bg-transparent [&_.shiki]:!p-0 [&_.line]:block [&_.line]:whitespace-pre"
              dangerouslySetInnerHTML={{ __html: tab.highlighted }}
            />
          </div>
        );
      })}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-ink/10 bg-white/35 px-5 py-3 text-xs text-ink-faint">
        <a
          className="inline-flex items-center gap-1.5 rounded-sm text-pine transition-colors motion-reduce:transition-none hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          href={canonicalizeInternalHref(activeTab.documentationUrl)}
        >
          Read the documentation
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
        <a
          className="inline-flex items-center gap-1.5 rounded-sm text-pine transition-colors motion-reduce:transition-none hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          href={activeTab.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          View source on GitHub
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
