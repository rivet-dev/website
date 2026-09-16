// Plan tag, ported from the dashboard's `PlanBadge`
// (frontend/src/app/billing/billing-plan-badge.tsx in rivet-dev/actors) so the
// website's pricing page and the billing UI label plans identically.

export type PlanKey = 'free' | 'hobby' | 'team' | 'enterprise';

// One accent color per plan. Tailwind's JIT needs the full class strings to
// exist literally, so each plan spells out its classes. These are the
// dashboard's light-mode variants; the pricing page has no ink surface.
const PLAN_COLORS: Record<PlanKey, string> = {
	free: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700',
	hobby: 'border-orange-500/40 bg-orange-500/10 text-orange-700',
	team: 'border-blue-500/40 bg-blue-500/10 text-blue-700',
	enterprise: 'border-purple-500/40 bg-purple-500/10 text-purple-700',
};

export function PlanBadge({
	plan,
	children,
	className = '',
}: {
	plan: PlanKey;
	children: string;
	className?: string;
}) {
	return (
		<span
			className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md border px-2 py-0.5 font-mono text-xs leading-4 ${PLAN_COLORS[plan]} ${className}`}
		>
			{children}
		</span>
	);
}
