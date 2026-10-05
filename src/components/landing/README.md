# Landing page

[LandingAcademic.jsx](LandingAcademic.jsx) assembles the home page. It dynamically imports the hero, chapter grid, chapter shortcut path, statistics and decorative symbols. Chapter previews live in [visualizations](visualizations).

| Component | Responsibility |
| --- | --- |
| [HeroSection](components/HeroSection.jsx) | Introduction and entry links |
| [ChapterGrid](components/ChapterGrid.jsx) | Chapter cards and section registration |
| [JourneyPath](components/JourneyPath.jsx) | Declarative SVG path and keyboard-accessible chapter shortcuts |
| [FloatingSymbols](components/FloatingSymbols.jsx) | Decorative CSS motion, paused when the page is hidden |
| [CourseStats](components/CourseStats.jsx) | Curriculum counts and saved study progress |

The page batches scroll/resize geometry reads into one scheduled animation frame and removes observers, listeners and the pending frame on cleanup. The path's scroll state updates its normalized stroke rather than restarting D3 transitions. Decorative motion and progress transitions respect the shared reduced-motion preference.

[Landing interaction tests](../../../tests/motion/scroll-batching.test.jsx), [path tests](../../../tests/motion/journey.test.jsx) and [statistics tests](../../../tests/motion/course-stats.test.jsx) check these behaviors. Run them from the repository root:

```bash
npx vitest run tests/motion
```

Re-render counts, frame rate, memory and loading-time improvements need measurements against a named baseline. No percentage improvement has been established by these assertion tests. Measure the actual production page when changing animation or import boundaries.

See the [root setup and verification instructions](../../../README.md).
