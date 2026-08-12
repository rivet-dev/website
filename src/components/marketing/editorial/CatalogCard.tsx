import type { ReactNode } from 'react';

// Porcelain catalog entry: hairline border, translucent white fill over the
// porcelain field, optional pine footer link. Hook-free.
interface CatalogCardProps {
	title?: ReactNode;
	href?: string;
	linkLabel?: ReactNode;
	children?: ReactNode;
	className?: string;
	// Pine frame for the one emphasized entry in a set (e.g. the Rivet plate on
	// compare pages).
	highlight?: boolean;
}

export const CatalogCard = ({
	title,
	href,
	linkLabel,
	children,
	className,
	highlight = false,
}: CatalogCardProps) => {
	const body = (
		<>
			{title ? (
				<h3 className="text-lg font-medium tracking-[-0.01em] text-ink md:text-xl">
					{title}
				</h3>
			) : null}
			{children}
			{href && linkLabel ? (
				<span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-pine">
					{linkLabel}
					<span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">
						→
					</span>
				</span>
			) : null}
		</>
	);

	const cardClass = `group block border ${
		highlight ? 'border-pine/60' : 'border-ink/10'
	} bg-white/55 p-7 transition-colors duration-200 ${
		href && !highlight ? 'hover:border-ink/25' : ''
	} ${className ?? ''}`;

	return href ? (
		<a href={href} className={cardClass}>
			{body}
		</a>
	) : (
		<div className={cardClass}>{body}</div>
	);
};
