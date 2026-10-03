// Stable learning IDs and source-derived counts. Keep question text outside this module.
import { SECTION_RESUME_SOURCES } from './sectionResumeSources';
export const CURRICULUM_REVISION = '2026-10-03.1';
export { CURRICULUM_METADATA } from './metadata';

const definitions = [
  {
    number: 1,
    title: 'Chapter 1: Introduction to Probabilities',
    storageKey: 'chapter1Progress',
    quizCounts: {"engineering":15,"biostats":1,"social":1},
    passingScore: 50,
    primary: [
      ['formula-builder', 'Interactive Formula Builder', '/chapter1/formula-builder', []],
      ['foundations', '1.1 Foundations', '/chapter1/01-foundations', []],
      ['probability-dictionary', '1.2 English-to-Math Translation', '/chapter1/02-probability-dictionary', ['foundations']],
      ['sample-spaces-events', '1.3 Sample Spaces & Set Operations', '/chapter1/03-sample-spaces-events', ['foundations', 'probability-dictionary']],
      ['counting-techniques', '1.4 Counting Techniques', '/chapter1/04-counting-techniques', ['sample-spaces-events']],
      ['ordered-samples', '1.5 Ordered Samples', '/chapter1/05-ordered-samples', ['counting-techniques']],
      ['unordered-samples', '1.6 Unordered Samples', '/chapter1/06-unordered-samples', ['ordered-samples']],
      ['probability-event', '1.7 Probability of an Event', '/chapter1/07-probability-event', ['sample-spaces-events', 'counting-techniques']],
      ['conditional-probability', '1.8 Conditional Probability', '/chapter1/08-conditional-probability', ['probability-event']],
      ['bayes-theorem-visualizer', '1.9 Bayes\' Theorem', '/chapter1/09-bayes-theorem-visualizer', ['conditional-probability']],
      ['probabilistic-fallacies', '1.10 Probabilistic Fallacies', '/chapter1/10-probabilistic-fallacies', ['conditional-probability', 'bayes-theorem-visualizer']],
      ['monty-hall-masterclass', '1.11 Monty Hall Complete Analysis', '/chapter1/11-monty-hall-masterclass', ['conditional-probability', 'bayes-theorem-visualizer']],
    ],
    bonus: [

    ],
  },
  {
    number: 2,
    title: 'Chapter 2: Discrete Random Variables',
    storageKey: 'discreteDistributionsProgress',
    quizCounts: {"engineering":18,"biostats":0,"social":0},
    passingScore: 50,
    primary: [
      ['formula-builder', 'Interactive Formula Builder', '/chapter2/formula-builder', []],
      ['random-variables', '2.1 Random Variables & Distributions', '/chapter2/random-variables', []],
      ['expectation-variance', '2.2 Expectation & Variance', '/chapter2/expectation-variance', ['random-variables']],
      ['transformations', '2.2.4 Transformations', '/chapter2/transformations', ['expectation-variance']],
      ['binomial-distribution', '2.3 Binomial Distribution', '/chapter2/binomial-distribution', ['expectation-variance']],
      ['geometric-distribution', '2.4 Geometric Distribution', '/chapter2/geometric-distribution', ['binomial-distribution']],
      ['negative-binomial', '2.5 Negative Binomial Distribution', '/chapter2/negative-binomial', ['geometric-distribution']],
      ['poisson-distribution', '2.6 Poisson Distribution', '/chapter2/poisson-distribution', ['binomial-distribution']],
      ['distribution-stories', '2.7 Distribution Stories', '/chapter2/distribution-stories', ['binomial-distribution', 'geometric-distribution', 'poisson-distribution']],
    ],
    bonus: [

    ],
  },
  {
    number: 3,
    title: 'Chapter 3: Continuous Random Variables',
    storageKey: 'continuousDistributionsProgress',
    quizCounts: {"engineering":18,"biostats":3,"social":3},
    passingScore: 50,
    primary: [
      ['formula-builder', 'Interactive Formula Builder', '/chapter3/formula-builder', []],
      ['introduction', 'Introduction: Bridge to Continuous', '/chapter3/introduction', []],
      ['probability-density', '3.1 Probability Density Functions', '/chapter3/probability-density', ['introduction']],
      ['expectation-variance', '3.2 Expectation & Variance', '/chapter3/expectation-variance', ['probability-density']],
      ['normal-distributions', '3.3 Normal Distributions', '/chapter3/normal-distributions', ['expectation-variance']],
      ['exponential', '3.4 Exponential Distributions', '/chapter3/exponential', ['probability-density']],
      ['gamma', '3.5 Gamma Distributions', '/chapter3/gamma', ['exponential']],
      ['joint-distributions', '3.6 Joint Distributions', '/chapter3/joint-distributions', ['probability-density']],
      ['normal-approximation', '3.7 Normal Approximation', '/chapter3/normal-approximation', ['normal-distributions']],
      ['double-integral-calculator', 'Bonus: Double Integral Calculator', '/chapter3/double-integral-calculator', ['joint-distributions']],
    ],
    bonus: [

    ],
  },
  {
    number: 4,
    title: 'Chapter 4: Descriptive Statistics and Sampling Distributions',
    storageKey: 'descriptiveStatsProgress',
    quizCounts: {"engineering":18,"biostats":0,"social":0},
    passingScore: 50,
    primary: [
      ['formula-builder', 'Interactive Formula Builder', '/chapter4/formula-builder', []],
      ['introduction', '4.1 Introduction to Descriptive Statistics', '/chapter4/introduction', []],
      ['central-tendency', '4.2 Measures of Central Tendency', '/chapter4/central-tendency', ['introduction']],
      ['variability', '4.3 Measures of Variability', '/chapter4/variability', ['central-tendency']],
      ['exploratory-data-analysis', '4.4 Exploratory Data Analysis', '/chapter4/exploratory-data-analysis', ['variability']],
      ['sampling-distributions', '4.5 Introduction to Sampling Distributions', '/chapter4/sampling-distributions', ['exploratory-data-analysis']],
      ['central-limit-theorem', '4.6 Central Limit Theorem', '/chapter4/central-limit-theorem', ['sampling-distributions']],
      ['advanced-distributions', '4.7 Advanced Distributions', '/chapter4/advanced-distributions', ['central-limit-theorem']],
    ],
    bonus: [

    ],
  },
  {
    number: 5,
    title: 'Chapter 5: Estimation',
    storageKey: 'estimationProgress',
    quizCounts: {"engineering":18,"biostats":0,"social":0},
    passingScore: 50,
    primary: [
      ['formula-builder', 'Interactive Formula Builder', '/chapter5/formula-builder', []],
      ['statistical-inference', '5.1 Statistical Inference', '/chapter5/statistical-inference', []],
      ['confidence-intervals-known', '5.2 Confidence Intervals (σ Known)', '/chapter5/confidence-intervals-known', ['statistical-inference']],
      ['confidence-intervals-practice', '5.2 Practice: Confidence Intervals', '/chapter5/confidence-intervals-practice', ['confidence-intervals-known']],
      ['sample-size', '5.3 Sample Size Determination', '/chapter5/sample-size', ['confidence-intervals-known']],
      ['confidence-intervals-unknown', '5.4 Confidence Intervals (σ Unknown)', '/chapter5/confidence-intervals-unknown', ['confidence-intervals-known']],
      ['proportions', '5.5 Proportion Confidence Intervals', '/chapter5/proportions', ['confidence-intervals-known']],
      ['ci-hypothesis-bridge', 'CI-Hypothesis Testing Connection', '/chapter5/bonus/ci-hypothesis-bridge', ['confidence-intervals-known']],
      ['ci-interpretation', 'CI Interpretation', '/chapter5/bonus/ci-interpretation', ['confidence-intervals-known']],
      ['empirical-rule', 'Empirical Rule Interactive', '/chapter5/bonus/empirical-rule', ['statistical-inference']],
    ],
    bonus: [

    ],
  },
  {
    number: 6,
    title: 'Chapter 6: Hypothesis Testing',
    storageKey: 'hypothesisTestingProgress',
    quizCounts: {"engineering":18,"biostats":0,"social":0},
    passingScore: 50,
    primary: [
      ['formula-builder', 'Interactive Formula Builder', '/chapter6/formula-builder', []],
      ['hypothesis-fundamentals', '6.1 Hypothesis Testing Fundamentals', '/chapter6/hypothesis-fundamentals', []],
      ['types-of-hypotheses', '6.2 Types of Hypotheses', '/chapter6/types-of-hypotheses', ['hypothesis-fundamentals']],
      ['errors-and-power', '6.3 Errors and Power', '/chapter6/errors-and-power', ['types-of-hypotheses']],
      ['test-mean-known-variance', '6.4 Test for a Mean (Known Variance)', '/chapter6/test-mean-known-variance', ['errors-and-power']],
      ['test-mean-unknown-variance', '6.5 Test for a Mean (Unknown Variance)', '/chapter6/test-mean-unknown-variance', ['test-mean-known-variance']],
      ['test-for-proportion', '6.6 Test for a Proportion', '/chapter6/test-for-proportion', ['test-mean-unknown-variance']],
      ['paired-two-sample', '6.7 Paired Two-Sample Tests', '/chapter6/paired-two-sample', ['test-mean-unknown-variance']],
      ['unpaired-two-sample', '6.8 Unpaired Two-Sample Tests', '/chapter6/unpaired-two-sample', ['paired-two-sample']],
      ['difference-two-proportions', '6.9 Difference of Two Proportions', '/chapter6/difference-two-proportions', ['test-for-proportion', 'unpaired-two-sample']],
    ],
    bonus: [
      ['hypothesis-game', '6.1.1 Interactive Hypothesis Testing Game', '/chapter6/hypothesis-game', []],
      ['hypothesis-evidence', '6.1.2 Evidence Accumulation Visualizer', '/chapter6/hypothesis-evidence', ['hypothesis-fundamentals']],
      ['type-error-visualizer', '6.1.3 Type I/II Error Interactive', '/chapter6/type-error-visualizer', ['hypothesis-fundamentals']],
      ['p-value-meaning', '6.1.4 P-Value Deep Dive', '/chapter6/p-value-meaning', ['hypothesis-fundamentals']],
      ['types-hypotheses-interactive', '6.2.2 Interactive Hypothesis Types', '/chapter6/types-hypotheses-interactive', ['types-of-hypotheses']],
    ],
  },
  {
    number: 7,
    title: 'Chapter 7: Linear Regression and Correlation',
    storageKey: 'linearRegressionProgress',
    quizCounts: {"engineering":18,"biostats":0,"social":0},
    passingScore: 50,
    primary: [
      ['formula-builder', 'Interactive Formula Builder', '/chapter7/formula-builder', []],
      ['correlation-coefficient', '7.1 Correlation Coefficient', '/chapter7/correlation-coefficient', []],
      ['simple-linear-regression', '7.2 Simple Linear Regression', '/chapter7/simple-linear-regression', ['correlation-coefficient']],
      ['hypothesis-testing-regression', '7.3 Hypothesis Testing in Regression', '/chapter7/hypothesis-testing-regression', ['simple-linear-regression']],
      ['confidence-prediction-intervals', '7.4 Confidence & Prediction Intervals', '/chapter7/confidence-prediction-intervals', ['hypothesis-testing-regression']],
      ['analysis-of-variance', '7.5 Analysis of Variance (ANOVA)', '/chapter7/analysis-of-variance', ['confidence-prediction-intervals']],
      ['coefficient-of-determination', '7.6 Coefficient of Determination', '/chapter7/coefficient-of-determination', ['analysis-of-variance']],
    ],
    bonus: [

    ],
  },
];

