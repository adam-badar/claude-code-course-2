---
title: Portfolio v2 — Founder Dashboard
slug: portfolio-v2
status: approved
created: 2026-04-30
revised: 2026-04-30
approved_at: 2026-04-30
plan_gate_revision: 04ec1c6
plan_hash: 1a769df8d8ad2eeafe3cd9554b4187daa47cfad3a85999c4fb5ba48d1f2cf2dd
plan_revision: 3
teammate_plan_review_gate: passed
codex_extra_high_plan_gate: passed
codex_passes: 5
size_budget_override: epic-level (rationale in plan)
---

# Portfolio v2 — Founder Dashboard

## Context

Adam Badar's personal portfolio v1 ships at https://claude-code-course-2.vercel.app — single static HTML, brown-yellow theme, hero, three "what I do" cards, calendar-snapshot widget, contact form. v1 is competent but generic-founder-template.

Independent research from a best-practices and an external-frontier agent both converged on the same diagnosis: the calendar widget is the genuine differentiator, the rest dilutes its signal, and 2026 founder portfolios diverge from designer portfolios by replacing static prose with **live operational dashboards** (revenue, GitHub commits, customer count, last shipped). References: leerob.io, marc.dev, julian.com.

v2 replaces the "what I do" cards with a live ventures dashboard while preserving the calendar widget as the single signature interaction, fixes the body-text contrast accessibility floor, and adds a `/now`-style section for ongoing inbound signal.

## Plan revision history

- **v1 (initial)**: 5-PR ladder, Editorial New display serif, cmd+k palette, `/now` MDX route, JSON-LD Person.
- **v2 (this revision)**: Aggressive simplification per code-simplicity review consensus. Reduced to 2 PRs. Dropped Editorial New (using Geist), dropped cmd+k palette, dropped `/now` as separate route (now a homepage section). Kept JSON-LD Person. Addressed all convergent reviewer findings inline.

## Goals

1. Differentiate from generic founder templates via a live ventures dashboard pulling real metrics.
2. Hit table-stakes performance and accessibility floors (Lighthouse 95+ Perf, 100 A11y/BP/SEO; CWV LCP < 1.5s, INP < 200ms, CLS < 0.1).
3. Establish a lightweight content workflow for ongoing "now" updates (single homepage section, monthly cadence).
4. Preserve the brown-yellow theme and the calendar widget as the visual signature.
5. Ship within ~10-15 hours of focused work.

## Non-goals

- WebGL hero scenes, Three.js, particle backgrounds, motion-soaked transitions. One signature interaction max (the calendar).
- Multi-language support, dark/light theme toggle, blog (deferred to a follow-up epic).
- Self-hosted analytics; Plausible can be added later as a follow-up.
- Cmd+K command palette (dropped per simplicity review).
- Editorial display serif and any custom font (dropped per simplicity + license reviews; using Geist from Vercel CDN).
- A separate `/now` route or MDX pipeline (dropped; folded into homepage section).
- Stripe revenue integration; private revenue stays private.

## Architecture decision

**Chosen: Next.js 16 App Router + TypeScript + Tailwind v4 + ShadCN + Vercel.**

Rationale:

| Option | Verdict | Reason |
|---|---|---|
| (a) Astro + server endpoints | Strong, but rejected | Marginally better for content; loses Next.js as Adam's CLAUDE.md default; second framework to maintain across his projects. |
| **(b) Next.js App Router** | **Chosen** | Adam's CLAUDE.md default. Vercel-native ISR. Server components solve dashboard data fetching cleanly. ShadCN integration tight. Prior scaffold work on `feat/prisma-hero` (same repo, archived branch) is reusable. |
| (c) Static HTML + nightly GitHub Action rebuild | Rejected | Adds a CI-cron-frozen-JSON layer that's brittle and limits future feature scope. |

**Vendor lock-in note:** ISR's `revalidate` export and on-demand `revalidatePath` are Next.js conventions, but the runtime caching semantics are only guaranteed on Vercel. Moving off Vercel later means replacing the cache layer with explicit caching (Redis or in-process). Acceptable trade-off for a personal portfolio.

