import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ACTIVITY_BY_ID, CURRICULUM, CURRICULUM_METADATA, LEGACY_PROGRESS_SOURCES, LEGACY_STORAGE_KEYS, isLegacyStorageKey, resolveActivityId, resolveChapterId } from '@/lib/curriculum/manifest';
import { chapterQuestions } from '@/lib/quiz/questionBank';
import { HUB_FIXTURES, TAB_FIXTURES } from './fixtures';

const hubFiles = [
  '01-introduction-to-probabilities/1-0-IntroductionToProbabilitiesHub.jsx',
  '02-discrete-random-variables/2-0-DiscreteRandomVariablesHub.jsx',
  '03-continuous-random-variables/3-0-ContinuousDistributionsHub.jsx',
  '04-descriptive-statistics-sampling/4-0-DescriptiveStatisticsHub.jsx',
  '05-estimation/5-0-EstimationHub.jsx',
  '06-hypothesis-testing/6-0-HypothesisTestingHub.jsx',
  '07-linear-regression/7-0-LinearRegressionHub.jsx',
];

describe('canonical curriculum manifest', () => {
  it('preserves every hub ID and route against the current source', () => {
    for (let index = 0; index < hubFiles.length; index++) {
      const source = readFileSync(`src/components/${hubFiles[index]}`, 'utf8');
      const arrays = source.match(new RegExp(`const CHAPTER_${index + 1}_SECTIONS = \\[([\\s\\S]*?)^\\];`, 'm'))[1];
      const ids = [...arrays.matchAll(/id: '([^']+)'/g)].map(match => match[1]);
      const routes = [...arrays.matchAll(/route: '([^']+)'/g)].map(match => match[1]);
      const lessons = CURRICULUM.chapters[index].lessons.filter(lesson => lesson.group === 'primary');
      expect(lessons.map(lesson => lesson.legacyId)).toEqual(ids);
      expect(lessons.map(lesson => lesson.route)).toEqual(routes);
    }
  });

  it('matches independently enumerated hub and tab aliases', () => {
    for (const [key, ids] of Object.entries({ ...HUB_FIXTURES, ...TAB_FIXTURES })) {
      const source = LEGACY_PROGRESS_SOURCES.find(item => item.key === key);
      expect(source.targetIds.map(id => ACTIVITY_BY_ID[id].legacyId)).toEqual(ids);
    }
    const bonusSource = readFileSync('src/components/06-hypothesis-testing/6-0-HypothesisTestingHub.jsx', 'utf8').match(/const BONUS_COMPONENTS = \[([\s\S]*?)^\];/m)[1];
    expect(CURRICULUM.chapters[5].lessons.filter(lesson => lesson.group === 'bonus').map(lesson => lesson.route)).toEqual([...bonusSource.matchAll(/route: '([^']+)'/g)].map(match => match[1]));
  });

  it('has stable unique IDs, valid prerequisites, preserved groups and a placeholder chapter', () => {
    const ids = Object.keys(ACTIVITY_BY_ID);
    expect(new Set(ids).size).toBe(ids.length);
    for (const chapter of CURRICULUM.chapters) {
      for (const lesson of chapter.lessons) {
        expect(lesson.id).toBe(`${chapter.id}:${lesson.legacyId}`);
        for (const prerequisite of lesson.prerequisites) expect(ACTIVITY_BY_ID[prerequisite]).toBeDefined();
      }
    }
    expect(CURRICULUM.chapters[4].lessons.filter(lesson => lesson.contentRole === 'bonus')).toHaveLength(3);
    expect(CURRICULUM.chapters[4].lessons.every(lesson => lesson.required)).toBe(true);
    expect(CURRICULUM.chapters[5].lessons.filter(lesson => !lesson.required)).toHaveLength(5);
    expect(CURRICULUM.chapters[7]).toMatchObject({ published: false, lessons: [], quiz: null });
    expect(Object.isFrozen(ACTIVITY_BY_ID['chapter-1:foundations'].children)).toBe(true);
  });

  it('exposes verified counts without importing question text into the manifest', () => {
    expect(CURRICULUM_METADATA).toEqual({ publishedChapters: 7, primaryHubLessons: 66, chapterSixBonusLessons: 5, formulaBuilders: 7, engineeringQuizQuestions: 123, alternateQuizQuestions: 8 });
    const published = CURRICULUM.chapters.filter(chapter => chapter.published);
    expect(CURRICULUM_METADATA.publishedChapters).toBe(published.length);
    expect(CURRICULUM_METADATA.primaryHubLessons).toBe(published.flatMap(chapter => chapter.lessons.filter(lesson => lesson.required)).length);
    expect(CURRICULUM_METADATA.chapterSixBonusLessons).toBe(CURRICULUM.chapters[5].lessons.filter(lesson => lesson.group === 'bonus').length);
    expect(CURRICULUM_METADATA.formulaBuilders).toBe(published.flatMap(chapter => chapter.lessons.filter(lesson => lesson.legacyId === 'formula-builder')).length);
    expect(CURRICULUM_METADATA.engineeringQuizQuestions).toBe(published.reduce((total, chapter) => total + chapter.quiz.questionCounts.engineering, 0));
    expect(CURRICULUM_METADATA.alternateQuizQuestions).toBe(published.reduce((total, chapter) => total + chapter.quiz.questionCounts.biostats + chapter.quiz.questionCounts.social, 0));
    for (const chapter of CURRICULUM.chapters.filter(item => item.published)) {
      const bank = chapterQuestions[chapter.number];
      expect(chapter.quiz.passingScore).toBe(bank.passingScore);
      for (const version of ['engineering', 'biostats', 'social']) expect(chapter.quiz.questionCounts[version]).toBe(bank[version]?.length || 0);
    }
    expect(readFileSync('src/lib/curriculum/manifest.js', 'utf8')).not.toMatch(/import .*questionBank/);
  });

  it('resolves aliases without equating ambiguous tab IDs or inherited properties', () => {
    expect(resolveChapterId(1)).toBe('chapter-1');
    expect(resolveChapterId('1')).toBe('chapter-1');
    expect(resolveChapterId('chapter-1')).toBe('chapter-1');
    expect(resolveChapterId('chapter-999')).toBeNull();
    expect(resolveActivityId('chapter-1', '/chapter1/01-foundations')).toBe('chapter-1:foundations');
    expect(resolveActivityId('chapter-1', 'worked-examples')).toBeNull();
    expect(resolveActivityId('chapter-1', '1-0')).toBeNull();
    expect(resolveActivityId('chapter-1', 'constructor')).toBeNull();
    expect(new Set(LEGACY_STORAGE_KEYS).size).toBe(LEGACY_STORAGE_KEYS.length);
    expect(isLegacyStorageKey('tutorial-new-widget-completed')).toBe(true);
    expect(isLegacyStorageKey('probability:resume:section:/chapter1/01-foundations:foundations')).toBe(true);
    expect(isLegacyStorageKey('analytics_session_id')).toBe(false);
    expect(isLegacyStorageKey('unrelated_access_token')).toBe(false);
  });
});