const tabDefinitions = [
  ['foundations', 'chapter1-foundations-progress', true],
  ['probability-dictionary', 'chapter1-probability-dictionary-progress', true],
  ['sample-spaces-events', 'chapter1-sample-spaces-events-progress', false],
  ['ordered-samples', 'chapter1-ordered-samples-progress', false],
  ['unordered-samples', 'chapter1-unordered-samples-progress', false],
  ['conditional-probability', 'chapter1-conditional-probability-progress', true],
  ['bayes-theorem-visualizer', 'chapter1-bayes-theorem-visualizer-progress', false],
];

const sources = [];
const activities = [];

function addChildren(parent, ids, kind) {
  parent.children = ids.map(legacyId => {
    const child = {
      id: `${parent.id}:${legacyId}`,
      legacyId,
      chapterId: parent.chapterId,
      parentId: parent.id,
      kind,
      required: true,
      published: true,
      completionPolicy: 'explicit-study-completion',
      children: [],
    };
    activities.push(child);
    return child;
  });
  parent.completionPolicy = 'all-required-children-or-explicit-study-completion';
}

const chapters = definitions.map(definition => {
  const chapterId = `chapter-${definition.number}`;
  const lessons = ['primary', 'bonus'].flatMap(group => {
    const groupLessons = definition[group].map(([legacyId, title, route, prerequisites]) => ({
      id: `${chapterId}:${legacyId}`,
      legacyId,
      chapterId,
      parentId: chapterId,
      title,
      route,
      routeAliases: [],
      prerequisites: prerequisites.map(id => `${chapterId}:${id}`),
      kind: 'lesson',
      group,
      contentRole: group === 'bonus' || route.includes('/bonus/') ? 'bonus' : 'core',
      required: group === 'primary',
      published: true,
      completionPolicy: 'explicit-study-completion',
      children: [],
    }));
    if (groupLessons.length) {
      sources.push({
        key: group === 'primary' ? definition.storageKey : 'hypothesisTestingBonusProgress',
        kind: 'completion-array',
        containerId: chapterId,
        targetIds: groupLessons.map(lesson => lesson.id),
      });
    }
    return groupLessons;
  });
  activities.push(...lessons);
  return {
    id: chapterId,
    number: definition.number,
    title: definition.title,
    route: `/chapter${definition.number}`,
    published: true,
    lessons,
    quiz: {
      id: `${chapterId}:quiz`,
      route: `/chapter/${definition.number}/quiz`,
      routeAliases: [`/chapter${definition.number}/quiz`],
      passingScore: definition.passingScore,
      questionCounts: definition.quizCounts,
    },
  };
});

