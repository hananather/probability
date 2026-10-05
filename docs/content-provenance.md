# Content provenance

Probability Lab is intended to be free for students. Its repository-wide code and educational-content licenses are still unresolved. This ledger records identified origins and outstanding evidence; it supplies no license grant. Preserve the existing credits to **Patrick Boily and Hanan Ather** in the [course overview](../src/content/probability.mdx) and [about page](../src/app/about/page.js).

Ledger reviewed against the repository on 2026-10-05. It covers the items below, not every explanation, question, dependency or distributed asset.

## Record an item

For each lesson, question, dataset, diagram or asset, record:

- Its stable activity/question ID, source path and the part incorporated.
- Its creator and whether it is **original**, **adapted**, **reference-only** or **unknown**. Use original only with an identified creator and authorship statement. Reference-only means the project links to or cites the source; it does not clear incorporated material.
- The source URL and exact version, edition and page where relevant. For original work, record its origin instead of inventing an external source.
- The exact license and license URL, or permission evidence and its scope. Mark missing evidence unknown; retain required credits and notices. Keep private permission records private and provide a public evidence reference or approved summary.
- Mathematical review: inputs, assumptions, independent calculation or test, checked revision, and remaining concerns. Numerical correctness and reuse permission are separate checks.

## Existing content and assets

“Unknown” below means the current repository does not document the needed origin or permission. It does not establish copying or ownership.

| Item and current evidence | Origin/source status | Permission and next evidence needed |
| --- | --- | --- |
| [Course overview](../src/content/probability.mdx), rendered by [overview page](../src/app/overview/page.js) | Credits Patrick Boily and Hanan Ather; per-explanation original/adapted status unknown. | Contribution-specific reuse permission unknown. Preserve both credits and document the origin of incorporated explanations. |
| [Probability dictionary table](../src/components/01-introduction-to-probabilities/02-probability-dictionary/Tab3QuickReferenceTab.jsx), section `complete-dictionary` | Comment identifies a textbook image; book, creator, edition, page and source URL unknown. | Exact license/permission unknown. Identify the source or provide an independently written table and examples, retaining the lesson's teaching function and mathematical review. Removing the comment would not resolve provenance. |
| [Chapter question bank](../src/lib/quiz/questionBank.js) | Questions have stable IDs and explanations; per-question creator and original/adapted status unknown. | Source URLs and licenses/permissions unknown. Add item-level records. [Question-bank assertions](../tests/math/question-bank.test.js) provide numerical checks for specified cases, not a source-permission record or a review of every explanation. |
| CLT visualizations: [shared](../src/components/shared/CLTSimulation.jsx), [overview](../src/components/overview-components/CLTSimulation.jsx), [chapter four](../src/components/04-descriptive-statistics-sampling/4-6-central-limit-theorem/4-6-3-CLTSimulation.jsx) | Each mentions reference CLT code. Whether the reference is internal or external, its creator, version and source URL are unknown. All three have current source imports. | Exact reference license/permission unknown. Identify it and retain applicable notices. Consolidation also needs behavior checks for the importing lessons. |
| [University logo](../public/uo.png), displayed by the course overview | Identified uOttawa brand image; original asset URL/creator unknown. | Asset-specific authorization unknown. Record it separately from any future platform license. |
| [Hanan portrait](../src/app/about/Hanan.jpg) and [Patrick portrait](../src/app/about/Patrick.png), displayed by the about page | Subjects are identified; photographers and original asset URLs unknown. | Redistribution permission unknown. Record creator, source and authorization for each image; retain the human contributor credits. |
| [Favicon](../src/app/favicon.ico) | Creator and source unknown. | Exact license/permission unknown. Identify its origin or provide documented original artwork. |
| [Chapter-three MDX](../src/content/chapter3.mdx) | Creator and original/adapted status unknown. No current incoming source import was identified. | Source URLs and permissions unknown. Preserve its educational content while reconciling it with current lessons; lack of an import is not a reason to discard its provenance. |
| [F-distribution worked example](../src/components/04-descriptive-statistics-sampling/4-7-advanced-distributions/4-7-4-FDistributionWorkedExample.jsx) | Explicit reference link to [NIST's F-test explanation](https://itl.nist.gov/div898/handbook/eda/section3/eda359.htm). The source link is reference-only; the lesson's text/example authorship remains unknown. | No incorporated-material permission is recorded. Keep the reference and distinguish any future direct reuse from independently written explanation. |
| Khan Academy resource links in [prerequisites](../src/app/prerequisites/page.js) and [prerequisite review](../src/app/resources/prerequisite-review/page.js) | Reference-only links to [Khan Academy math](https://www.khanacademy.org/math). These links do not embed a Khan lesson. | No claim of a content license or permission to reuse Khan materials is made by these links. Record exact terms if material is incorporated later. |

## Software sources and notices

Dependency licensing is separate from educational-content provenance. [package-lock.json](../package-lock.json) identifies installed versions; retain their full upstream notices when distributing the relevant artifacts. A complete notice inventory and distribution review remain open.

| Item | Source/license evidence | Unresolved scope |
| --- | --- | --- |
| UI scaffold in [components.json](../components.json) and [button.jsx](../src/components/ui/button.jsx) | The configuration names shadcn/new-york. Current upstream [shadcn license](https://raw.githubusercontent.com/shadcn-ui/ui/main/LICENSE.md) is MIT. | Exact registry revision and incorporated scaffold files/notices are not recorded. The current upstream license is not evidence of the exact source revision used here. |
| MathJax loaded by [config.js](../src/lib/mathjax/config.js) | The loader pins 3.2.2; that version's [upstream license](https://raw.githubusercontent.com/mathjax/MathJax/3.2.2/LICENSE) is Apache-2.0. | Record the full notices for the actual distributed software. This software license does not license the lesson text. |

New contributions should update this ledger with item-level evidence rather than treating an entire chapter as cleared. Use the [contribution guide](../CONTRIBUTING.md) for the software and teaching checks required with a change.
