import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchOne, USER_AGENT } from "./github-fetcher";

const ORIG_ENV = process.env.GITHUB_TOKEN;

beforeEach(() => {
  process.env.GITHUB_TOKEN = "test-token";
});

afterEach(() => {
  process.env.GITHUB_TOKEN = ORIG_ENV;
  vi.restoreAllMocks();
});

describe("fetchOne", () => {
  it("returns parsed VentureMetrics on 200 OK", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          stargazers_count: 42,
          pushed_at: "2026-04-01T12:00:00Z",
        }),
        { status: 200 },
      ),
    );

    const result = await fetchOne("adam-badar", "test-repo");

    expect(result.stars).toBe(42);
    expect(result.lastPushedAt).toBe("2026-04-01T12:00:00Z");
    expect(result.fetchedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("sends required Bearer auth and User-Agent headers", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await fetchOne("adam-badar", "test-repo");

    const call = fetchSpy.mock.calls[0];
    expect(call?.[0]).toBe("https://api.github.com/repos/adam-badar/test-repo");
    const headers = (call?.[1]?.headers ?? {}) as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer test-token");
    expect(headers["User-Agent"]).toBe(USER_AGENT);
    expect(headers.Accept).toBe("application/vnd.github+json");
  });

  it("throws github_token_missing when env var absent", async () => {
    delete process.env.GITHUB_TOKEN;
    await expect(fetchOne("a", "b")).rejects.toThrow("github_token_missing");
  });

  it("throws github_401 on invalid token", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("", { status: 401 }),
    );
    await expect(fetchOne("a", "b")).rejects.toThrow("github_401");
  });

  it("throws github_403 on rate limit", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("", { status: 403 }),
    );
    await expect(fetchOne("a", "b")).rejects.toThrow("github_403");
  });

  it("throws github_429 on secondary rate limit", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("", { status: 429 }),
    );
    await expect(fetchOne("a", "b")).rejects.toThrow("github_429");
  });

  it("throws github_404 for missing repo", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("", { status: 404 }),
    );
    await expect(fetchOne("a", "b")).rejects.toThrow("github_404");
  });

  it("propagates network errors", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network"));
    await expect(fetchOne("a", "b")).rejects.toThrow("network");
  });

  it("error messages do not leak token or response body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("very-secret-token-leak", { status: 403 }),
    );
    try {
      await fetchOne("a", "b");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      expect(msg).toBe("github_403");
      expect(msg).not.toContain("test-token");
      expect(msg).not.toContain("very-secret-token-leak");
    }
  });

  it("defaults stars to 0 when stargazers_count missing", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ pushed_at: "2026-04-01T12:00:00Z" }), { status: 200 }),
    );
    const result = await fetchOne("a", "b");
    expect(result.stars).toBe(0);
  });
});

describe("Promise.allSettled snapshot pattern", () => {
  it("partial success: 3 fulfilled + 1 rejected yields independent per-card states", async () => {
    let callCount = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
      callCount += 1;
      if (callCount === 2) return new Response("", { status: 403 });
      return new Response(
        JSON.stringify({ stargazers_count: callCount, pushed_at: "2026-04-01T12:00:00Z" }),
        { status: 200 },
      );
    });

    const targets = [
      { owner: "a", repo: "1" },
      { owner: "a", repo: "2" },
      { owner: "a", repo: "3" },
      { owner: "a", repo: "4" },
    ];
    const results = await Promise.allSettled(
      targets.map((t) => fetchOne(t.owner, t.repo)),
    );

    expect(results.map((r) => r.status)).toEqual([
      "fulfilled",
      "rejected",
      "fulfilled",
      "fulfilled",
    ]);
    if (results[1].status === "rejected") {
      expect((results[1].reason as Error).message).toBe("github_403");
    }
  });
});
