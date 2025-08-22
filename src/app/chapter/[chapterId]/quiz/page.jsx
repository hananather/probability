import { ChapterQuiz } from '@/components/quiz/ChapterQuiz';
import { notFound } from 'next/navigation';

// Chapter titles for metadata
const chapterTitles = {
  1: "Introduction to Probabilities",
  2: "Discrete Random Variables", 
  3: "Continuous Random Variables",
  4: "Descriptive Statistics and Sampling",
  5: "Statistical Inference and Estimation",
  6: "Hypothesis Testing",
  7: "Simple Linear Regression"
};

// Generate metadata dynamically based on chapter
export async function generateMetadata({ params }) {
  const { chapterId } = await params;
  const chapterNum = parseInt(chapterId);
  
  if (!chapterTitles[chapterNum]) {
    return {
      title: 'Quiz Not Found',
      description: 'This quiz is not available.'
    };
  }
  
  return {
    title: `Chapter ${chapterNum} Quiz | ${chapterTitles[chapterNum]}`,
    description: `Test your understanding of ${chapterTitles[chapterNum]} with this comprehensive end-of-chapter quiz.`
  };
}

// Main quiz page component
export default async function DynamicQuizPage({ params, searchParams }) {
  // Await params as required in Next.js 15
  const { chapterId } = await params;
  const search = await searchParams;
  
  // Get version from URL params, default to engineering
  const version = search?.version || 'engineering';
  
  // Convert string to number and validate
  const chapterNum = parseInt(chapterId);
  
  // Validate chapter number (1-7 are valid)
  if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > 7) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-neutral-950 py-8">
      <div className="container mx-auto px-4">
        <ChapterQuiz chapterId={chapterNum} version={version} />
      </div>
    </div>
  );
}

// Pre-generate static pages for chapters 2-7 at build time
// (Chapter 1 keeps its existing route for now)
export function generateStaticParams() {
  // Generate for chapters 2-7 (skip 1 as it has its own route)
  return [2, 3, 4, 5, 6, 7].map(id => ({
    chapterId: id.toString()
  }));
}