for (const [legacyId, key, hasInteractive] of tabDefinitions) {
  const parent = activities.find(activity => activity.id === `chapter-1:${legacyId}`);
  const ids = ['foundations', 'worked-examples', 'quick-reference'];
  if (hasInteractive) ids.push('interactive');
  addChildren(parent, ids, 'tab');
  sources.push({ key, kind: 'completion-array', containerId: parent.id, targetIds: parent.children.map(child => child.id) });
  sources.push({ key: `${key}:active-tab`, kind: 'active-tab', containerId: parent.id, targetIds: parent.children.map(child => child.id) });
}

sources.push(...SECTION_RESUME_SOURCES.map(source => ({ ...source, kind: 'section-resume' })));

const montyHall = activities.find(activity => activity.id === 'chapter-1:monty-hall-masterclass');
addChildren(montyHall, ['intro', 'play', 'proof', 'simulation'], 'stage');
sources.push({ key: 'monty-hall-journey-progress', kind: 'journey', containerId: montyHall.id, targetIds: montyHall.children.map(child => child.id) });

const centralTendency = activities.find(activity => activity.id === 'chapter-4:central-tendency');
addChildren(centralTendency, ['intuitive-intro', 'descriptive-stats-journey', 'descriptive-stats-foundations', 'mathematical-foundations'], 'embedded');
sources.push({ key: 'dataDescriptionsProgress', kind: 'completion-array', containerId: centralTendency.id, targetIds: centralTendency.children.map(child => child.id) });
const descriptiveJourney = centralTendency.children.find(child => child.legacyId === 'descriptive-stats-journey');
addChildren(descriptiveJourney, ['central-tendency', 'dispersion', 'quartiles', 'outliers'], 'stage');
sources.push({ key: 'descriptive-stats-journey-progress', kind: 'journey', containerId: descriptiveJourney.id, targetIds: descriptiveJourney.children.map(child => child.id) });

