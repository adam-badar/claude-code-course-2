# Portfolio v2 — Execution Tracker

**Plan**: [portfolio-v2-plan.md](./portfolio-v2-plan.md) (status: approved, hash `1a769df8`)
**Started**: pending
**Target**: ~9 hours (PR A: 8h, PR B optional: 1h)

## PR ladder status

| # | PR | Branch | Status | PR URL | Lighthouse | gstack evidence | Merged at |
|---|---|---|---|---|---|---|---|
| A | feat: portfolio v2 | `feat/portfolio-v2` | not started | — | — | — | — |
| B | feat: 'currently' homepage section | `feat/portfolio-v2-now` | not started | — | — | — | — |

## Pre-PR-A blockers (must clear before opening)

- [ ] Fine-grained GitHub PAT issued with `Metadata: Read-only` permission, scoped to relevant ventures' public repos
- [ ] PAT stored in Vercel project as `GITHUB_TOKEN` for both Production and Preview environments
- [ ] `feat/portfolio-v2` branch created off `main` (HEAD `04ec1c6` at plan approval)

## PR A acceptance checklist

Per plan's PR A row + Verification section:

- [ ] Next.js 16 + ShadCN + Tailwind v4 scaffold (cherry-picked from approach used in archived `feat/prisma-hero`)
- [ ] `lib/github.ts` with `'server-only'` import, `unstable_cache`-wrapped `fetchOne`, sanitized error throws
- [ ] `Promise.allSettled` over 4 venture fetches at the dashboard render layer
- [ ] 4 venture cards (Maple Bit, Bavlio, SapienEx, BaviMail) with `data-venture-card` attribute on each
- [ ] Calendar widget server-rendered + thin client handler for slot-click → mailto subject prefill
- [ ] Body text contrast ≥4.5:1 on the brown-yellow palette (verified post-Geist swap)
- [ ] `prefers-reduced-motion` honored on every animation
- [ ] Visible focus rings on all interactive elements
- [ ] JSON-LD Person + `sameAs` array
- [ ] OG tags + Twitter card meta
- [ ] `public/sitemap.xml` and `public/robots.txt`
- [ ] Hero CTA = `mailto:` button
- [ ] v1 preserved at `/index-v1.html`
- [ ] CI gates green: `npm run build`, `npx tsc --noEmit`, `npm run lint`
- [ ] Vitest mocked-fetch unit tests covering 200 / 401 / 403 / 429 / network / cold-miss / partial-success
- [ ] gstack browse e2e on Vercel preview: load, screenshot, viewport sweep (360/768/1280/1920), reduced-motion, rate-limit fallback
- [ ] Lighthouse on preview: ≥95 Perf / 100 A11y / 100 BP / 100 SEO
- [ ] PR description calls out scaffold-LOC vs new-LOC split (per Codex non-blocker)
- [ ] Post-merge smoke: `curl -sS https://claude-code-course-2.vercel.app/ \| grep -c "data-venture-card"` returns `4`
- [ ] PR review gate (per CLAUDE.md autonomy rules: needs explicit confirmation before merge to main)

## PR B acceptance checklist

- [ ] `<section id="now">` added to home page below ventures dashboard
- [ ] 3-5 bullet content
- [ ] Anchor `#now` resolves
- [ ] gstack visual check

## Risk log

| Risk | Likelihood | Mitigation |
|---|---|---|
| `GITHUB_TOKEN` missing or invalid at deploy | low | Pre-PR-A blocker; verified before opening |
| Vercel build fails on first deploy of v2 | low | Preview builds catch this before merge |
| Brown-yellow body contrast still fails after Geist swap | medium | Adjust `--text` token; PR A acceptance includes verification |
| GitHub API rate limit during smoke test | low | Authenticated 5000/hr; fallback path tested |
| PAT expires mid-quarter | medium | 80-day `/loop` reminder set after PR A merges |

## Decisions made during execution

- **2026-04-30**: PR A started using existing classic PAT from `gh auth token` (broader scopes than the plan's fine-grained `Metadata: Read-only` recommendation). PM accepted this trade-off for execution velocity. Plan-loop not re-run; logged as epic delta only because the change is to token sourcing, not architecture. Risk: classic PAT has broader blast radius if leaked. Mitigation: token stays in Vercel env (server-side only) and is never logged or echoed in code. Migration to fine-grained PAT can happen in a follow-up without touching application code.

## Changes from the approved plan

- **Token type deviation (2026-04-30)**: classic PAT (gh CLI) substituted for fine-grained PAT (`Metadata: Read-only`). Application code is unchanged. Migration path: issue fine-grained PAT later, swap the value of `GITHUB_TOKEN` in Vercel; no code changes needed.

## Compounding (post-merge)

After PR A merges and CI is green, run `/compound-engineering-core:workflows:compound` with context "portfolio v2 ventures dashboard" to capture any non-obvious solutions for institutional knowledge. Examples worth capturing: the `unstable_cache` + `Promise.allSettled` pattern, the server-only token boundary, the Vercel git-integration cutover procedure.
