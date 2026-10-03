export const START = Date.parse('2026-10-03T11:50:00.000Z');
export const BANK = {
  revision: 'bank-2026-10-03.1', requestedVersion: 'social', effectiveVersion: 'engineering',
  questions: [
    { id: 'ch1-q1', type: 'multiple-choice', question: 'What is P(certain event)?', options: ['0', '1'], correct: 1, explanation: 'The certain event contains all possible outcomes.', topic: 'Probability axioms', difficulty: 'easy' },
    { id: 'ch1-q2', type: 'multi-select', question: 'Which probabilities are allowed?', options: ['0', '1', '2'], correct: [0, 1], explanation: 'Probabilities belong to the interval [0,1].' },
  ],
};
export const answer = (value, timestamp = START + 1000) => ({ answer: value, timestamp });
export const quizSession = (overrides = {}) => ({ sessionId: 'session-one', chapterId: 'chapter-1', bank: BANK, currentQuestionId: 'ch1-q1', answersByQuestionId: {}, flaggedQuestionIds: [], startTime: START, deadline: START + 1800000, isPaused: false, pausedRemaining: null, ...overrides });
