# Building a tabbed learning module

Use the existing tab and section components to give students a clear path through an explanation, examples, reference material and an interactive experiment. Preserve the lesson's working behavior, routes and saved progress while improving its teaching.

Start with the [foundations route](../src/app/chapter1/01-foundations/page.jsx) and its [module folder](../src/components/01-introduction-to-probabilities/01-foundations). They demonstrate the current composition; their content is also subject to the [lesson review rubric](learning-quality.md).

## Give each tab a teaching job

| Tab | Content to include |
| --- | --- |
| Foundations | A motivating question, prerequisite ideas, plain-language intuition, a formal definition with assumptions, and why the idea is useful. |
| Worked examples | A simple example with justified steps, a harder or contrasting case, and a question that checks transfer to new inputs. |
| Quick reference | Symbols, formulas with conditions, a decision guide, common mistakes and short retrieval questions. |
| Interactive explorer | The existing simulation or visualization, a prediction before manipulation, labeled controls, interpretable results and a reset or return path. |

Use these tabs when they serve distinct purposes; avoid padding a short idea into repeated explanations. Divide a tab into sections that each answer one question. Let students control the pace and return to earlier steps. Optional derivations can add depth without blocking the introductory path. Do not claim a completion time or learning gain without supporting evidence.

Write original explanations and examples. For adapted material, record the exact source and reuse permission in the [provenance ledger](content-provenance.md). Preserve human credits and upstream notices. A textbook excerpt or external learning-site question needs its own evidence before incorporation.

## Compose the existing components

Keep the page in `src/app/chapterN/<existing-or-new-route>/` and the lesson components in the matching chapter folder under `src/components`. Follow the surrounding folder's numbering rather than renaming established routes or components.

- [TabbedLearningPage](../src/components/ui/TabbedLearningPage.jsx) receives `title`, `subtitle`, `chapter`, `tabs`, `storageKey` and `colorScheme`. Each tab supplies a stable `id`, `label`, `component` and optional icon/color. It owns tab navigation and routes completion through the registered learning activity.
- [SectionBasedContent](../src/components/ui/SectionBasedContent.jsx) receives a `sections` array with stable `id`, `title` and `content` component entries. A tab forwards its `onComplete` callback. The component owns section navigation, focus movement, math rendering and saved section position for a registered enclosing activity.
- [useLearningActivity](../src/hooks/useLearningActivity.js) supplies typed learning actions through the existing progress store. Reuse it instead of introducing another storage system.

The foundations module's [first tab](../src/components/01-introduction-to-probabilities/01-foundations/Tab1FoundationsTab.jsx) shows named section components and the callback connection. Define React components outside the section array when they need state or hooks; call hooks at the component's top level.

Keep stable tab/section IDs and existing `storageKey` values. Register new activities and tab mappings in the [curriculum manifest](../src/lib/curriculum/manifest.js); update migration mappings when an intentional change requires them. An arbitrary unregistered key does not create durable progress. Distinguish a saved position, studied content and assessed answers. Completion should follow an explicit student action, rather than mounting a tab or running an animation.

## Render mathematics and motion

Use the current [useMathJax hook](../src/hooks/useMathJax.js) or existing math-aware UI components. The [shared runtime](../src/lib/mathjax/runtime.js) coordinates rendering and cleanup. Supply changing content dependencies when using the hook; do not add direct `window.MathJax` calls, retry timers or separate script loaders to a new lesson.

Use inline `\(...\)` and display `\[...\]` delimiters for MathJax content, with JavaScript escaping where required. Check the surrounding component's contract before passing a formula: some accept raw TeX, others expect delimiters. Render user-supplied strings as text and keep any existing HTML-rendering surface restricted to trusted authored content. Inspect the final rendered equation, not only its source string.

Use [useReducedMotion](../src/hooks/useReducedMotion.js) for motion preferences. Keep controls usable during animation, provide the same conceptual result without motion, and cancel owned timers, transitions and animation frames on reset or unmount. Size charts to their available container, including hidden/reopened tabs and narrow layouts.

## Verify the complete path

Run `npm run check` and `npm run check:production` from the repository root. Add independent numerical checks for changed formulas and answer keys, and regression checks for changed interactions or saved state. Existing [learning tests](../tests/learning), [math tests](../tests/math) and [MathJax tests](../tests/mathjax) show the relevant test conventions.

In the production build, visit every changed tab and section. Use keyboard navigation, predict and manipulate the experiment, inspect equations and numerical output, reset, navigate away and reload. Check desktop and narrow layouts, reduced motion, focus, labels, saved position and completion. Preserve the previously working explorer while correcting any demonstrated defect.

Apply the [three learner perspectives and six-dimension quality gate](learning-quality.md#review-the-teaching). Record the revision, tested actions, numerical evidence, screenshots where useful and remaining gaps in the pull request. See [CONTRIBUTING.md](../CONTRIBUTING.md) for source and submission requirements.
