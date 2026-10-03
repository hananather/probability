import { describe, expect, it } from 'vitest';
import { chapterQuestions } from '@/lib/quiz/questionBank';

const questions = Object.values(chapterQuestions).flatMap(chapter =>
  Object.values(chapter).filter(Array.isArray).flat()
);
const byId = new Map(questions.map(question => [question.id, question]));

function selectedOption(id) {
  const question = byId.get(id);
  expect(question, `Question ${id} must exist`).toBeDefined();
  expect(typeof question.correct).toBe('number');
  return question.options[question.correct];
}

function numberInOption(option) {
  return Number(option.replaceAll(',', '').match(/-?\d+(?:\.\d+)?/)[0]);
}

// Closed-form reference calculations, independent of the site's distribution utilities.
const numericReferences = [
  ['ch1-q3', 5 * 3, 12],
  ['ch1-q4', 10 ** 4, 12],
  ['ch1-q5', 10 * 9 * 8, 12],
  ['ch1-q6', 10 * 9 * 8 / 6, 12],
  ['ch1-q8', 0.8 ** 2, 12],
  ['ch1-q9', 0.6 + 0.5 - 0.3, 12],
  ['ch1-q10', 0.7 * 0.9, 12],
  ['ch1-q11', 0.4, 12],
  ['ch1-q12', 0.95 * 0.02 / (0.95 * 0.02 + 0.02 * 0.98), 3],
  ['ch1-q13', 100 * (0.5 * 0.02 + 0.3 * 0.03 + 0.2 * 0.01), 12],
  ['ch2-q2', 2 * 5 + 3, 12],
  ['ch2-q3', 10 * 0.3, 12],
  ['ch2-q5', 0.7 - 0.3, 12],
  ['ch2-q6', 190 * 0.05 ** 2 * 0.95 ** 18, 3],
  ['ch2-q7', 1 / 0.1, 12],
  ['ch2-q9', 3 ** 2 * Math.exp(-3) / 2, 3],
  ['ch2-q10', 3 / 0.8, 12],
  ['ch2-q12', 20 - 4 ** 2, 12],
  ['ch2-q13', 4 ** 4 * Math.exp(-4) / 24, 3],
  ['ch2-q16', 84 * 0.3 ** 4 * 0.7 ** 6, 3],
  ['ch2-q18', 0.97 ** 4 * 0.03, 4],
  ['ch3-q2', (1.5 ** 2 - 0.5 ** 2) / 4, 12],
  ['ch3-q3', 3 / 4, 12],
  ['ch3-q5', 0.5, 12],
  ['ch3-q6', 68.26894921370859, 0],
  ['ch3-q8', 1 / 0.1, 12],
  ['ch3-q12', 0.5 ** 2, 12],
  ['ch3-q18', 0.2 * 1.959963984540054, 3],
  ['ch3-b-q2', 68.26894921370859, 0],
  ['ch3-s-q2', 68.26894921370859, 0],
  ['ch3-s-q3', 1 / 0.2, 12],
  ['ch4-q1', (20 + 20) / 2, 12],
  ['ch4-q16', 0.0062096653257761375, 4],
  ['ch4-q18', 68.26894921370859, 0],
  ['ch5-q6', 95.44997361036416, 2],
  ['ch5-q7', 1.959963984540054, 2],
  ['ch5-q10', Math.ceil((1.96 * 100 / 10) ** 2), 12],
  ['ch6-q5', (10.5 - 10) / (2 / Math.sqrt(36)), 12],
  ['ch6-q11', 430 / 700, 3],
  ['ch6-q12', 1 - 0.2, 12],
  ['ch7-q7', Math.round((74.28 + 14.95 * 1.5) * 100) / 100, 2],
  ['ch7-q18', 51.27 + 15.34 * 12, 2],
];

describe('question bank integrity', () => {
  it('preserves unique identifiers and valid answer keys for every context', () => {
    const baselineIds = [
      ...Array.from({ length: 15 }, (_, i) => `ch1-q${i + 1}`),
      ...Array.from({ length: 6 }, (_, i) => i + 2).flatMap(chapter =>
        Array.from({ length: 18 }, (_, i) => `ch${chapter}-q${i + 1}`)
      ),
      'ch1-b-q1', 'ch1-s-q1',
      ...['b', 's'].flatMap(context => Array.from({ length: 3 }, (_, i) => `ch3-${context}-q${i + 1}`)),
    ];
    expect([...byId.keys()]).toEqual(expect.arrayContaining(baselineIds));
    expect(byId.size).toBe(questions.length);
    for (const question of questions) {
      expect(question.question.trim().length, question.id).toBeGreaterThan(0);
      expect(question.explanation.trim().length, question.id).toBeGreaterThan(0);
      expect(new Set(question.options.map(option => option.trim())).size, question.id).toBe(question.options.length);
      const answers = Array.isArray(question.correct) ? question.correct : [question.correct];
      expect(answers.length, question.id).toBeGreaterThan(0);
      expect(new Set(answers).size, question.id).toBe(answers.length);
      for (const answer of answers) {
        expect(Number.isInteger(answer), question.id).toBe(true);
        expect(answer, question.id).toBeGreaterThanOrEqual(0);
        expect(answer, question.id).toBeLessThan(question.options.length);
      }
    }
  });

  it.each(numericReferences)('%s matches its independently derived numeric answer', (id, expected, precision) => {
    expect(numberInOption(selectedOption(id))).toBeCloseTo(expected, precision);
  });

  it('calculates the standard deviation of a difference using both variances', () => {
    const approximation = Number(selectedOption('ch4-q12').split('≈')[1].trim());
    expect(approximation).toBeCloseTo(Math.sqrt(4 / 25 + 4 / 36), 3);
  });

  it('uses the continuous-density moments for the triangular variance example', () => {
    const [numerator, denominator] = selectedOption('ch3-q16').split('/').map(Number);
    expect(numerator / denominator).toBeCloseTo(1 / 2 - (2 / 3) ** 2, 12);
  });

  it.each([
    ['ch5-q8', 375.2, 1.96 * 72 / Math.sqrt(64), 2],
    ['ch5-q14', 5.01, 2.306004135204166 * 0.97 / Math.sqrt(9), 2],
    ['ch5-q17', 0.52, 1.96 * Math.sqrt(0.52 * 0.48 / 1000), 3],
  ])('%s has independently calculated confidence interval endpoints', (id, center, margin, precision) => {
    const endpoints = selectedOption(id).match(/-?\d+(?:\.\d+)?/g).map(Number);
    expect(endpoints).toHaveLength(2);
    expect(endpoints[0]).toBeCloseTo(center - margin, precision);
    expect(endpoints[1]).toBeCloseTo(center + margin, precision);
  });
});
