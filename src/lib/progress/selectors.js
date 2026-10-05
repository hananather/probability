import { ACTIVITY_BY_ID, CURRICULUM, resolveChapterId } from '@/lib/curriculum/manifest';
import { isFiniteNumber, isRecord } from './schema';

/** Study completion is distinct from any claim of long-term mastery. */
export function isActivityCompleted(progress, activityId) {
  const activity = Object.hasOwn(ACTIVITY_BY_ID, activityId) ? ACTIVITY_BY_ID[activityId] : null;
  if (!activity) return false;
  const evidence = progress?.activities?.[activityId]?.evidence;
  if (Array.isArray(evidence) && evidence.some(item => item?.kind === 'study-completed' || (item?.kind === 'knowledge-check-completed' && activity.completionPolicy === 'knowledge-check-completion'))) return true;
  const requiredChildren = activity.children.filter(child => child.required && child.published);
  return requiredChildren.length > 0 && requiredChildren.every(child => isActivityCompleted(progress, child.id));
}

function groupProgress(progress, lessons) {
  const total = lessons.length;
  const completed = lessons.filter(lesson => isActivityCompleted(progress, lesson.id)).length;
  return { completed, total, percentage: total ? Math.round(completed / total * 100) : 0 };
}

function hasStudyEvidence(progress, activity) {
  return isActivityCompleted(progress, activity.id) || activity.children.some(child => hasStudyEvidence(progress, child));
}

export function selectChapterProgress(progress, chapterValue) {
  const id = resolveChapterId(chapterValue);
  const chapter = CURRICULUM.chapters.find(item => item.id === id);
  if (!chapter) return null;
  const primary = groupProgress(progress, chapter.lessons.filter(lesson => lesson.published && lesson.required));
  const bonus = groupProgress(progress, chapter.lessons.filter(lesson => lesson.published && lesson.group === 'bonus'));
  const legacyStatus = progress?.chaptersLegacy?.[id]?.status || null;
  const started = primary.completed > 0 || bonus.completed > 0 || ['in_progress', 'completed'].includes(legacyStatus) || chapter.lessons.some(lesson => hasStudyEvidence(progress, lesson));
  return {
    chapterId: id,
    published: chapter.published,
    primary,
    bonus,
    legacyStatus,
    status: chapter.published && primary.total > 0 && primary.completed === primary.total ? 'completed' : started ? 'in_progress' : 'not_started',
  };
}

export function selectQuizProgress(progress, chapterValue) {
  const chapterId = resolveChapterId(chapterValue);
  const chapter = CURRICULUM.chapters.find(item => item.id === chapterId);
  if (!chapter?.quiz) return null;
  const attempts = Object.values(isRecord(progress?.quizAttempts) ? progress.quizAttempts : {}).filter(attempt => attempt?.chapterId === chapterId);
  const scores = attempts.map(attempt => attempt.percentage).filter(score => isFiniteNumber(score, 0, 100));
  const legacyBestScore = progress?.legacyBestScores?.[chapterId]?.percentage;
  const bestScore = Math.max(0, ...scores, ...(isFiniteNumber(legacyBestScore, 0, 100) ? [legacyBestScore] : []));
  const attempted = attempts.length > 0 || isFiniteNumber(legacyBestScore, 0, 100);
  return { chapterId, attemptCount: attempts.length, attempted, bestScore, legacyBestScore: isFiniteNumber(legacyBestScore, 0, 100) ? legacyBestScore : null, passingScore: chapter.quiz.passingScore, passed: attempted && bestScore >= chapter.quiz.passingScore };
}

export function selectCourseProgress(progress) {
  const chapters = CURRICULUM.chapters.filter(chapter => chapter.published).map(chapter => selectChapterProgress(progress, chapter.id));
  const completedLessons = chapters.reduce((total, chapter) => total + chapter.primary.completed, 0);
  const totalLessons = chapters.reduce((total, chapter) => total + chapter.primary.total, 0);
  const quizzes = chapters.map(chapter => selectQuizProgress(progress, chapter.chapterId));
  return {
    totalChapters: chapters.length,
    completedChapters: chapters.filter(chapter => chapter.status === 'completed').length,
    inProgressChapters: chapters.filter(chapter => chapter.status === 'in_progress').length,
    completedLessons,
    totalLessons,
    percentage: totalLessons ? Math.round(completedLessons / totalLessons * 100) : 0,
    attemptedQuizzes: quizzes.filter(quiz => quiz.attempted).length,
    passedQuizzes: quizzes.filter(quiz => quiz.passed).length,
    totalQuizzes: quizzes.length,
  };
}
