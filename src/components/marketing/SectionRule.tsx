// Blueprint boundary between top-level page sections: a full-bleed hairline
// with registration crosses where it meets the standard rail's vertical
// guides (see .site-rule in main.css). Zero-height, so it adds no rhythm of
// its own — place one between each pair of adjacent sections, never inside
// one. Hook-free so .astro pages render it with no client directive.
export const SectionRule = () => (
	<div aria-hidden='true' className='site-rule'>
		<span className='site-rule-seg site-rule-seg-left' />
		<span className='site-rule-seg site-rule-seg-mid' />
		<span className='site-rule-seg site-rule-seg-right' />
		<span className='site-rule-cross site-rule-cross-left' />
		<span className='site-rule-cross site-rule-cross-right' />
		<span className='site-rule-dash site-rule-dash-left site-rule-dash-up' />
		<span className='site-rule-dash site-rule-dash-left site-rule-dash-down' />
		<span className='site-rule-dash site-rule-dash-right site-rule-dash-up' />
		<span className='site-rule-dash site-rule-dash-right site-rule-dash-down' />
	</div>
);
