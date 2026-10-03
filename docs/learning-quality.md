# Reviewing a lesson

A lesson passes review when its mathematics is correct, its interactions work, and a student can explain the idea and apply it to a new example. Review the production build, record the Git revision, and keep source inspection, browser observations, numerical checks, and learning outcomes separate.

## Check the software

Use Node.js 22.12 or later. From the repository root:

```sh
npm ci
npm run check
npm run check:production
```

`check` runs the tests, lint, and production build. `check:production` starts the built application on port 3100, checks its page routes, and stops the server. Passing these commands establishes software checks; it does not establish lesson quality.

## Review every reachable activity

Start at the chapter hub and follow each lesson, reference, quiz, and supplementary link. Include published routes that are reachable elsewhere, such as the resource library and saved quiz review. Report a broken published link even if its destination is an older route.

For each activity:

1. Work through it with a mouse and keyboard. Try predictions before revealing answers, change sliders and inputs, and use next, previous, reset, and completion controls.
2. Inspect rendered equations, labels, units, assumptions, and numerical results. Compare calculations with an independent calculation, including boundary and degenerate cases.
3. Review desktop, tablet, and narrow mobile layouts. Suggested widths are 1400, 768, 390, and 320 pixels. Check text wrapping, equation scrolling, focus visibility, control labels, touch targets, and the absence of unintended page-wide horizontal scrolling.
4. Use reduced motion. Check that the lesson remains understandable without animation and that ongoing motion has an accessible stopping mechanism where needed.
5. Reload after navigation, study completion, and quiz activity. Check that saved position, studied content, and assessed answers remain distinct. Exercise backup export/import and failed-save recovery when the activity writes progress.
6. Inspect browser errors and failed requests. Record the action that triggered a problem and whether it repeats.

## Review the teaching

Read the activity from three perspectives: a student who is confused by its prerequisites, a student seeking deeper derivations and transfer, and a motivated student who benefits from short, manageable steps and clear return points. These perspectives guide review; they do not establish clinical effects or measured learning gains.

Rate each dimension from 1 to 5 and give evidence for the rating:

| Dimension | What to inspect |
| --- | --- |
| Functionality | Controls, navigation, saved state, and recovery work under the tested conditions. |
| Mathematical correctness | Definitions, assumptions, derivations, answer keys, and numerical results agree. |
| Explanatory depth | The activity explains why the method works, connects representations, and supports transfer. |
| Writing clarity | Terms are introduced before use; questions, instructions, and feedback have a clear meaning. |
| Visual clarity | Layout and diagrams direct attention to the relevant quantities and relationships. |
| Accessibility and learner control | Keyboard operation, labels, readable layouts, pacing, reduced motion, and return points support use. |

Use 1 for unusable or misleading, 2 for major obstacles, 3 for usable with unresolved teaching or interaction gaps, 4 for a coherent explanation and verified usable path, and 5 for that standard plus deeper transfer and independently checked difficult cases. A rating is a review judgment, not a measured student outcome. Leave an unreviewed dimension unscored.

The initial acceptance threshold is at least 4 in every dimension, with no known mathematical error, data-loss defect, or blocked essential interaction. A strong average cannot compensate for a failing dimension. Preserve adverse findings and retest the affected path after each correction.

## Report a reproducible finding

Include the revision, route, exact action, expected result, observed result, severity, and evidence. Attach a screenshot when appearance matters; include the numerical inputs and independent reference calculation when mathematics matters. Identify the component only after inspecting its source. Separate a verified cause from a suspected cause.

Prioritize crashes, data loss, wrong mathematics, and inaccessible essential controls first. Then address misleading explanations, broken layouts, and unnecessary interaction cost. Keep cosmetic changes separate from changes to a definition, assumption, answer key, or assessment policy.

After a fix, repeat its reproduction and the related working path. Record which checks ran and which remain open. An HTTP response, passing unit test, or saved screenshot alone does not prove that the complete lesson passes this review.
