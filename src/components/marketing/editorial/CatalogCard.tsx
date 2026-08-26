import type { ReactNode } from 'react';
import { CARD_TITLE_CLASS, EYEBROW_CLASS } from '../typography';
import { canonicalizeInternalHref } from '@/lib/internalHref';

// Porcelain catalog entry: rounded hairline border, translucent white fill
// over the porcelain field, optional pine footer link. Hook-free.
interface CatalogCardProps {
	// Mono pine eyebrow above the title (e.g. the verb in the product framing).
	eyebrow?: ReactNode;
	title?: ReactNode;
	href?: string;
	linkLabel?: ReactNode;
	children?: ReactNode;
	className?: string;
	// Pine frame for the one emphasized entry in a set (e.g. the Rivet plate on
	// compare pages).
	highlight?: boolean;
	// Drop the card's own radius and border so it can sit as a cell inside a
	// fused hairline slab. A className override can't do this reliably —
	// rounded-none/border-0 lose to the base classes in stylesheet order.
	flush?: boolean;
	external?: boolean;
}

export const CatalogCard = ({
	eyebrow,
	title,
	href,
	linkLabel,
	children,
	className,
	highlight = false,
	flush = false,
	external = false,
}: CatalogCardProps) => {
	const body = (
		<>
			{eyebrow ? <p className={`${EYEBROW_CLASS} mb-3 normal-case`}>{eyebrow}</p> : null}
			{title ? (
				<h3 className={CARD_TITLE_CLASS}>
					{title}
				</h3>
			) : null}
			{children}
			{href && linkLabel ? (
				<span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-pine">
					{linkLabel}
					<span aria-hidden="true" className="transition-transform duration-200 motion-reduce:transition-none group-hover:translate-x-0.5">
						→
					</span>
				</span>
			) : null}
		</>
	);

	const frameClass = flush
		? ''
		: `rounded-xl border ${highlight ? 'border-pine/60' : 'border-ink/10'} ${
				href && !highlight ? 'hover:border-ink/25' : ''
			}`;
	const cardClass = `group block ${frameClass} bg-white/55 p-6 transition-colors duration-200 motion-reduce:transition-none md:p-8 ${
		href ? 'hover:bg-white' : ''
	} ${href ? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 focus-visible:ring-offset-paper' : ''} ${className ?? ''}`;

	return href ? (
		<a
			href={canonicalizeInternalHref(href)}
			className={cardClass}
			{...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
		>
			{body}
		</a>
	) : (
		<div className={cardClass}>{body}</div>
	);
};
