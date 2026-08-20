import type { ReactNode } from 'react';
import { EYEBROW_CLASS } from '../typography';

// Quiet section label: plain sans, sentence case. Hook-free so zero-JS pages
// can use it.
interface EyebrowProps {
	label: ReactNode;
	rule?: boolean;
	className?: string;
}

export const Eyebrow = ({ label, rule = false, className }: EyebrowProps) => (
	<p
		className={`${EYEBROW_CLASS} ${rule ? 'border-t border-ink/10 pt-5' : ''} ${className ?? ''}`}
	>
		{label}
	</p>
);
