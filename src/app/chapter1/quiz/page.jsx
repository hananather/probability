import { ChapterQuiz } from '@/components/quiz/ChapterQuiz';

export const metadata = {
  title: 'Chapter 1 Quiz | Introduction to Probabilities',
  description: 'Test your understanding of probability fundamentals with this comprehensive end-of-chapter quiz.',
};

export default async function Chapter1QuizPage({ searchParams }) {
  // Await searchParams as required in Next.js 15
  const params = await searchParams;
  // Get version from URL params, default to engineering
  const version = params?.version || 'engineering';
  
  return (
    <div className="min-h-screen bg-neutral-950 py-8">
      <div className="container mx-auto px-4">
        <ChapterQuiz chapterId={1} version={version} />
      </div>
    </div>
  );
}