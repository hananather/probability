'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Download, Upload } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';
import { CURRICULUM } from '@/lib/curriculum/manifest';
import { selectChapterProgress, selectCourseProgress, selectQuizProgress } from '@/lib/progress/selectors';
import { Button } from '@/components/ui/button';

const saveMessages = {
  loading: 'Loading your saved progress…',
  pending: 'Saving in this browser…',
  persisted: 'Saved in this browser',
  'session-only': 'Your recent changes are only kept for this visit.',
};

export default function LearningProgressPage() {
  const { learningData, loading, persistenceStatus, exportProgress, importProgress, retryLocalPersistence } = useProgress();
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileInput = useRef(null);
  const course = selectCourseProgress(learningData);

  const exportBackup = async () => {
    setBusy(true);
    const success = await exportProgress();
    setMessage({ error: !success, text: success ? 'Your progress backup is ready to download.' : 'We could not create a backup. Try again before closing this page.' });
    setBusy(false);
  };

  const importBackup = async event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ error: true, text: 'This file is too large. Choose a progress backup smaller than 10 MB.' });
      return;
    }
    setBusy(true);
    const success = await importProgress(file);
    setMessage({ error: !success, text: success ? 'Your backup has been added to your progress in this browser.' : 'We could not finish importing this backup. Check your progress below and try again.' });
    setBusy(false);
  };

  const retrySave = async () => {
    setBusy(true);
    const success = await retryLocalPersistence();
    setMessage({ error: !success, text: success ? 'Your progress is saved in this browser.' : 'Saving is still unavailable. Export a backup before closing this page.' });
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="mb-3 text-3xl font-bold text-white">Your learning progress</h1>
        <p className="max-w-3xl leading-relaxed text-neutral-300">
          Keep track of the modules you have studied and the questions you have practised. Completion records reflect the sections you marked as studied; quiz results record performance on those questions.
        </p>
      </div>

      <section aria-labelledby="progress-save-heading" className="rounded-xl border border-neutral-700 bg-neutral-800/40 p-4 sm:p-6">
        <h2 id="progress-save-heading" className="mb-2 text-lg font-semibold text-white">Keep your progress</h2>
        <p role="status" className={persistenceStatus === 'session-only' ? 'font-medium text-amber-200' : 'font-medium text-teal-200'}>
          {saveMessages[persistenceStatus] || saveMessages.loading}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-neutral-300">
          Progress belongs to this browser. Export a backup to keep a copy or move it to another browser. Clearing browser data can remove saved progress. Account sign-in and automatic cross-device saves are not available yet.
        </p>
        {persistenceStatus === 'session-only' && (
          <p className="mt-2 text-sm text-amber-200">Export a backup before closing this page, then try saving again.</p>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="button" variant="secondary" disabled={loading || busy} onClick={exportBackup} className="min-h-11 gap-2">
            <Download className="h-4 w-4" aria-hidden="true" />Export backup
          </Button>
          <Button type="button" variant="secondary" disabled={loading || busy} onClick={() => fileInput.current?.click()} className="min-h-11 gap-2">
            <Upload className="h-4 w-4" aria-hidden="true" />Import backup
          </Button>
          {persistenceStatus === 'session-only' && (
            <Button type="button" disabled={busy} onClick={retrySave} className="min-h-11">Try saving again</Button>
          )}
        </div>
        <input ref={fileInput} type="file" accept=".json,application/json" aria-label="Choose a progress backup" className="hidden" onChange={importBackup} />
        {message && <p role={message.error ? 'alert' : 'status'} className={`mt-3 text-sm ${message.error ? 'text-amber-200' : 'text-teal-200'}`}>{message.text}</p>}
      </section>

      {!loading && (
        <>
          <section aria-labelledby="study-summary-heading" className="rounded-xl border border-neutral-700 bg-neutral-800/40 p-4 sm:p-6">
            <h2 id="study-summary-heading" className="text-xl font-semibold text-white">Study and practice</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-3">
              <div><dt className="text-sm text-neutral-400">Primary modules studied</dt><dd className="mt-1 text-2xl font-semibold text-teal-200">{course.completedLessons} / {course.totalLessons}</dd></div>
              <div><dt className="text-sm text-neutral-400">Chapters studied</dt><dd className="mt-1 text-2xl font-semibold text-white">{course.completedChapters} / {course.totalChapters}</dd></div>
              <div><dt className="text-sm text-neutral-400">Chapter quizzes attempted</dt><dd className="mt-1 text-2xl font-semibold text-white">{course.attemptedQuizzes} / {course.totalQuizzes}</dd></div>
            </dl>
            <p className="mt-4 text-sm leading-relaxed text-neutral-400">Older quiz attempts keep their original scores. Revisit a topic and try the practice questions again to check what you can recall.</p>
          </section>

          <section aria-labelledby="chapter-progress-heading">
            <h2 id="chapter-progress-heading" className="mb-4 text-xl font-semibold text-white">Your chapters</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {CURRICULUM.chapters.filter(chapter => chapter.published).map(chapter => {
                const study = selectChapterProgress(learningData, chapter.id);
                const quiz = selectQuizProgress(learningData, chapter.id);
                return (
                  <article key={chapter.id} className="min-w-0 rounded-xl border border-neutral-700 bg-neutral-800/30 p-4 sm:p-5">
                    <h3 className="mb-3 text-lg font-semibold text-white">{chapter.title}</h3>
                    <p className="text-sm text-neutral-300">Primary modules studied: {study.primary.completed} / {study.primary.total}</p>
                    <progress value={study.primary.completed} max={study.primary.total} aria-label={`${chapter.title} study progress`} className="my-3 h-2 w-full accent-teal-400" />
                    {study.bonus.total > 0 && <p className="text-sm text-neutral-300">Bonus modules studied: {study.bonus.completed} / {study.bonus.total}</p>}
                    <p className="text-sm text-neutral-400">{quiz.attempted ? `Best recorded quiz score: ${quiz.bestScore}%` : 'No quiz result recorded yet'}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button asChild variant="secondary" className="min-h-11 gap-2"><Link href={chapter.route}><BookOpen className="h-4 w-4" aria-hidden="true" />Open chapter {chapter.number}</Link></Button>
                      <Link href={chapter.quiz.route} className="inline-flex min-h-11 items-center rounded px-2 text-sm text-teal-200 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-400">Practice quiz</Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
