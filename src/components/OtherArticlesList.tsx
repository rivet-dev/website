import { getCollection } from 'astro:content';
import { AUTHORS } from '@/lib/article';
import { SITE_CARD_CLASS } from '@/components/marketing/layout';

interface OtherArticlesListProps {
	currentSlug: string;
}

export const OtherArticlesList = async ({
	currentSlug,
}: OtherArticlesListProps) => {
	const posts = await getCollection('posts');

	// Filter out the current post, unpublished posts, and sort by date
	const otherPosts = posts
		.filter(post => {
			const slug = post.id.replace(/\/page$/, '');
			return slug !== currentSlug && !post.data.unpublished;
		})
		.sort((a, b) => b.data.published.getTime() - a.data.published.getTime());

	const articlesWithTitles = otherPosts.map((post) => {
		const slug = post.id.replace(/\/page$/, '');
		const author = AUTHORS[post.data.author];

		return {
			slug,
			title: post.data.title,
			author,
			date: post.data.published,
		};
	});

	const formatter = new Intl.DateTimeFormat("en", {});

	return (
		<ul className="mt-4 hidden space-y-3 text-sm text-ink-soft xl:block">
			{articlesWithTitles.map((article) => {
				return (
					<li key={article.slug}>
						<a
							href={`/blog/${article.slug}/`}
							className={`${SITE_CARD_CLASS} block transition-colors hover:border-ink/25 hover:text-ink`}
						>
							<p className="text-sm font-medium leading-snug text-ink">
								{article.title}
							</p>
							<div className="mt-2 text-xs text-ink-faint">
								{article.author.name} @{" "}
								<i>
									{formatter.format(article.date)}
								</i>
							</div>
						</a>
					</li>
				);
			})}
		</ul>
	);
};
