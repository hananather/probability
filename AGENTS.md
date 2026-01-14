# Repository Guidelines

## Project Structure & Module Organization
- App routes: `src/app` (Next.js 15 App Router, `layout.js`, chapter pages).
- UI components: `src/components` grouped by chapter (e.g., `06-hypothesis-testing/6-1-4-PValueMeaning.jsx`).
- Hooks/Utils/Lib: `src/hooks`, `src/utils`, `src/lib` (design system, quiz helpers).
- Content & assets: `src/content` for MD/MDX; `public/` for static. Docs in `docs/`; course materials in `course-materials/`.
- Config/Contexts/Services: `src/config`, `src/contexts`, `src/services`.
- Templates & tutorials: `src/templates`, `src/tutorials`.
- Path aliases: prefer `@/...` per `jsconfig.json` (e.g., `import X from '@/components/shared/X'`).

## Build, Test, and Development Commands
- `npm run dev`: Start local dev at `http://localhost:3000`.
- `npm run build`: Production build (MDX enabled via `next.config.js`).
- `npm start`: Serve the production build.
- `npm run lint`: ESLint using Next `core-web-vitals` rules.
- `npm run clean-build`: Remove `.next` then rebuild.

## Coding Style & Naming Conventions
- Indentation: 2 spaces; prefer single quotes and semicolons.
- React: components in PascalCase; hooks camelCase prefixed with `use…`.
- Files: chapter components use numeric prefixes (e.g., `3-3-1-NormalZScoreExplorer.jsx`).
- Styling: Tailwind CSS; group utilities logically for readability.
- Imports: order std → third‑party → local; use `@/...` paths.

## Testing Guidelines
- No formal runner configured. Validate by running `npm run dev`, exercising affected flows, and checking the console for errors.
- Run `npm run lint` before commits.
- If adding tests, prefer React Testing Library (components) and Playwright (e2e). Co‑locate tests near sources or in feature folders and mirror file names.

## Commit & Pull Request Guidelines
- Commits: use Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`). Keep messages imperative and scoped (e.g., `feat: add quiz system to chapter 4`).
- PRs: include a clear description, link issues, and add screenshots/GIFs for UI changes. Note any migrations (e.g., D3 cleanup). Ensure `npm run lint` and `npm run build` pass locally.

## Security & Configuration Tips
- Respect `NODE_ENV` for dev vs prod. Do not commit secrets; use `.env.local`.
- MDX math via `remark-math`/`rehype-katex`. Keep content in `src/content` and co‑locate chapter assets in their folders.

## Architecture Overview
- Next.js 15 App Router + MDX, Tailwind for styling, and path aliases via `jsconfig.json`. Shared design system and quiz helpers live under `src/lib` and `src/utils`.