**Data fetching pattern:** wrap the parsed dashboard snapshot in `unstable_cache` — **not** rely on inner `fetch().next.revalidate` for derived state. Why: Next.js caches the raw `fetch` response, not arbitrary wrapper state like `{ value, fetchedAt }`. Caching the parsed result (stars, lastPushedAt, fetchedAt) at the snapshot layer is the correct primitive. Pattern:

```ts
// lib/github.ts
import "server-only";                                     // hard fail if imported client-side
import { unstable_cache } from "next/cache";

type VentureMetrics = {
  stars: number;
  lastPushedAt: string;     // ISO from `pushed_at` field on GET /repos/{owner}/{repo}
  fetchedAt: string;        // ISO at fetch time, used for "cached as of"
};

async function fetchOne(owner: string, repo: string): Promise<VentureMetrics> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "User-Agent": "claude-code-course-2-portfolio",
      Accept: "application/vnd.github+json",
    },
    // no next.revalidate here — unstable_cache controls the cache window
  });
  if (!res.ok) throw new Error(`github_${res.status}`);   // sanitized, no body/headers leaked
  const data = await res.json();
  return {
    stars: data.stargazers_count ?? 0,
    lastPushedAt: data.pushed_at,
    fetchedAt: new Date().toISOString(),
  };
}

export const getVentureMetrics = unstable_cache(
  fetchOne,
  ["venture-metrics-v1"],     // cache key namespace; bump on contract change
  { revalidate: 60, tags: ["ventures"] },
);
```

