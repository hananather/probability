# End-of-Chapter Quiz System

## Overview
A comprehensive quiz system for testing student knowledge at the end of each chapter. Features multiple choice and multi-select questions, timer functionality, progress tracking, and localStorage-based persistence.

## Features

### Core Functionality
- **Multiple Question Types**: Single choice and multi-select questions
- **Timer System**: Optional 30-minute timer with pause capability
- **Progress Tracking**: Visual progress bar and question navigation grid
- **Flag for Review**: Mark questions to revisit later
- **Immediate Feedback**: Optional immediate feedback after each question
- **Review Mode**: Review all answers after quiz completion
- **Retake Capability**: Unlimited retakes with best score tracking

### User Experience
- **Question Navigation**: Jump to any question or navigate sequentially
- **Auto-save**: Progress saved to localStorage automatically
- **Resume Session**: Continue incomplete quizzes after page refresh
- **Performance Analytics**: Track attempts, scores, and time spent
- **Study Recommendations**: Get personalized study tips based on performance

### Content Variations
- **Engineering Context**: Default version with engineering examples
- **Biostats Context**: Medical and biological statistics examples
- **Social Science Context**: Social research and survey examples

## Components

### Main Components
- `ChapterQuiz.jsx` - Main quiz wrapper component
- `QuizTimer.jsx` - Timer with warning system
- `QuizProgress.jsx` - Progress tracker and navigation
- `QuizResults.jsx` - Results summary and analytics
- `MultiSelectQuestion.jsx` - Multi-select question handler

### Data Management
- `questionBank.js` - Question database for all chapters
- `quizStorage.js` - localStorage management utilities
- `quizUtils.js` - Helper functions and analytics

## Usage

### Adding Quiz to a Chapter

1. Create a new page route:
```jsx
// src/app/chapterX/quiz/page.jsx
import { ChapterQuiz } from '@/components/quiz/ChapterQuiz';

export default function ChapterXQuizPage({ searchParams }) {
  const version = searchParams?.version || 'engineering';
  return (
    <div className="min-h-screen bg-neutral-950 py-8">
      <div className="container mx-auto px-4">
        <ChapterQuiz chapterId={X} version={version} />
      </div>
    </div>
  );
}
```

2. Add to sidebar navigation:
```js
// src/config/sidebar-chapters.js
{ title: '📝 End of Chapter Quiz', url: '/chapterX/quiz' }
```

### Adding Questions

Edit `src/lib/quiz/questionBank.js`:

```js
{
  id: "ch1-qX",
  type: "multiple-choice", // or "multi-select"
  topic: "1.X Topic Name",
  difficulty: "easy|medium|hard",
  question: "Question text with LaTeX support",
  options: [
    "Option A",
    "Option B",
    "Option C",
    "Option D"
  ],
  correct: 2, // For single choice (0-indexed)
  // OR
  correct: [0, 2], // For multi-select
  explanation: "Detailed explanation shown after answering"
}
```

## Question Bank Structure

### Chapter 1: Introduction to Probabilities (15 questions)
- Sample Spaces & Events (2 questions)
- Set Operations & Venn Diagrams (2 questions)
- Counting Techniques (1 question)
- Ordered Samples (2 questions)
- Unordered Samples (2 questions)
- Basic Probability (2 questions)
- Conditional Probability (2 questions)
- Bayes' Theorem (1 question)
- Independence vs Mutual Exclusivity (1 question)

## LocalStorage Schema

```js
{
  // Quiz attempts by chapter
  "quiz_attempts": {
    "1": [{
      id: "timestamp",
      date: "ISO string",
      score: 12,
      percentage: 80,
      timeSpent: 1200, // seconds
      answers: {...}
    }]
  },
  
  // Best scores
  "quiz_best_scores": {
    "1": 85,
    "2": 92
  },
  
  // User preferences
  "quiz_preferences": {
    showTimer: true,
    immediateFeeback: false,
    version: "engineering"
  },
  
  // Current session (for resume)
  "quiz_current_session": {
    chapterId: 1,
    currentQuestion: 5,
    answers: {...},
    timeRemaining: 1500,
    flaggedQuestions: [2, 7]
  }
}
```

## Best Practices

### Question Writing
- Keep questions clear and unambiguous
- Ensure LaTeX formulas render correctly
- Provide helpful explanations
- Order questions by topic progression
- Mix difficulty levels throughout

### Multi-Select Questions
- Clearly indicate "Select all that apply"
- Ensure at least 2 correct options
- Avoid "None of the above" in multi-select
- Provide comprehensive explanations

### Performance Optimization
- Questions load once at quiz start
- LocalStorage writes are batched
- MathJax processes on-demand
- Timer runs independently

## Future Enhancements

### Planned Features
- [ ] Question randomization option
- [ ] Adaptive difficulty based on performance
- [ ] Export results to PDF
- [ ] Database backend for user authentication
- [ ] Leaderboards and class comparisons
- [ ] Custom quiz creation by instructors
- [ ] More question types (drag-drop, numerical input)
- [ ] Detailed analytics dashboard

### Content Expansion
- [ ] Complete question banks for Chapters 2-7
- [ ] Add more context variations (physics, chemistry, economics)
- [ ] Create practice mode with unlimited attempts
- [ ] Add hints system for struggling students