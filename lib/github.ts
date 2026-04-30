import "server-only";
import { unstable_cache } from "next/cache";
import { fetchOne, type VentureMetrics } from "./github-fetcher";

export type { VentureMetrics };

export const getVentureMetrics = unstable_cache(
  fetchOne,
  ["venture-metrics-v1"],
  { revalidate: 60, tags: ["ventures"] },
);

export type SettledMetric =
  | { status: "fulfilled"; value: VentureMetrics }
  | { status: "rejected"; reason: string };

export async function getVenturesSnapshot(
  targets: { owner: string; repo: string }[],
): Promise<SettledMetric[]> {
  const results = await Promise.allSettled(
    targets.map((t) => getVentureMetrics(t.owner, t.repo)),
  );
  return results.map((r) =>
    r.status === "fulfilled"
      ? { status: "fulfilled" as const, value: r.value }
      : {
          status: "rejected" as const,
          reason: r.reason instanceof Error ? r.reason.message : "unknown",
        },
  );
}
