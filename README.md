# Probability Lab

Probability Lab teaches probability and statistics through interactive lessons, simulations, worked examples and chapter quizzes. It began as a resource for MAT 2377, Probability and Statistics for Engineers at the University of Ottawa, and covers seven published chapters.

## Overview

An educational web app featuring interactive simulations and visualizations for learning probability and statistics concepts including:
- Probability distributions
- Central Limit Theorem
- Bayesian inference
- Confidence intervals
- Hypothesis testing
- Linear regression

## Run locally

Use Node.js 22.12 or later. Install the versions recorded in the lockfile:

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

Lessons and guest progress work without account configuration. Optional email sign-in and account synchronization require a configured Supabase project and its owner-isolated progress table; see [account setup and validation](docs/accounts.md). Account deployment still requires verification against the intended provider.

## Verify a change

```bash
npm run check
npm run check:production
```

`check` runs the assertion suite, ESLint and the production build. `check:production` starts that build on port 3100, checks the generated page routes and stops its server. Route checks verify HTTP reachability. Exercise the changed lesson's controls in a browser at desktop and narrow widths, including keyboard use and reduced motion.

The real-provider integration fixture is explicitly skipped when it is not configured. See [account validation](docs/accounts.md#validate-account-behavior) for its separate database and ownership checks. Test and build results apply to the checked revision.

## Find the implementation

| Path | Purpose |
| --- | --- |
| [src/app](src/app) | Next.js pages, layouts and account API routes |
| [src/components](src/components) | Chapter lessons, shared controls and visualizations |
| [src/lib/curriculum/manifest.js](src/lib/curriculum/manifest.js) | Stable lesson IDs, published chapters and progress denominators |
| [src/lib/statistics](src/lib/statistics) | Numerical functions used by lessons |
| [src/lib/progress](src/lib/progress) | Guest/account storage, migration, synchronization and recovery |
| [src/lib/quiz](src/lib/quiz) | Question banks, grading and pinned quiz sessions |
| [src/lib/mathjax](src/lib/mathjax) | Shared mathematical rendering |
| [tests](tests) | Numerical, interaction, persistence and ownership assertions |

Add explanations and examples in the chapter's existing learning structure. Check each numerical answer and its conditions, and preserve working interactions and saved progress when refactoring. Record the source and permission for incorporated text, questions or assets. The repository's overall license and content attribution are still being resolved; existing third-party rights and author credits remain applicable.

## Tech Stack

- Next.js 15 + React 19
- D3.js for visualizations
- MDX for content
- Tailwind CSS
- jStat for statistical calculations
