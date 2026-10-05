# Contributing to Probability Lab

Help students understand probability through correct explanations, worked examples, interactive experiments and useful feedback. Start with a reproducible problem or a proposed lesson improvement in the [issue tracker](https://github.com/hananather/probability/issues), then submit a scoped pull request.

## Run and check the application

Use Node.js 22.12 or later:

```sh
npm ci
npm run dev
```

Before submitting a change:

```sh
npm run check
npm run check:production
```

`check` runs the tests, lint and production build. `check:production` checks the built page routes on port 3100. These checks establish software behavior under their tested conditions; lesson quality also requires browser and mathematical review. See the [repository map](README.md#find-the-implementation) and [account validation](docs/accounts.md#validate-account-behavior) for relevant implementation and provider checks.

## Change code without losing learning behavior

Use the existing chapter components and shared controls before introducing another abstraction. Keep routes, stable activity/question IDs, saved progress and working interactions compatible. A refactor should preserve a student's answers, current lesson position and completed work. Describe any intentional behavior change separately.

Use two-space indentation, single quotes and semicolons in new JavaScript. Prefer `@/` imports, PascalCase component names and `use…` hook names. Match the surrounding chapter's file organization. The [module guide](docs/tabbed-learning-guide.md) describes the current tab, section, math-rendering and progress components.

Add meaningful regression tests for changed calculations, grading, persistence or interactions. Prefer independent reference calculations to expectations copied from the implementation. Include invalid inputs, boundary cases and degenerate cases when they affect the result. Report skips and unrun checks explicitly.

For motion changes, clean up timers, event listeners and animation frames when a component unmounts or changes modes. Preserve understandable feedback with reduced motion and responsive controls while an animation runs. Support any performance claim with a reproducible measurement and comparison baseline.

## Write and review a lesson

Introduce prerequisites and symbols before using them. Explain the idea in plain language, state its mathematical conditions, work through a numerical example and offer a new case that tests transfer. Let students predict before revealing an answer. Explain why distractors fail, including the misconception each one represents. Distinguish exact results, approximations and simulations; label units, rounding and synthetic data.

Review the complete activity from each learner perspective:

| Perspective | Questions for review |
| --- | --- |
| A confused student | Are prerequisites visible? Can I connect the words, diagram and notation? Does feedback explain my mistake and the next step? |
| A high-achieving student | Can I derive the result, identify its assumptions and limits, and apply it to a harder or unfamiliar example? |
| A motivated student who needs manageable attention steps | Is the next action clear? Can I pause, return and resume? Are explanations divided into useful steps, with optional depth and control over motion? |

Rate functionality, mathematical correctness, explanatory depth, writing clarity, visual clarity, and accessibility/learner control separately. The initial acceptance gate is at least **4 out of 5 in every dimension**, with no known mathematical error, data-loss defect or blocked essential interaction. Leave unreviewed dimensions unscored. The [lesson review rubric](docs/learning-quality.md) defines the scale and evidence requirements. Review ratings do not establish measured learning gains or clinical effects.

Exercise the changed activity in the production build with a mouse and keyboard, at desktop and narrow widths including 390 and 320 pixels. Check labels, visible focus, equation wrapping or scrolling, reset/navigation controls, reduced motion and browser errors. Reload after work that saves progress. For account changes, verify the configured provider and ownership boundaries described in the account guide. Record the checked Git revision and the paths exercised.

## Record content sources

Write new explanations, questions and diagrams in your own words. For each added or adapted item, identify its creator and record its origin in the [content provenance ledger](docs/content-provenance.md). Direct reuse requires the exact applicable license or documented permission, the source URL and version/edition/page where relevant, and retained attribution or notices. A link to a learning resource records a reference; it does not document permission to incorporate its text, questions, artwork or branding.

Preserve existing human author credits, including Patrick Boily and Hanan Ather. The repository-wide code and educational-content licenses are still unresolved. State any contribution-specific permission explicitly; this guide supplies no blanket reuse grant. Keep unresolved sources marked as unresolved rather than assuming they are original or cleared.

## Submit a reviewable pull request

Link the issue and explain the problem, resulting behavior and validation. Include numerical inputs and an independent calculation for a mathematical correction; include screenshots for visual changes. State remaining limitations, skipped checks and any migration or source-permission change. Use a Conventional Commit title such as `fix: correct sample size rounding`.

Keep secrets, account backups, personal information and local working guidance out of shared files. Preserve educational material when removing unused code: establish its references, explain the removal and retain useful content through a separate documented location when appropriate.
