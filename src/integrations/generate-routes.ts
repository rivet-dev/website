import type { AstroIntegration } from 'astro';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import fg from 'fast-glob';
import { readFile } from 'node:fs/promises';

interface PageData {
	title: string;
	description: string | null;
}

interface FrontmatterData {
	title: string;
	description: string;
}

function filePathToHref(filePath: string): string {
	return '/' + filePath
		.replace(/src\/content\//, '')
		.replace(/\/index\.mdx$/, '')
		.replace(/\.mdx$/, '')
		.replace(/\/page$/, '');
}

function extractFrontmatterData(content: string): FrontmatterData {
	const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
	const frontmatter = frontmatterMatch?.[1] ?? '';
	const titleMatch = frontmatter.match(/^title:\s*(.+)$/m);
	const descMatch = frontmatter.match(/^description:\s*(.+)$/m);

	return {
		title: titleMatch ? titleMatch[1].trim().replace(/^"|"$/g, '') : '',
		description: descMatch ? descMatch[1].trim().replace(/^"|"$/g, '') : '',
	};
}

export function generateRoutes(): AstroIntegration {
	return {
		name: 'generate-routes',
		hooks: {
			'astro:config:setup': async ({ logger }) => {
				const rootDir = process.cwd();
				const pages: Record<string, PageData> = {};

				logger.info('Generating routes.json...');

				const mdxFiles = await fg(['src/content/**/*.mdx'], { cwd: rootDir });
				for (const file of mdxFiles) {
					const filePath = path.join(rootDir, file);
					const content = await readFile(filePath, 'utf-8');
					const { title, description } = extractFrontmatterData(content);

					if (!title) {
						logger.warn(`Missing title in ${file}`);
					}

					const href = filePathToHref(file);
					pages[href] = {
						title: title || 'Untitled',
						description: description || '',
					};
				}

				// Ensure generated directory exists
				const generatedDir = path.join(rootDir, 'src/generated');
				if (!existsSync(generatedDir)) {
					await mkdir(generatedDir, { recursive: true });
				}

				// Write routes.json
				const outputPath = path.join(generatedDir, 'routes.json');
				await writeFile(
					outputPath,
					JSON.stringify({ pages }, null, 2),
					'utf-8'
				);

				logger.info(`Generated ${Object.keys(pages).length} route entries`);
			},
		},
	};
}

export default generateRoutes;
