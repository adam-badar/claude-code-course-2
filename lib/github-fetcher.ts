// Pure fetch logic separated from the cached/server-only wrapper so it can be unit-tested.

export type VentureMetrics = {
  stars: number;
  lastPushedAt: string;
  fetchedAt: string;
};

export const USER_AGENT = "claude-code-course-2-portfolio";

export async function fetchOne(owner: string, repo: string): Promise<VentureMetrics> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("github_token_missing");
  }

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": USER_AGENT,
      Accept: "application/vnd.github+json",
    },
  });

  if (!res.ok) {
    throw new Error(`github_${res.status}`);
  }

  const data = (await res.json()) as { stargazers_count?: number; pushed_at?: string };

  return {
    stars: data.stargazers_count ?? 0,
    lastPushedAt: data.pushed_at ?? new Date().toISOString(),
    fetchedAt: new Date().toISOString(),
  };
}
