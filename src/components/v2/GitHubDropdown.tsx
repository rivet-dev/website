"use client";
import { cn } from "@rivet-gg/components";
import { Icon, faGithub } from "@rivet-gg/icons";
import { useEffect, useState } from "react";

type GitHubDropdownProps = React.HTMLAttributes<HTMLAnchorElement>;

interface RepoData {
	stars: number;
	loading: boolean;
}

function formatNumber(num: number): string {
	if (num >= 1000) {
		return `${(num / 1000).toFixed(1)}k`;
	}
	return num.toString();
}

// Sums the stars of every non-fork repo in the rivet-dev org, so renames,
// deletions, and new repos are tracked automatically. A hardcoded name list
// went stale twice before: the deleted `rivet-dev/antiox` silently contributed
// 0 stars, and `rivet-dev/secure-exec`'s rename to `dynamic-apps` made the
// redirect double-count that repo's stars. `type=sources` excludes forks, and
// one page holds every source repo today; the loop guards against the org
// someday growing past 100.
const ORG_REPO_LIST_URL = "https://api.github.com/orgs/rivet-dev/repos";

export function GitHubDropdown({ className, ...props }: GitHubDropdownProps) {
	const [totalStars, setTotalStars] = useState<RepoData>({
		stars: 0,
		loading: true,
	});

	useEffect(() => {
		const cacheKey = "github-stars-aggregate";
		const cachedData = sessionStorage.getItem(cacheKey);

		if (cachedData) {
			const { stars: cachedStars, timestamp } = JSON.parse(cachedData);
			if (Date.now() - timestamp < 5 * 60 * 1000) {
				setTotalStars({ stars: cachedStars, loading: false });
				return;
			}
		}

		// A failed or partial fetch must not render (or cache) a shrunken
		// total, so only a complete walk of the repo list updates state; on
		// failure the loading label stays up.
		let cancelled = false;
		(async () => {
			try {
				let total = 0;
				for (let page = 1; page <= 3; page++) {
					const response = await fetch(
						`${ORG_REPO_LIST_URL}?per_page=100&type=sources&page=${page}`,
					);
					if (!response.ok) throw new Error("Failed to fetch");
					const repos: Array<{ stargazers_count?: number }> =
						await response.json();
					if (!Array.isArray(repos) || repos.length === 0) break;
					for (const repo of repos) total += repo.stargazers_count ?? 0;
					if (repos.length < 100) break;
				}
				if (cancelled) return;
				setTotalStars({ stars: total, loading: false });
				sessionStorage.setItem(
					cacheKey,
					JSON.stringify({ stars: total, timestamp: Date.now() }),
				);
			} catch (err) {
				if (!cancelled) console.error("Failed to fetch stars", err);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<a
			href="https://github.com/rivet-dev"
			target="_blank"
			rel="noreferrer"
			className={cn(
				"flex items-center gap-2 transition-colors",
				className?.includes("text-white")
					? "text-white/90 hover:text-white"
					: "text-muted-foreground hover:text-foreground",
				className,
			)}
			{...props}
		>
			<Icon icon={faGithub} />
			<span className="hidden md:inline">
				{totalStars.loading ? "GitHub" : `${formatNumber(totalStars.stars)} stars`}
			</span>
		</a>
	);
}