const lessonBasedApproach = {
  id: 'resource:lesson-based-approach',
  chapterId: null,
  parentId: null,
  kind: 'resource',
  route: '/lesson-based-approach',
  routeAliases: [],
  required: false,
  published: true,
  children: [],
};
activities.push(lessonBasedApproach);
addChildren(lessonBasedApproach, ['introduction', 'sample-spaces', 'events', 'probability-of-events', 'complementary-events', 'summary'], 'section');
for (const child of lessonBasedApproach.children.slice(1, 5)) child.completionPolicy = 'knowledge-check-completion';
// The existing renderer creates a spacer position at the SectionBreak after each quiz.
sources.push({
  key: 'progressive-content-/lesson-based-approach',
  kind: 'progressive-content',
  containerId: lessonBasedApproach.id,
  legacyPositions: [
    lessonBasedApproach.children[0].id,
    lessonBasedApproach.children[1].id, null,
    lessonBasedApproach.children[2].id, null,
    lessonBasedApproach.children[3].id, null,
    lessonBasedApproach.children[4].id, null,
    lessonBasedApproach.children[5].id,
  ],
  quizPositions: [1, 3, 5, 7],
});

chapters.push({ id: 'chapter-8', number: 8, title: 'Chapter 8: Coming Soon', route: '/chapter8', published: false, lessons: [], quiz: null });

