export const HUB_FIXTURES = {
  chapter1Progress: ['formula-builder', 'foundations', 'probability-dictionary', 'sample-spaces-events', 'counting-techniques', 'ordered-samples', 'unordered-samples', 'probability-event', 'conditional-probability', 'bayes-theorem-visualizer', 'probabilistic-fallacies', 'monty-hall-masterclass'],
  discreteDistributionsProgress: ['formula-builder', 'random-variables', 'expectation-variance', 'transformations', 'binomial-distribution', 'geometric-distribution', 'negative-binomial', 'poisson-distribution', 'distribution-stories'],
  continuousDistributionsProgress: ['formula-builder', 'introduction', 'probability-density', 'expectation-variance', 'normal-distributions', 'exponential', 'gamma', 'joint-distributions', 'normal-approximation', 'double-integral-calculator'],
  descriptiveStatsProgress: ['formula-builder', 'introduction', 'central-tendency', 'variability', 'exploratory-data-analysis', 'sampling-distributions', 'central-limit-theorem', 'advanced-distributions'],
  estimationProgress: ['formula-builder', 'statistical-inference', 'confidence-intervals-known', 'confidence-intervals-practice', 'sample-size', 'confidence-intervals-unknown', 'proportions', 'ci-hypothesis-bridge', 'ci-interpretation', 'empirical-rule'],
  hypothesisTestingProgress: ['formula-builder', 'hypothesis-fundamentals', 'types-of-hypotheses', 'errors-and-power', 'test-mean-known-variance', 'test-mean-unknown-variance', 'test-for-proportion', 'paired-two-sample', 'unpaired-two-sample', 'difference-two-proportions'],
  hypothesisTestingBonusProgress: ['hypothesis-game', 'hypothesis-evidence', 'type-error-visualizer', 'p-value-meaning', 'types-hypotheses-interactive'],
  linearRegressionProgress: ['formula-builder', 'correlation-coefficient', 'simple-linear-regression', 'hypothesis-testing-regression', 'confidence-prediction-intervals', 'analysis-of-variance', 'coefficient-of-determination'],
};

export const TAB_FIXTURES = {
  'chapter1-foundations-progress': ['foundations', 'worked-examples', 'quick-reference', 'interactive'],
  'chapter1-probability-dictionary-progress': ['foundations', 'worked-examples', 'quick-reference', 'interactive'],
  'chapter1-sample-spaces-events-progress': ['foundations', 'worked-examples', 'quick-reference'],
  'chapter1-ordered-samples-progress': ['foundations', 'worked-examples', 'quick-reference'],
  'chapter1-unordered-samples-progress': ['foundations', 'worked-examples', 'quick-reference'],
  'chapter1-conditional-probability-progress': ['foundations', 'worked-examples', 'quick-reference', 'interactive'],
  'chapter1-bayes-theorem-visualizer-progress': ['foundations', 'worked-examples', 'quick-reference'],
};

export const ATTEMPT_FIXTURE = {
  id: '1700000000000',
  date: '2025-01-01T12:00:00.000Z',
  chapterId: 1,
  score: 6,
  percentage: 60,
  timeSpent: 45,
  totalQuestions: 10,
  correctAnswers: 6,
  version: 'social',
  answers: { 0: { answer: 1, isCorrect: true, timestamp: 1700000000000 }, 1: { answer: [0, 2], isCorrect: false, timestamp: 1700000000500 } },
};

export const RAW_FIXTURES = Object.fromEntries([
  ...Object.entries(HUB_FIXTURES).map(([key, ids]) => [key, JSON.stringify(ids)]),
  ...Object.entries(TAB_FIXTURES).flatMap(([key, ids]) => [[key, JSON.stringify(ids)], [`${key}:active-tab`, ids.at(-1)]]),
  ['probLabProgress', JSON.stringify({ 'chapter-1': { status: 'completed', progress: 100, timeSpent: 80, lastUpdated: '2025-01-01T12:00:00.000Z', completedSections: ['foundations', '1-0'] } })],
  ['probLabProgressMeta', JSON.stringify({ userId: 'someone-else', pendingSync: true, version: '1.0.0' })],
  ['dataDescriptionsProgress', JSON.stringify(['intuitive-intro', 'descriptive-stats-journey', 'descriptive-stats-foundations', 'mathematical-foundations'])],
  ['monty-hall-journey-progress', JSON.stringify({ stage: 2, completed: [0, 1] })],
  ['descriptive-stats-journey-progress', JSON.stringify({ stage: 3, completed: [0, 1, 2] })],
  ['progressive-content-/lesson-based-approach', JSON.stringify({ currentSection: 9, quizCompletions: { 'section-1': true, 'section-3': true, 'section-5': true, 'section-7': true }, lastUpdated: '2025-01-01T12:00:00.000Z' })],
  ['quiz_attempts', JSON.stringify({ 1: [ATTEMPT_FIXTURE] })],
  ['quiz_best_scores', JSON.stringify({ 1: 90, 2: 0 })],
  ['quiz_preferences', JSON.stringify({ showTimer: false, immediateFeeback: true, showQuestionNumbers: true, allowSkipping: false, version: 'social' })],
  ['quiz_current_session', JSON.stringify({ chapterId: 1, currentQuestion: 1, answers: ATTEMPT_FIXTURE.answers, timeRemaining: 120, deadline: 1700000120000, isPaused: true, pausedRemaining: 120, startTime: 1700000000000, flaggedQuestions: [1], version: 'social' })],
  ['chapter1Progress_devMode', 'true'],
  ['hypothesisTestingBonusProgress_devMode', 'false'],
  ['centralTendency_devMode', 'true'],
  ['sidebarOpen', 'false'],
  ['tutorial-normal-z-score-explorer-3-3-1-completed', 'true'],
  ['tutorial-gamma-distribution-simplified-completed', 'skipped'],
]);
