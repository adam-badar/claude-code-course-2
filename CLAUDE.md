# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Adam's personal portfolio website. The repository is fresh; the codebase has not been scaffolded yet.

## Stack

- Next.js 15 (App Router) with TypeScript
- Tailwind CSS for styling
- ShadCN UI (Radix-based, copy-paste components) as the component library
- `lucide-react` for icons
- `npm` as the package manager
- Vercel as the assumed deploy target

## Commands

Once the project is scaffolded, the standard Next.js scripts apply:

- `npm run dev` start the dev server on http://localhost:3000
- `npm run build` production build
- `npm start` run the production build locally
- `npm run lint` run ESLint

Update this section when project-specific scripts (test runner, typecheck, format) are added.

## Hard Conventions

These rules are project-specific and non-negotiable. They override default impulses.

1. **No em-dashes (`—`) anywhere.** Not in code, JSX text, copy, alt text, metadata, content files, comments, or commit messages. Use periods, commas, colons, parentheses, or restructured sentences. Before committing user-facing text, run `grep -rn "—" .` and fix any hits.
2. **No emojis in UI.** Every icon must be an SVG component, sourced from `lucide-react` first, or hand-authored SVG when lucide lacks one. This applies to buttons, navigation, status indicators, social links, section headers, and empty states. Never paste an emoji as a visual element.
3. **ShadCN UI first.** Install components with `npx shadcn@latest add <component>` rather than hand-rolling primitives. Only write a custom component when ShadCN has no equivalent, and prefer composing existing ShadCN primitives over forking them.

## Adding a ShadCN component

```bash
npx shadcn@latest add button
```

Components land under `components/ui/`. Import them from `@/components/ui/<name>`.

## Scaffolding (first task only)

Until `package.json` exists, the first task is to scaffold the project:

```bash
npx create-next-app@latest . --typescript --tailwind --app --eslint --use-npm
npx shadcn@latest init
npm install lucide-react
```

After the scaffold lands, replace this section with whatever architecture details are worth documenting (routing layout, content sources, data fetching patterns).
