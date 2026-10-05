# Lesson quality standard

A lesson is ready for release when its calculations and explanations are correct, its controls work, and learners can use it with a keyboard and on a narrow screen. Review ratings summarize observed quality; they do not establish learning outcomes.

Review each lesson, example, question, and answer from three perspectives:

- A learner encountering the concept for the first time: are prerequisites explicit, symbols defined, and feedback enough to recover from a mistake?
- A learner seeking depth: are assumptions, derivations, boundary cases, and transfer problems available?
- A motivated learner with attention difficulties: is the next action clear, is information divided into coherent steps, and can the learner pause, resume, or reduce motion without losing context?

Rate each dimension separately on a five-point scale:

| Dimension | Evidence for a rating of at least 4 |
| --- | --- |
| Mathematical correctness | Independently checked answers, stated assumptions, consistent notation, and verified numerical boundary cases. |
| Functionality | Working navigation, controls, feedback, and saved state; meaningful regression checks and actual browser use. |
| Accessibility | Keyboard access, visible focus, named controls, usable narrow layout, readable contrast, and reduced motion. |
| Clarity | Defined terms, concise instructions, consistent units, and specific feedback explaining mistakes. |
| Explanatory depth | An intuitive model, its mathematical connection, worked reasoning, and opportunities to apply the idea beyond the example. |
| Visual and interaction quality | Legible diagrams, stable layouts, purposeful motion, and responsive interactions without distracting animation. |

A rating of 1 means a blocking defect; 2 means major gaps; 3 means usable with material gaps; 4 means the evidence above is present; 5 means the lesson also handles challenging cases and learner recovery especially well. Record the observed evidence and remaining limitations with each rating. An average cannot compensate for a blocking defect or a dimension below 4.

## Verification loop

1. Identify the route, components, examples, and question IDs under review.
2. Reproduce reported failures before editing.
3. Make a scoped change that preserves working routes, content, and learner history.
4. Check calculations against an independent reference and run appropriate regression tests.
5. Use the changed flow in a browser at desktop and narrow widths, with keyboard controls and reduced motion where relevant.
6. Review the result from the three learner perspectives. Fix defects that prevent the release standard.
7. Record the revision, evidence, limitations, and follow-up work in the associated issue and pull request.

Repository checks:

```sh
npm ci
npm run check
npm run start -- --hostname 127.0.0.1 --port 3000
```

In a second terminal, check that built pages respond:

```sh
node scripts/check-routes.mjs
```

The route check verifies HTTP responses and HTML, not client interactions or learning quality. Browser use remains a separate requirement. Numerical tests, lint, build, route checks, and browser evidence must identify the revision they cover. Unreviewed material stays unreviewed until those checks are performed.
