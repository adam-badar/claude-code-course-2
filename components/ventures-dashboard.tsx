import { ventures } from "@/lib/ventures";
import { getVenturesSnapshot, type SettledMetric } from "@/lib/github";
import { VentureCard } from "./venture-card";

export async function VenturesDashboard() {
  const githubTargets = ventures
    .map((v) => v.github)
    .filter((g): g is { owner: string; repo: string } => Boolean(g));

  const snapshots = await getVenturesSnapshot(githubTargets);

  const metricsBySlug = new Map<string, SettledMetric>();
  let i = 0;
  for (const venture of ventures) {
    if (venture.github) {
      const m = snapshots[i++];
      if (m) metricsBySlug.set(venture.slug, m);
    }
  }

  return (
    <section id="what" className="border-t border-border py-20">
      <div className="container mx-auto max-w-[1100px] px-6">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-accent">
          What I&apos;m building
        </p>
        <h2 className="mb-14 text-4xl font-bold tracking-[-0.02em]">
          Four ventures, one operator.
        </h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {ventures.map((venture, idx) => (
            <VentureCard
              key={venture.slug}
              venture={venture}
              metric={metricsBySlug.get(venture.slug) ?? null}
              index={idx}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