function freeze(value) {
  for (const child of Object.values(value)) if (child && typeof child === 'object') freeze(child);
  return Object.freeze(value);
}

export const CURRICULUM = freeze({ revision: CURRICULUM_REVISION, chapters, resources: [lessonBasedApproach] });
export const ACTIVITY_BY_ID = freeze(Object.fromEntries(activities.map(activity => [activity.id, activity])));
export const QUIZ_BY_ID = freeze(Object.fromEntries(chapters.filter(chapter => chapter.quiz).map(chapter => [chapter.quiz.id, chapter.quiz])));
export const LEGACY_PROGRESS_SOURCES = freeze(sources);
export const LEGACY_SOURCE_BY_KEY = freeze(Object.fromEntries(sources.map(source => [source.key, source])));
export const LEGACY_SECTION_SOURCE_BY_CONTAINER = freeze(Object.fromEntries(sources.filter(source => source.kind === 'section-resume').map(source => [source.containerId, source])));
export const LEGACY_STORAGE_KEYS = freeze([
  'probLabProgress', 'probLabProgressMeta',
  ...sources.map(source => source.key),
  ...definitions.map(definition => `${definition.storageKey}_devMode`),
  'hypothesisTestingBonusProgress_devMode', 'centralTendency_devMode',
  'quiz_attempts', 'quiz_best_scores', 'quiz_preferences', 'quiz_current_session',
  'progressive-content-default', 'sidebarOpen',
]);

export function resolveChapterId(value) {
  const id = typeof value === 'number' || typeof value === 'string' ? String(value) : '';
  return chapters.find(chapter => chapter.id === id || String(chapter.number) === id)?.id || null;
}

export function resolveActivityId(chapterId, value) {
  if (typeof value !== 'string') return null;
  const direct = Object.hasOwn(ACTIVITY_BY_ID, value) ? ACTIVITY_BY_ID[value] : null;
  if (direct && direct.chapterId === chapterId) return direct.id;
  return activities.find(activity => activity.chapterId === chapterId && activity.kind === 'lesson' && (activity.legacyId === value || activity.route === value))?.id || null;
}

export function isLegacyStorageKey(key) {
  return typeof key === 'string' && (LEGACY_STORAGE_KEYS.includes(key) || /^tutorial-.+-completed$/.test(key) || key.startsWith('progressive-content-') || key.startsWith('probability:resume:section:'));
}