**Snapshot contract:** the dashboard renderer calls `Promise.allSettled` over the 4 `getVentureMetrics(...)` calls. Each card has independent state: `fulfilled` → live or cached values + `fetchedAt`; `rejected` → `null` → render "data unavailable" badge. Mixed-state results are allowed (per-card independence is the explicit choice; an atomic dashboard would fail-loud on any single venture's outage).

**`User-Agent` is required** by GitHub. Vercel egress IPs are shared across customers, so unauth requests hit the 60/hr limit immediately — `GITHUB_TOKEN` must be set in Vercel env before PR A deploys.

**`server-only`** import on `lib/github.ts` enforces that the token-handling code can never end up in a client bundle (build fails if it does). Errors thrown from `fetchOne` never include the response body, headers, or token. Card components receive `VentureMetrics | null`, never the underlying response object.

## Epic PR Ladder

Compressed from a 5-PR ladder per code-simplicity review consensus ("scaffold-only PRs have no independent value"). The default budget caps (`max_net_loc_per_pr: 600`, `max_files_per_pr: 20`) are **explicitly overridden for this epic** because Vercel's preview deployments give per-commit visual review without needing PR splits, and Adam's hour budget is the binding constraint, not review granularity.

| # | PR | Objective + acceptance | Test plan | Est. net LOC | Est. files | Rollback |
|---|---|---|---|---|---|---|
| A | `feat: portfolio v2 (Next.js, ventures dashboard, a11y)` | (1) Scaffold Next.js 16 + ShadCN + Tailwind v4 (reuse pattern from `feat/prisma-hero`). (2) Port v1 visual: hero, calendar widget (server-rendered markup; only the slot-click handler that prefills mailto subject runs in a thin `'use client'` boundary), schedule snapshot, thin contact section with mailto button. **Calendar must look identical to v1 (no perceptible diff at 1x zoom) and slot-click must prefill `mailto:adam@bavlio.com?subject=...` matching v1 behavior.** (3) Replace 3 "what I do" cards with 4 ventures cards (Maple Bit, Bavlio, SapienEx, BaviMail) using `unstable_cache`-wrapped `fetch` per architecture section. Each card renders relative-time pill from `fetchedAt` on success, "data unavailable" badge on rejection. (4) A11y floor: body contrast 4.5:1 (verify post-Geist swap), `prefers-reduced-motion`, visible focus rings. (5) GEO floor: JSON-LD Person + `sameAs` array, OG tags, Twitter card, sitemap.xml, robots.txt. (6) Hero CTA = mailto button. (7) Production cutover: merge to `main`, Vercel git integration auto-builds and auto-promotes the production domain. Manual `curl` smoke test within 30s of "ready". v1 preserved at `/index-v1.html`. | gstack browse on Vercel preview: load `/`, screenshot, verify all 4 ventures cards present with live data; force `GITHUB_TOKEN=invalid`, reload, verify graceful fallback; Lighthouse 95+ Perf / 100 A11y / 100 BP / 100 SEO; manual visual review of calendar widget vs v1; mocked-fetch unit tests for failure matrix per Verification section. Post-merge smoke: `curl -sS https://claude-code-course-2.vercel.app/ \| grep -c "data-venture-card"` returns `4`. | ~700 (mostly scaffold + dashboard) | ~25 | `vercel rollback` (one step back to v1 commit `04ec1c6`) if first thing broken. If broken state is reached after subsequent deploys, `git revert <broken-merge-commit>` and let Vercel rebuild. See "Rollback" section for caveats. |
| B | `feat: 'currently' homepage section` | Add a `<section id="now">` to home page with 3-5 bullets about active work / context. Manually edited via direct file change. **Optional / deferrable** if PR A consumes the full hour budget. Acceptance: section renders below ventures dashboard, content editable in a single-file commit. | gstack browse: load `/`, verify section visible at correct anchor; verify monthly-edit workflow with a test commit. | ~50 | ~1 | `git revert`. Section is purely additive. |

**Total**: 2 PRs, ~750 net LOC, ~26 files. PR A exceeds default per-PR LOC budget (~700 vs 600); explicitly accepted given preview-driven review and consolidation rationale.

## Flow Permutations & Edge Cases

### Initial load (cold cache, no edge cache)
- HTML, CSS, fonts, JSON-LD, OG image must arrive in <1.5s LCP on 4G mobile.
- Calendar widget renders fully server-side (markup is identical to v1 at first paint); a thin client-component boundary attaches the slot-click handler that prefills the mailto subject. No skeleton-then-hydrate flash.
- Verification: Lighthouse on Vercel preview before swap.

### Refresh / rehydrate
- Server component; refresh re-runs ISR cache or revalidates if >60s elapsed.
- Calendar widget state resets to current week (acceptable, matches v1 behavior).
- Verification: gstack `$B reload` — verify ventures cards re-render with fresh-or-cached data.

### Production swap (PR A)
- Vercel project is connected to the GitHub repo via the standard git integration. **A merge to `main` triggers an auto-build and auto-promotion to production** for the connected production domain. There is no manual `vercel alias` step in this flow.
- Procedure:
  1. Open PR A from `feat/portfolio-v2` to `main`. Vercel builds a preview on every push.
  2. PM runs Lighthouse + gstack browse on the preview URL. Smoke test passes (all four cards render with live data, fallback path verified by re-deploying with `GITHUB_TOKEN=invalid` in preview env).
  3. Merge to `main`. Vercel auto-builds and auto-promotes.
  4. Within 30s of "ready" event, run `curl -sS https://claude-code-course-2.vercel.app/ | grep -c "data-venture-card"` — expect `4`. This warms the `unstable_cache` entries and confirms HTML contains all four cards.
  5. If the smoke test fails, recover via "Rollback" section below.
- **Cold-cache window:** between auto-promotion and first warming `curl`, the first real user request triggers the `unstable_cache` fill. That request hits GitHub API live. If GitHub is rate-limited or down, the user sees the "data unavailable" path; cache stays empty until next attempt. Acceptable since fallback is graceful.

### Error + retry path
- GitHub API rate-limit hit (auth: 5000/hr): per-card fallback to last successful cached values + relative-time stale badge.
- GitHub API down or token expired: same fallback. Card shows "data unavailable" badge if no prior cache.
- Calendar API outage: schedule section snapshots data at build time (preserves v1 behavior); no live runtime dependency.

### Stale-data timestamp source
- Each `unstable_cache` entry stores `{ stars, lastPushedAt, fetchedAt }` per venture. The `fetchedAt` field is set at fetch time inside `fetchOne` and survives ISR purge until the cache entry is evicted (60s revalidate window).
- Card render reads `fetchedAt` and shows relative-time pill ("updated 14m ago") below the metrics.
- On a fetch rejection: `Promise.allSettled` yields `rejected` for that card → render "data unavailable" badge with no timestamp. No fake timestamps are ever rendered.
- On revalidation while serving stale: Next's default behavior is stale-while-revalidate (the prior cached value renders while a background fetch updates the cache). The pill timestamp reflects when the prior cached value was fetched, which is what we want.

### Session / auth
- N/A: portfolio is unauthenticated.

### Mobile vs desktop responsive
- Single breakpoint at 720px (continued from v1). Cards stack on mobile.
- Verification: gstack browse at 360, 768, 1280, 1920.

### prefers-reduced-motion
- All transitions on cards, calendar interactions respect the media query.
- Verification: gstack with `prefers-reduced-motion: reduce`; verify no animation on hover/focus.

### URL continuity (gap from review pass 1)
- v1 anchor links: `#what`, `#contact`, `#schedule`. Post-swap, `#what` becomes the ventures dashboard section (semantic shift acceptable; no inbound links cited yet); `#contact` and `#schedule` preserved.
- v1 itself accessible at `/index-v1.html` for any inbound bookmarks of the static page.

### Required tests (mapped from review pass 1, integrated into PR A)
- Cold-swap smoke: `curl https://claude-code-course-2.vercel.app/` ≤30s after Vercel reports the production deployment as "ready" post-merge, expect 200 + all 4 cards in HTML.
- Stale badge render: `GITHUB_TOKEN=invalid` in preview, expect graceful fallback with valid timestamp or "data unavailable".
- `#contact` anchor: navigate to `https://claude-code-course-2.vercel.app/#contact`, expect scroll to mailto-only contact section.
- Calendar widget hydration: load page, verify calendar interactivity works (click slot chips fill the mailto subject).
- Lighthouse 95+/100/100/100 on Vercel preview; on production after swap.

## Verification strategy summary

**CI gates (automated, required to pass before merge):**
- `npm run build` — production build succeeds (catches type errors, ESM/CJS issues, server-only violations)
- `npx tsc --noEmit` — strict TypeScript pass
- `npm run lint` — ESLint pass
- These run on Vercel's PR preview by default; explicitly required as merge-blocking.

**Unit tests (PR A, mocked-fetch deterministic):**
- Vitest + `vi.fn()`-mocked `fetch`. Test cases for `fetchOne` / `getVentureMetrics`:
  - 200 OK with full payload → returns parsed `VentureMetrics`
  - 403 (rate-limited) → throws `github_403`
  - 429 (secondary rate-limit) → throws `github_429`
  - 401 (invalid token) → throws `github_401`
  - Network error → throws
  - Cold cache + API failure → caller's `Promise.allSettled` records `rejected`
  - Partial success: 3 ventures fulfilled + 1 rejected → render contract holds (3 cards live, 1 unavailable)

**Integration / e2e (PR A, real GitHub):**
- Vercel preview deployment with real `GITHUB_TOKEN` set.
- gstack browse: load `/`, screenshot, verify all 4 ventures cards present with live data; reload to verify cache served; redeploy preview with `GITHUB_TOKEN=invalid`, verify graceful "data unavailable" path; viewport sweep at 360 / 768 / 1280 / 1920; reduced-motion simulated.
- Lighthouse on preview URL; floor 95 Perf / 100 A11y / 100 BP / 100 SEO.
- **Smoke test post-merge:** `curl -sS https://claude-code-course-2.vercel.app/ | grep -c "data-venture-card"` returns `4`.
- Reports (Lighthouse JSON, gstack screenshots) saved to `docs/reviews/frontend/` per PR.

**No "test-later" PR** — every PR includes its test plan inline.

## Rollout

- All work on a single branch `feat/portfolio-v2` (or `feat/portfolio-v2-pr-a` and `feat/portfolio-v2-pr-b` if both PRs are tracked).
- PR A merges to main → triggers Vercel production deployment → manually warm cache via `curl` → smoke test → if good, done. If broken, `vercel rollback`.
- PR B is deferrable. Can ship a week or month later without blocking v2 launch.

## Rollback

- **PR A** (immediately after promotion, broken state):
  - **Hobby tier limitation**: `vercel rollback` only promotes the *immediately previous* production deployment. It does not let you pick from a list of 50.
  - First-resort recovery: `vercel rollback` (returns prod to commit `04ec1c6`, the v1 static HTML).
  - If a subsequent broken deploy occurs after PR A is already in prod (e.g., a follow-up commit goes bad), `vercel rollback` only goes back one step. Recovery in that case: `git revert <broken-merge-commit>` and push to `main` → Vercel auto-builds the revert commit and supersedes the broken deploy.
  - **Recovery time is best-effort, not SLA.** `vercel rollback` is near-instant. The `git revert` path depends on a successful Vercel build; if a build fails (npm registry outage, Vercel platform issue, transient dependency error), the broken state persists until the build clears. For a personal portfolio this is acceptable. There is no build-independent fallback configured (would require keeping a hot static-HTML mirror; out of scope for v2).
- **PR B**: `git revert`; section is additive, no rollback infra needed.

## Dependencies

- **GitHub fine-grained PAT**: stored in Vercel env as `GITHUB_TOKEN`. **Pre-PR-A blocker.**
  - Token type: **fine-grained PAT**, repository access scoped to the four ventures' public repos (or "All repositories" if simpler), with permissions `Repository permissions → Metadata: Read-only`. That single permission is sufficient for `GET /repos/{owner}/{repo}` (returns stars, pushed_at, etc.). No `Contents` or other permissions needed.
  - **Note: `read:public_repo` (mentioned in earlier draft) is a *classic-PAT* scope and is incorrect for fine-grained. Fine-grained tokens use the `Metadata: Read` permission noun.**
  - Endpoints used: `GET /repos/{owner}/{repo}` only. No commits or trees endpoints in v2.
  - Fine-grained PATs default to 90-day expiry — schedule an 80-day `/loop` reminder, or use a classic PAT (`public_repo` scope) if Adam prefers no rotation. Trade-off: classic PATs have broader scope and no auto-expiry; fine-grained is the more secure default.
- **Geist font**: shipped via `next/font/google` in PR A. Zero-cost LCP, no license question.
- **No new infra**: same Vercel Hobby tier project, same domain.

## Resolved decision questions

1. **GITHUB_TOKEN type**: fine-grained PAT with `Repository permissions → Metadata: Read-only`, scoped to the four ventures' public repos (or "All repositories" if simpler). `read:public_repo` is the *classic-PAT* scope and is not used here. Adam to issue at github.com/settings/personal-access-tokens before PR A deploys. See Dependencies section for endpoint detail.
2. **Maple Bit "$150k+ net since 2021"**: approved for public display (already stated publicly on Reddit per voice-examples).
3. **`feat/prisma-hero` reuse**: same repo, archived but accessible. PR A cherry-picks the Next.js + ShadCN scaffold approach from that branch; doesn't reuse the PrismaHero component itself.
4. **Editorial New**: dropped. Geist via `next/font` for both display and body.
5. **Cmd+K palette**: dropped. Hero mailto button + thin contact section is the contact path.
6. **/now route**: dropped as a route. Folded into homepage as `<section id="now">` (PR B).
7. **JSON-LD Person**: kept in PR A (10-min cost, GEO floor).

## Open questions for PM (none blocking)

None. All architecture and scope decisions resolved by user input on review pass 1.

## Revalidation conditions

Re-run external-frontier research before:
- Changing the framework decision (Next.js → Astro or otherwise).
- Adding a substantial new feature category (3D hero, blog, multi-page case studies).
- Any change >12 months from this plan's date (2026-04-30).

## Estimated total effort

| PR | Hours |
|---|---|
| PR A | 8 |
| PR B (deferrable) | 1 |
| **Total committed** | **8** |
| **Stretch (with PR B)** | **9** |

## Non-blocker triage table

| Finding | Source | Disposition | Rationale |
|---|---|---|---|
| Vendor lock-in to Vercel for ISR semantics | architecture | accepted (documented) | Acceptable for personal portfolio; documented in architecture decision section. |
| `cmdk` peer-dep mismatches with React 19 | learnings | N/A | Cmd+K palette dropped. |
| Editorial serif body-text contrast trap | learnings | N/A | Editorial New dropped. |
| Vercel Hobby tier ToS for "commercial activity" | learnings | accepted (low risk) | Personal portfolio promoting solo ventures fits Vercel's documented Hobby use cases. Upgrade to Pro ($20/mo) if needed. |
| Tailwind v4 alpha config quirks | learnings | implement_now | Pin exact versions in `package.json`, follow ShadCN's official v4 templates. PR A acceptance. |
| "Pixel-equivalent" tolerance not defined | learnings | implement_now | Replaced "pixel-equivalent" with "no perceptible diff at 1x zoom" in PR A acceptance. |
| Soak step before production cutover | architecture | implement_now | Vercel preview is the soak; manual visual review by PM before merging PR A is the gate. |
| GITHUB_TOKEN expiry / rotation reminder | architecture | defer (PR B+) | Set a `/loop` 80-day reminder after PR A deploy; not blocking v2 launch. PM signoff: deferred. |
| MDX error boundary for /now | flow | N/A | /now MDX route dropped; PR B is a static homepage section. |
| Cmd+K Escape dismiss | flow | N/A | Palette dropped. |
| Cold-cache swap risk during production cutover | flow | implement_now | Documented as the post-merge smoke test in "Production swap (PR A)" section. |
| `lastFetched` design caches arbitrary state, not Next.js fetch contract | codex xhigh | implement_now | Architecture section now uses `unstable_cache` over the parsed snapshot; `fetchedAt` lives in the snapshot, not the inner fetch. |
| Failure model: stale-while-revalidate + non-OK doesn't throw | codex xhigh | implement_now | `fetchOne` throws on `!res.ok`; `Promise.allSettled` at snapshot layer; per-card mixed states explicit. |
| Production swap order wrong for Vercel git integration | codex xhigh | implement_now | Section rewritten: git-integration auto-promotion, no `vercel alias` step. |
| Rollback story overstated for Hobby tier | codex xhigh | implement_now | Rollback section rewritten with the one-step-back limitation and `git revert` recovery path. |
| GITHUB_TOKEN scope used classic-PAT syntax for fine-grained | codex xhigh | implement_now | Dependencies section, Resolved Decisions section, and PR ladder all corrected to fine-grained PAT with `Metadata: Read`. |
| Cache model choice: `unstable_cache` vs `use cache` directive | codex xhigh decision question | resolved | Choosing `unstable_cache` for v2: stable API, well-documented, function-identity stable across requests. Migration to `use cache` directive is a future option if the cache key narrowing becomes a real maintenance pain. |
| Rollback RTO is best-effort, not SLA | codex xhigh decision question | resolved | Personal portfolio; build-independent fallback (hot static mirror) is explicitly out of scope. Recovery is best-effort. |
| Stale calendar text (skeleton vs server-rendered) | codex xhigh | implement_now | Initial-load section aligned with PR A acceptance: server-rendered markup, thin client-component handler. |
| `lastCommitAt` → `lastPushedAt` rename | codex xhigh | implement_now | Renamed throughout architecture section to reflect actual GitHub field. |
| Mocked-fetch unit tests for cache adapter | codex xhigh | implement_now | Verification section now mandates Vitest unit tests for 200 / 403 / 429 / 401 / network / cold-miss / partial-success. |
| `npm run build` / lint / typecheck as CI gates | codex xhigh | implement_now | Verification section now mandates these as merge-blocking. |
| `server-only` module + sanitized errors | codex xhigh | implement_now | `lib/github.ts` imports `server-only`; errors throw without leaking response details. |
| Calendar approach conflict (skeleton vs pixel-equivalent) | codex xhigh | implement_now | PR A acceptance now specifies server-rendered markup with thin client boundary for the click handler only. |
| LOC override at 700 vs 600 | codex xhigh | accepted | Defensible per simplicity reviewer; scaffold-LOC will be called out in PR description. |
| #contact anchor break post-swap | flow | implement_now | Contact section preserved with mailto-only; anchor still works. |
| GitHub fine-grained vs classic PAT | architecture | resolved | Fine-grained PAT with `Metadata: Read-only` chosen (see Dependencies). Classic PAT is a fallback if Adam wants to skip 90-day rotation. |
| /index-v1.html legacy access | architecture | implement_now | Static fallback at `/index-v1.html` preserves any v1 inbound links. |
