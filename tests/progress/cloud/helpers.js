import { createEmptyProgress } from '@/lib/progress/schema';
import { createPinnedQuizAttempt } from '@/lib/progress/quizContract';
import { captureCloudWriteContext, createCloudMutation, createEmptyCloudDocument } from '@/lib/progress/cloud/schema';
import { applyCloudMutation } from '@/lib/progress/cloud/reducer';
import { quizSession, START } from '../store/typed-fixtures';

export const ACCOUNT_A = 'account:11111111-1111-4111-8111-111111111111';
export const ACCOUNT_B = 'account:22222222-2222-4222-8222-222222222222';
export const ACTIVITY = 'chapter-1:foundations:foundations';
export const OTHER_ACTIVITY = 'chapter-2:random-variables';
export const PARENT = 'chapter-1:foundations';
export const DATE = '2026-10-03T12:00:00.000Z';
export const copy = value => JSON.parse(JSON.stringify(value));
export const uuid = index => `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`;
let sequence = 0;
export function document(ownerScope = ACCOUNT_A) { return createEmptyCloudDocument({ ownerScope }); }
export function mutation(doc, type, payload, options = {}) {
  return createCloudMutation({ id: options.id || uuid(++sequence), deviceId: options.deviceId || 'device-one', type, payload, context: options.context || captureCloudWriteContext(doc, options.containerId ?? null) });
}
export const reduce = (doc, operation) => applyCloudMutation(doc, operation, { verifiedOwnerScope: doc.ownerScope });
export const complete = (doc, activityId = ACTIVITY, options) => mutation(doc, 'complete', { activityId, kind: 'study-completed', sourceKey: 'shared-lesson', completedAt: DATE }, options);
export const reset = (doc, scope, targetId = null, options) => mutation(doc, 'reset', { scope, targetId }, options);
export function pinnedAttempt(overrides = {}) {
  const session = quizSession({ answersByQuestionId: { 'ch1-q1': { answer: 1, timestamp: START + 1000 }, 'ch1-q2': { answer: [0, 1], timestamp: START + 2000 } }, ...overrides });
  return createPinnedQuizAttempt(session, { attemptId: 'attempt-one', date: DATE });
}
export function guest() {
  const snapshot = createEmptyProgress({ ownerScope: 'guest:original-device', deviceId: 'original-device' });
  snapshot.activities[ACTIVITY] = { activityId: ACTIVITY, generation: 0, evidence: [{ kind: 'study-completed', sourceKey: 'chapter1-foundations-progress', completedAt: null }] };
  snapshot.chaptersLegacy['chapter-1'] = { status: 'completed', progress: 100, timeSpent: 100, completedAt: null };
  snapshot.quizAttempts['attempt-one'] = pinnedAttempt();
  snapshot.legacyBestScores['chapter-2'] = { percentage: 95, sourceKey: 'quiz_best_scores' };
  snapshot.preferences.quiz = { showTimer: false, immediateFeedback: true, version: 'social' };
  return snapshot;
}
