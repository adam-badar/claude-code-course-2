# Codex Extra High — Plan Review Evidence

## Plan

- **Path**: `docs/plans/portfolio-v2-plan.md`
- **Final approved hash**: `1a769df8d8ad2eeafe3cd9554b4187daa47cfad3a85999c4fb5ba48d1f2cf2dd`
- **HEAD SHA at review**: `04ec1c671162076f8f3b59e5679ba4cf82ccd967`
- **Reviewer**: `codex-xhigh` MCP server (Codex Extra High mode)
- **Review date**: 2026-04-30
- **Total passes**: 5 (4 FAIL, 1 PASS)
- **Final verdict**: **PASS**

## Pass log

### Pass 1 — FAIL (5 blockers)

Prompt focus: independent technical review after teammate-reviewer pass. Particular attention to GitHub-API-via-fetch + ISR mechanics, failure-mode integrity, swap procedure, token boundary, CI gaps.

Blockers found:
1. `lastFetched` design caches arbitrary state but Next caches the `fetch()` response, not wrapper state. Recommended switching to `unstable_cache` over the parsed snapshot, or deriving timestamps from the GitHub response `Date` header.
2. Failure state under-specified. Time-based revalidation serves stale data while refreshing in background; non-OK GitHub responses don't throw unless app throws. Missing explicit `getVenturesSnapshot()` contract using `Promise.allSettled`, sanitized non-OK throws, cold-miss handling.
3. Production swap procedure used `vercel alias`, which is not the recommended production promotion command for Vercel git-integrated projects.
4. Rollback claim of "50 prior deploys" overstated for Hobby tier; `vercel rollback` only goes back one deployment.
5. GitHub token scope used `read:public_repo` (a classic-PAT scope name) but plan claimed fine-grained PAT.

Non-blockers (4 implement_now, 1 defer): mocked-fetch unit tests, build/lint/typecheck CI gates, server-only module + sanitized errors, calendar widget approach clarity.

### Pass 2 — FAIL (3 blockers, 5 → 3 material reduction)

After targeted edits to architecture section. Codex caught that fixes didn't propagate to all sections.

Blockers found:
1. PR ladder row still referenced `vercel alias` and "50 prior deploys" (stale).
2. Resolved Decisions section + triage table still listed `read:public_repo` (stale).
3. Rollback RTO still claimed "≤2 minutes" SLA-style; `git revert` path is dependent on successful Vercel build, no fallback configured.

Non-blockers: stale "skeleton hydration" calendar text vs server-rendered approach; `lastCommitAt` field name should be `lastPushedAt` to reflect actual GitHub `pushed_at`.

Decision questions: cache model choice (`unstable_cache` vs `use cache` directive); rollback RTO best-effort vs build-independent fallback.

### Pass 3 — FAIL (2 stale contradictions, 3 → 2 material reduction)

After fixing all targeted contradictions and resolving both decision questions.

Blockers found:
1. Verification section still said "5s after alias" (stale post-swap-procedure-rewrite).
2. `lastPushedAt` type comment still said "ISO from GitHub commits endpoint" (stale; should reference repo endpoint's `pushed_at`).

### Pass 4 — FAIL (2 stale fragments, plateau but different blockers)

After fixing the two prior contradictions. Codex found two more stale fragments:

Blockers found:
1. Cache pattern paragraph still listed `(stars, commit count, fetchedAt)` — stale; should be `(stars, lastPushedAt, fetchedAt)`.
2. Triage table row "Cold-cache swap risk during alias promotion" — stale; should be "during production cutover".

### Pass 5 — PASS

After full grep-driven sweep for stale fragments and targeted fixes. Both pass-4 contradictions closed; no new issues introduced.

Verdict: **PASS** (one-line response from Codex).

## Burden control summary

5 passes total. Per workflow rules, blocker count must reduce materially across passes. Trajectory: 5 → 3 → 2 → 2 → 0. Pass 4's plateau at 2 was resolved by switching from targeted edits to a full grep-driven sweep. The architecture and failure-mode design held from pass 2 onward; passes 3-5 only addressed language drift between paragraphs. The plan is now internally consistent.

## Final findings (carried into the plan's non-blocker triage table)

All blockers resolved before approval. Non-blockers from passes 1-2 marked `implement_now` and folded into PR A acceptance criteria.

## Re-review trigger conditions

Per the workflow's "material change" rule, re-run Codex Extra High before:
- Switching cache model from `unstable_cache` to `use cache` directive
- Adding any new fetched data source beyond `GET /repos/{owner}/{repo}`
- Changing the production swap procedure (e.g., adopting Vercel Pro's instant rollback)
- Promoting any deferred non-blocker to in-scope work
