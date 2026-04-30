import { ArrowUpRight } from "lucide-react";
import type { Venture } from "@/lib/ventures";
import type { SettledMetric } from "@/lib/github";

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms) || ms < 0) return "just now";
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function VentureCard({
  venture,
  metric,
  index,
}: {
  venture: Venture;
  metric: SettledMetric | null;
  index: number;
}) {
  const live = metric?.status === "fulfilled" ? metric.value : null;

  return (
    <article
      data-venture-card
      data-slug={venture.slug}
      className="group relative flex flex-col rounded-xl border border-border bg-surface p-7 transition-colors hover:border-accent"
    >
      <div className="mb-4 flex items-center justify-between text-sm tabular-nums text-muted">
        <span>{String(index + 1).padStart(2, "0")}</span>
        {live ? (
          <span title={`Updated ${relativeTime(live.fetchedAt)}`}>
            updated {relativeTime(live.fetchedAt)}
          </span>
        ) : metric?.status === "rejected" ? (
          <span>data unavailable</span>
        ) : null}
      </div>

      <h3 className="mb-3 text-xl font-semibold tracking-[-0.01em]">
        <a
          href={venture.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {venture.name}
          <ArrowUpRight
            aria-hidden
            className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100"
          />
        </a>
      </h3>

      <p className="mb-5 text-sm text-muted">{venture.positioning}</p>

      <dl className="mt-auto grid grid-cols-2 gap-x-4 gap-y-3">
        {live ? (
          <>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Stars</dt>
              <dd className="mt-1 font-semibold tabular-nums">{live.stars}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Last push</dt>
              <dd className="mt-1 font-semibold tabular-nums">
                {relativeTime(live.lastPushedAt)}
              </dd>
            </div>
          </>
        ) : (
          venture.staticMetrics.map((m) => (
            <div key={m.label}>
              <dt className="text-xs uppercase tracking-wide text-muted">{m.label}</dt>
              <dd className="mt-1 font-semibold tabular-nums">{m.value}</dd>
            </div>
          ))
        )}
      </dl>
    </article>
  );
}
