import { cn } from "@rivet-gg/components";
import { Icon } from "@rivet-gg/icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { ReactNode } from "react";

interface TabProps {
	title: string;
	icon?: IconDefinition;
	children: ReactNode;
}

export const Tab = ({ title, icon, children }: TabProps) => {
	return (
		<div data-tab-item data-tab-title={title} className="mt-8 first:mt-0">
			<h3
				data-tab-fallback-title
				className="flex items-center gap-2.5 text-xl font-medium"
			>
				{icon && <Icon icon={icon} className="size-4 shrink-0" />}
				<span>{title}</span>
			</h3>
			<button
				type="button"
				data-tab-trigger={title}
				className={cn(
					"hidden",
					"relative inline-flex min-h-[2.75rem] items-center justify-center gap-2.5 whitespace-nowrap",
					"rounded-none border-b-2 bg-transparent px-4 py-2.5 text-sm font-semibold",
					"ring-offset-background transition-none",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
					"disabled:pointer-events-none disabled:opacity-50",
					"border-b-transparent text-muted-foreground",
				)}
			>
				{icon && <Icon icon={icon} className="size-4 shrink-0" />}
				<span>{title}</span>
			</button>
			<div data-tab-content className="mt-4">
				{children}
			</div>
		</div>
	);
};

interface TabsProps {
	children: ReactNode;
	label?: string;
}

export const Tabs = ({ children, label = "Options" }: TabsProps) => {
	return (
		<div data-tabs-container className="my-4">
			<div data-tabs-controls className="overflow-x-auto" hidden>
				<div
					data-tabs-list
					role="tablist"
					aria-label={label}
					className="inline-flex text-ink-soft border-b border-ink/10 w-full"
				>
				</div>
			</div>
			<div data-tabs-content-container hidden>
			</div>
			<div data-tabs-source>
				{children}
			</div>
		</div>
	);
};
