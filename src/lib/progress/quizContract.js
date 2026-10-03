// Quiz snapshots preserve the questions used for a session across later bank edits.
const versions = ['engineering', 'biostats', 'social'];
const record = value => !!value && typeof value === 'object' && !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const id = value => typeof value === 'string' && !['__proto__', 'constructor', 'prototype'].includes(value) && /^[a-zA-Z0-9][a-zA-Z0-9:._-]{0,255}$/.test(value);
const milliseconds = value => Number.isSafeInteger(value) && value >= 0;
const text = (value, limit) => typeof value === 'string' && value.length > 0 && value.length <= limit;
const unique = values => new Set(values).size === values.length;
const copy = value => JSON.parse(JSON.stringify(value));

export function validatePinnedQuizBank(bank) {
  const errors = [];
  if (!record(bank) || !id(bank.revision) || !versions.includes(bank.requestedVersion) || !versions.includes(bank.effectiveVersion)) errors.push('bank:identity');
  if (!Array.isArray(bank?.questions) || bank.questions.length < 1 || bank.questions.length > 200) errors.push('bank:questions');
  const questions = Array.isArray(bank?.questions) ? bank.questions : [];
  if (!unique(questions.map(question => question?.id))) errors.push('bank:duplicate-question');
  for (const question of questions) {
    if (!record(question) || !id(question.id) || !['multiple-choice', 'multi-select'].includes(question.type) || !text(question.question, 20000) || !text(question.explanation, 40000)) errors.push('bank:question');
    if (!Array.isArray(question?.options) || question.options.length < 2 || question.options.length > 20 || question.options.some(option => !text(option, 20000))) errors.push('bank:options');
    const indices = question?.type === 'multi-select' ? question.correct : [question?.correct];
    if (!Array.isArray(indices) || indices.length < 1 || !unique(indices) || indices.some(index => !Number.isInteger(index) || index < 0 || index >= (question?.options?.length || 0))) errors.push('bank:correct');
    for (const field of ['topic', 'difficulty']) if (question?.[field] !== undefined && !text(question[field], 1000)) errors.push(`bank:${field}`);
  }
  return { valid: errors.length === 0, errors };
}

export function gradePinnedAnswer(question, answer) {
  if (question.type === 'multiple-choice') return answer === question.correct;
  return Array.isArray(answer) && answer.length === question.correct.length && question.correct.every(index => answer.includes(index));
}

export function validatePinnedAnswers(bank, answers, startTime = 0) {
  const errors = [];
  if (!record(answers)) return { valid: false, errors: ['answers:object'] };
  const questions = new Map((bank?.questions || []).map(question => [question.id, question]));
  for (const [questionId, answer] of Object.entries(answers)) {
    const question = questions.get(questionId);
    if (!question || !record(answer)) { errors.push(`answers:${questionId}`); continue; }
    const indices = question.type === 'multi-select' ? answer.answer : [answer.answer];
    if (!Array.isArray(indices) || !unique(indices) || indices.some(index => !Number.isInteger(index) || index < 0 || index >= question.options.length)) errors.push(`answers:${questionId}:option`);
    if (!milliseconds(answer.timestamp) || answer.timestamp < startTime) errors.push(`answers:${questionId}:timestamp`);
    if (answer.isCorrect !== undefined && (typeof answer.isCorrect !== 'boolean' || answer.isCorrect !== gradePinnedAnswer(question, answer.answer))) errors.push(`answers:${questionId}:isCorrect`);
  }
  return { valid: errors.length === 0, errors };
}

export function normalizePinnedAnswers(bank, answers) {
  return Object.fromEntries(Object.entries(answers).map(([questionId, answer]) => {
    const question = bank.questions.find(item => item.id === questionId);
    return [questionId, { answer: Array.isArray(answer.answer) ? [...answer.answer].sort((a, b) => a - b) : answer.answer, timestamp: answer.timestamp, isCorrect: gradePinnedAnswer(question, answer.answer) }];
  }));
}

export function validateQuizSession(session) {
  const errors = [];
  if (!record(session) || !id(session.sessionId) || !/^chapter-[1-7]$/.test(session.chapterId || '')) errors.push('session:identity');
  errors.push(...validatePinnedQuizBank(session?.bank).errors);
  const questionIds = Array.isArray(session?.bank?.questions) ? session.bank.questions.map(question => question.id) : [];
  if (!questionIds.includes(session?.currentQuestionId)) errors.push('session:currentQuestionId');
  if (!Array.isArray(session?.flaggedQuestionIds) || !unique(session.flaggedQuestionIds) || session.flaggedQuestionIds.some(questionId => !questionIds.includes(questionId))) errors.push('session:flags');
  if (!milliseconds(session?.startTime) || !milliseconds(session?.deadline) || session.deadline < session.startTime) errors.push('session:time');
  if (typeof session?.isPaused !== 'boolean' || (session.pausedRemaining !== null && (!Number.isSafeInteger(session.pausedRemaining) || session.pausedRemaining < 0))) errors.push('session:pause');
  if (session?.isPaused === true && session.pausedRemaining === null) errors.push('session:pausedRemaining');
  if (validatePinnedQuizBank(session?.bank).valid) errors.push(...validatePinnedAnswers(session.bank, session.answersByQuestionId, session.startTime).errors);
  return { valid: errors.length === 0, errors };
}

