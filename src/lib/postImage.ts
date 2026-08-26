import type { CollectionEntry } from 'astro:content';

// Hero images live in R2 under a fixed convention keyed by the post slug, so the
// URL is derived from the slug instead of being written out in frontmatter. See
// the asset conventions in the root CLAUDE.md.
const ASSETS_BASE = 'https://assets.rivet.dev';

// Most hero images are authored at a fixed 2:1 ratio. These defaults keep the
// build hermetic; exceptional sources can declare their intrinsic dimensions in
// frontmatter. The values feed social metadata and responsive page rendering.
export const HERO_IMAGE_WIDTH = 2048;
export const HERO_IMAGE_HEIGHT = 1024;

export interface PostImage {
	src: string;
	width: number;
	height: number;
	format: string;
}

export type PostImageConfig =
	| boolean
	| {
			file?: string;
			format?: string;
			width?: number;
			height?: number;
	  };

function formatFromFile(file: string): string | undefined {
	const path = file.split(/[?#]/, 1)[0];
	return path.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase();
}

// Resolve a post's hero image from its `image` frontmatter flag. The presence of
// the flag means the post has a hero image; the file is always named
// `image.{format}` under the post's slug. Returns null when the post has no hero.
export function getPostImage(entry: CollectionEntry<'posts'>): PostImage | null {
	const config = entry.data.image as PostImageConfig | undefined;
	if (!config) return null;

	const slug = entry.id.replace(/\/page$/, '');
	const configuredFile = typeof config === 'object' ? config.file : undefined;
	const format = (
		typeof config === 'object' && config.format
			? config.format
			: configuredFile
				? formatFromFile(configuredFile)
				: undefined
	)?.toLowerCase() ?? 'png';
	const file = typeof config === 'object' && config.file ? config.file : `image.${format}`;
	const width = typeof config === 'object' ? config.width : undefined;
	const height = typeof config === 'object' ? config.height : undefined;

	if ((width === undefined) !== (height === undefined)) {
		throw new Error(`Post image ${entry.id} must define width and height together`);
	}

	return {
		src: `${ASSETS_BASE}/website/blog/${slug}/${file}`,
		width: width ?? HERO_IMAGE_WIDTH,
		height: height ?? HERO_IMAGE_HEIGHT,
		format,
	};
}
