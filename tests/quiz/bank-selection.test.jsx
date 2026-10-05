import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { chapterQuestions, getChapterQuestions, isQuizVersion, QUIZ_BANK_REVISION } from '@/lib/quiz/questionBank';
import DynamicQuizPage from '@/app/chapter/[chapterId]/quiz/page';
import Chapter1QuizPage from '@/app/chapter1/quiz/page';
import { validatePinnedQuizBank } from '@/lib/progress/quizContract';

vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('NOT_FOUND'); } }));
vi.mock('@/components/quiz/ChapterQuiz', () => ({ ChapterQuiz: props => <div {...props} /> }));

function quizProps(page) { return page.props.children.props.children.props; }

describe('quiz version selection and pin metadata', () => {
  it.each(Array.from({ length: 7 }, (_, index) => index + 1))('pins all three real variants and their actual fallback for chapter %s', chapter => {
    for (const version of ['engineering', 'biostats', 'social']) {
      const data = getChapterQuestions(chapter, version);
      const effective = chapterQuestions[chapter][version]?.length ? version : 'engineering';
      expect(data.requestedVersion).toBe(version);
      expect(data.effectiveVersion).toBe(effective);
      expect(data.bankRevision).toBe(QUIZ_BANK_REVISION);
      expect(data.questions).toEqual(chapterQuestions[chapter][effective]);
      expect(validatePinnedQuizBank({ revision: data.bankRevision, requestedVersion: version, effectiveVersion: effective, questions: data.questions }).valid).toBe(true);
    }
  });
  it.each(['', 'unexpected', '__proto__', ['engineering', 'social'], null])('rejects an unsupported version (%j)', value => {
    expect(isQuizVersion(value)).toBe(false);
    expect(getChapterQuestions(1, value)).toBeNull();
  });
  it.each([0, 8, 1.5, '__proto__', 'constructor'])('rejects an unsupported chapter (%s)', value => {
    expect(getChapterQuestions(value)).toBeNull();
  });
  it.each([DynamicQuizPage, Chapter1QuizPage])('validates server query values without coercing array or unknown variants (%#)', async Page => {
    await expect(Page({ params: Promise.resolve({ chapterId: '1' }), searchParams: Promise.resolve({ version: ['engineering', 'social'] }) })).rejects.toThrow('NOT_FOUND');
    await expect(Page({ params: Promise.resolve({ chapterId: '1' }), searchParams: Promise.resolve({ version: 'unexpected' }) })).rejects.toThrow('NOT_FOUND');
    expect(quizProps(await Page({ params: Promise.resolve({ chapterId: '1' }), searchParams: Promise.resolve({}) })).version).toBe('engineering');
    expect(quizProps(await Page({ params: Promise.resolve({ chapterId: '1' }), searchParams: Promise.resolve({ version: 'biostats' }) })).version).toBe('biostats');
  });
});