export function normalizeQuizSession(session) {
  const result = validateQuizSession(session);
  if (!result.valid) throw new TypeError(`Invalid pinned quiz session: ${result.errors.join(', ')}`);
  return { ...copy(session), answersByQuestionId: normalizePinnedAnswers(session.bank, session.answersByQuestionId) };
}

export function mergeQuizSession(session, patch) {
  if (!record(patch) || Object.keys(patch).some(key => !['currentQuestionId', 'answersByQuestionId', 'flaggedQuestionIds', 'deadline', 'isPaused', 'pausedRemaining'].includes(key))) throw new TypeError('Invalid quiz session patch');
  const answers = { ...session.answersByQuestionId };
  if (patch.answersByQuestionId !== undefined) {
    const validation = validatePinnedAnswers(session.bank, patch.answersByQuestionId, session.startTime);
    if (!validation.valid) throw new TypeError(`Invalid quiz answers: ${validation.errors.join(', ')}`);
    for (const [questionId, answer] of Object.entries(patch.answersByQuestionId)) if (!answers[questionId] || answer.timestamp >= answers[questionId].timestamp) answers[questionId] = copy(answer);
  }
  return normalizeQuizSession({ ...session, ...copy(patch), answersByQuestionId: answers });
}

export function createPinnedQuizAttempt(session, { attemptId, date }) {
  const valid = validateQuizSession(session);
  if (!valid.valid || !id(attemptId) || !Number.isFinite(Date.parse(date)) || Date.parse(date) < session.startTime) throw new TypeError('Invalid quiz finish');
  const answersByQuestionId = normalizePinnedAnswers(session.bank, session.answersByQuestionId);
  const correctAnswers = Object.values(answersByQuestionId).filter(answer => answer.isCorrect).length;
  const totalQuestions = session.bank.questions.length;
  return {
    id: attemptId, sessionId: session.sessionId, chapterId: session.chapterId, date,
    legacy: false, bankRevision: session.bank.revision, requestedVersion: session.bank.requestedVersion,
    effectiveVersion: session.bank.effectiveVersion, orderedQuestionIds: session.bank.questions.map(question => question.id),
    bank: copy(session.bank), answersByQuestionId, score: correctAnswers, correctAnswers,
    totalQuestions, percentage: Math.round(100 * correctAnswers / totalQuestions),
    timeSpent: Math.floor((Date.parse(date) - session.startTime) / 1000),
  };
}

export function validatePinnedQuizAttempt(attempt) {
  const errors = [];
  if (!record(attempt) || attempt.legacy !== false || !id(attempt.sessionId)) errors.push('attempt:identity');
  const bankResult = validatePinnedQuizBank(attempt?.bank);
  errors.push(...bankResult.errors);
  if (attempt?.bankRevision !== attempt?.bank?.revision || attempt?.requestedVersion !== attempt?.bank?.requestedVersion || attempt?.effectiveVersion !== attempt?.bank?.effectiveVersion) errors.push('attempt:bank-identity');
  if (bankResult.valid) {
    if (JSON.stringify(attempt.orderedQuestionIds) !== JSON.stringify(attempt.bank.questions.map(question => question.id))) errors.push('attempt:question-order');
    errors.push(...validatePinnedAnswers(attempt.bank, attempt.answersByQuestionId).errors);
    if (Object.values(record(attempt.answersByQuestionId) ? attempt.answersByQuestionId : {}).some(answer => typeof answer?.isCorrect !== 'boolean')) errors.push('attempt:missing-grade');
    const count = Object.entries(record(attempt.answersByQuestionId) ? attempt.answersByQuestionId : {}).filter(([questionId, answer]) => {
      const question = attempt.bank.questions.find(item => item.id === questionId);
      return question && record(answer) && gradePinnedAnswer(question, answer.answer);
    }).length;
    if (attempt.totalQuestions !== attempt.bank.questions.length || attempt.correctAnswers !== count || attempt.score !== count || attempt.percentage !== Math.round(100 * count / attempt.bank.questions.length)) errors.push('attempt:grade');
  }
  return { valid: errors.length === 0, errors };
}
