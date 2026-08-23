import { Check, Copy } from 'lucide-react';
import {
	CARD_TITLE_CLASS,
	PRIMARY_INK_BUTTON_CLASS,
	PRODUCT_HERO_SECONDARY_BUTTON_CLASS,
} from './typography';

// Shared deploy-option kit: the card, title, button pair, and terminal command
// block used wherever a page offers the "deploy it yourself vs Rivet Cloud"
// choice (home HostingSection, agentOS deploy section). One source so the two
// renditions cannot drift.

// Compact terminal command block, matching the hero copy-command chip: light
// porcelain fill with a hairline border, monospace, and an absolute copy
// button. Commands stay on one line and scroll horizontally rather than wrap.
export const DEPLOY_COMMAND_BLOCK_CLASS =
	'relative rounded-xl border border-ink/15 bg-white/55 p-3 pr-11 font-mono text-[11px] leading-relaxed text-ink-soft';

export const DEPLOY_CARD_CLASS =
	'relative flex h-full flex-col rounded-xl border border-ink/10 bg-white/55 p-6 md:p-8';
export const DEPLOY_CARD_TITLE_CLASS = CARD_TITLE_CLASS;
export const DEPLOY_BUTTON_BASE = 'w-full';
export const DEPLOY_GHOST_BUTTON_CLASS = `${PRODUCT_HERO_SECONDARY_BUTTON_CLASS} !w-full no-underline`;
export const DEPLOY_WHITE_BUTTON_CLASS = `${PRIMARY_INK_BUTTON_CLASS} !w-full no-underline`;

// Terminal command block. The entire server-rendered surface is the copy
// target; BaseLayout's delegated code-copy listener provides the interaction
// without hydrating every deployment section.
export const TerminalCommand = ({ command }: { command: string }) => {
	return (
		<button
			type='button'
			data-copy-code
			aria-label={`Copy ${command}`}
			className={`${DEPLOY_COMMAND_BLOCK_CLASS} group block w-full cursor-pointer text-left transition-colors motion-reduce:transition-none hover:border-ink/30 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine/60 focus-visible:ring-offset-2 focus-visible:ring-offset-paper`}
		>
			<span className='scrollbar-hide block overflow-x-auto'>
				<code className='code whitespace-nowrap'>{command}</code>
			</span>
			<span className='pointer-events-none absolute right-1.5 top-1.5 rounded p-1.5 text-ink-faint transition-colors group-hover:text-ink'>
				<Copy data-copy-icon='copy' className='h-4 w-4' aria-hidden='true' />
				<Check data-copy-icon='check' className='hidden h-4 w-4 text-pine' aria-hidden='true' />
			</span>
		</button>
	);
};
