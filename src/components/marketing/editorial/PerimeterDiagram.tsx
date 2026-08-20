import { Ban } from 'lucide-react';

// Green schematic of the self-hosted deployment boundary, shared by the
// landing OnPremSection and the enterprise page. Hook-free.
export interface PerimeterDiagramNode {
	title: string;
	detail: string;
}

const DEFAULT_NODES: PerimeterDiagramNode[] = [
	{ title: 'Your backend', detail: 'Actors run in your Node.js or Bun process' },
	{ title: 'Rivet control plane', detail: 'Can start as one binary for scheduling and routing' },
	{ title: 'Your storage', detail: 'File system, Postgres, or FoundationDB' },
];

interface PerimeterDiagramProps {
	nodes?: PerimeterDiagramNode[];
	label?: string;
	/** Pass null to omit the footer when the surrounding copy carries the claim. */
	footer?: string | null;
	className?: string;
}

export const PerimeterDiagram = ({
	nodes = DEFAULT_NODES,
	label = 'Your perimeter',
	footer = 'No outbound connections required. Telemetry off with one flag.',
	className,
}: PerimeterDiagramProps) => (
	<div
		className={`rounded-xl border border-dashed border-ink/30 p-6 md:p-8 ${className ?? ''}`}
	>
		<p className='text-sm font-medium text-ink-faint'>{label}</p>
		<div className='mt-5 flex flex-col items-stretch'>
			{nodes.map((node, idx) => (
				<div key={node.title} className='flex flex-col'>
					{idx > 0 && <div className='mx-auto h-5 w-px bg-pine/40' />}
					<div className='rounded-lg border border-ink/10 bg-paper-deep/50 px-4 py-3'>
						<div className='text-sm font-medium text-ink'>{node.title}</div>
						<div className='mt-0.5 text-xs text-ink-soft'>{node.detail}</div>
					</div>
				</div>
			))}
		</div>
		{footer ? (
			<div className='mt-6 flex items-center gap-2 border-t border-ink/10 pt-4 text-xs text-pine'>
				<Ban className='h-3.5 w-3.5 text-pine/60' />
				{footer}
			</div>
		) : null}
	</div>
);
