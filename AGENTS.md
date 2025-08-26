# Repository Guidelines

## Project Structure & Module Organization
- **App routes**: `src/app` (Next.js 15 app router, `layout.js`, chapter pages).
- **UI components**: `src/components` (grouped by chapter, e.g., `06-hypothesis-testing/6-1-4-PValueMeaning.jsx`).
- **Hooks/Utils/Lib**: `src/hooks`, `src/utils`, `src/lib` (design system, quiz helpers).
- **Content & Assets**: `src/content` (MD/MDX), `public/` (static). Docs live in `docs/`, tasks in `tasks/`, scripts in `scripts/`.
- **Path aliases**: Use `@/…` per `jsconfig.json` (e.g., `import X from '@/components/shared/X'`).

## Build, Test, and Development Commands
- `npm run dev`: Start local dev server at `http://localhost:3000`.
- `npm run build`: Production build (MDX enabled via `next.config.js`).
- `npm start`: Serve the production build.
- `npm run lint`: ESLint (Next core-web-vitals config).
- `npm run clean-build`: Remove `.next` then rebuild.

## Coding Style & Naming Conventions
- **Indentation**: 2 spaces; prefer single quotes and semicolons.
- **React**: Components in PascalCase; hooks in camelCase prefixed with `use…`.
- **Files**: Feature folders; chapter components use numeric prefixes and kebab-case (e.g., `3-3-1-NormalZScoreExplorer.jsx`).
- **Styling**: Tailwind CSS; keep utility classes readable and grouped logically.
- **Imports**: Prefer `@/…` paths; group std, third-party, then local imports.

## Testing Guidelines
- No formal test runner configured. Validate changes by:
  - Running `npm run dev` and exercising affected flows.
  - Checking console for errors and verifying responsive behavior.
  - Running `npm run lint` before commits.
- If adding tests, prefer Are you able to launch multiple parallel agents? React Testing Library for components and Playwright for e2e.

## Commit & Pull Request Guidelines
- **Commits**: Follow Conventional Commits seen in history (`feat:`, `fix:`, `refactor:`, `test:`). Keep messages imperative and scoped (e.g., `feat: add quiz system to chapter 4`).
- **PRs**: Include a clear description, linked issues, and screenshots/GIFs for UI changes. Note any migrations (e.g., D3 cleanup). Ensure `lint` and `build` pass locally.

## Security & Configuration Tips
- Environment: Behavior toggles by `NODE_ENV` (dev vs prod). Avoid committing secrets; use `.env.local` when needed.
- MDX: Math support via `remark-math`/`rehype-katex`; keep content in `src/content` and co-locate chapter assets in their folders.
