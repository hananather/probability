'use client';

import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  BookOpen, 
  Calculator,
  ArrowRight,
  RefreshCw,
  Target,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/design-system';

const prerequisites = [
  {
    category: "Basic Algebra",
    topics: [
      { name: "Solving linear equations", essential: true },
      { name: "Working with fractions and decimals", essential: true },
      { name: "Exponents and logarithms", essential: true },
      { name: "Factoring polynomials", essential: false },
      { name: "Inequalities", essential: true }
    ]
  },
  {
    category: "Functions & Graphs",
    topics: [
      { name: "Understanding function notation", essential: true },
      { name: "Plotting points and reading graphs", essential: true },
      { name: "Linear and quadratic functions", essential: false },
      { name: "Exponential functions", essential: true }
    ]
  },
  {
    category: "Basic Calculus (Helpful but not required)",
    topics: [
      { name: "Concept of derivatives", essential: false },
      { name: "Basic integration", essential: false },
      { name: "Finding areas under curves", essential: false }
    ]
  },
  {
    category: "Set Theory",
    topics: [
      { name: "Union and intersection of sets", essential: true },
      { name: "Venn diagrams", essential: true },
      { name: "Set notation", essential: true }
    ]
  },
  {
    category: "Basic Counting",
    topics: [
      { name: "Factorial notation", essential: true },
      { name: "Basic multiplication principle", essential: true },
      { name: "Understanding summation notation (Σ)", essential: true }
    ]
  }
];

const selfAssessmentQuestions = [
  {
    id: 1,
    question: "Can you solve: 3x + 7 = 22?",
    answer: "x = 5",
    hint: "Subtract 7 from both sides, then divide by 3",
    difficulty: "Essential"
  },
  {
    id: 2,
    question: "What is 2³ × 2²?",
    answer: "32 or 2⁵",
    hint: "When multiplying powers with the same base, add the exponents",
    difficulty: "Essential"
  },
  {
    id: 3,
    question: "If A = {1, 2, 3} and B = {2, 3, 4}, what is A ∩ B?",
    answer: "{2, 3}",
    hint: "The intersection contains elements that are in both sets",
    difficulty: "Essential"
  },
  {
    id: 4,
    question: "What is 5! (5 factorial)?",
    answer: "120",
    hint: "5! = 5 × 4 × 3 × 2 × 1",
    difficulty: "Essential"
  },
  {
    id: 5,
    question: "If f(x) = 2x + 3, what is f(4)?",
    answer: "11",
    hint: "Substitute 4 for x in the function",
    difficulty: "Essential"
  }
];

const QuizQuestion = ({ question, index, onAnswer, answered }) => {
  const [showHint, setShowHint] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);

  const checkAnswer = () => {
    const correct = userAnswer.toLowerCase().replace(/\s/g, '') === 
                   question.answer.toLowerCase().replace(/\s/g, '');
    setIsCorrect(correct);
    onAnswer(correct);
  };

  return (
    <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-teal-400">Question {index + 1}</span>
            <span className={cn(
              "text-xs px-2 py-1 rounded-full",
              question.difficulty === "Essential" 
                ? "bg-red-900/50 text-red-400" 
                : "bg-yellow-900/50 text-yellow-400"
            )}>
              {question.difficulty}
            </span>
          </div>
          <p className="text-white text-lg">{question.question}</p>
        </div>
        {isCorrect !== null && (
          <div className="ml-4">
            {isCorrect ? (
              <CheckCircle className="h-6 w-6 text-green-400" />
            ) : (
              <XCircle className="h-6 w-6 text-red-400" />
            )}
          </div>
        )}
      </div>

      {!answered && (
        <div className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Your answer..."
              className="flex-1 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:outline-none focus:border-teal-400"
              onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
            />
            <Button 
              onClick={checkAnswer}
              variant="primary"
              size="sm"
              disabled={!userAnswer.trim()}
            >
              Check
            </Button>
          </div>

          {!showHint && (
            <button
              onClick={() => setShowHint(true)}
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Need a hint?
            </button>
          )}

          {showHint && (
            <div className="p-3 bg-blue-900/20 border border-blue-600/30 rounded text-sm text-blue-300">
              Hint: {question.hint}
            </div>
          )}
        </div>
      )}

      {isCorrect === false && (
        <div className="mt-3 p-3 bg-red-900/20 border border-red-600/30 rounded">
          <p className="text-sm text-red-300">
            Correct answer: {question.answer}
          </p>
        </div>
      )}
    </div>
  );
};

export default function PrerequisitesPage() {
  const [checkedTopics, setCheckedTopics] = useState(new Set());
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizComplete, setQuizComplete] = useState(false);

  const toggleTopic = (category, topic) => {
    const key = `${category}-${topic}`;
    const newChecked = new Set(checkedTopics);
    if (newChecked.has(key)) {
      newChecked.delete(key);
    } else {
      newChecked.add(key);
    }
    setCheckedTopics(newChecked);
  };

  const handleQuizAnswer = (index, correct) => {
    const newAnswers = [...quizAnswers];
    newAnswers[index] = correct;
    setQuizAnswers(newAnswers);
    
    if (newAnswers.filter(a => a !== undefined).length === selfAssessmentQuestions.length) {
      setQuizComplete(true);
    }
  };

  const quizScore = quizAnswers.filter(a => a === true).length;
  const essentialTopicsCount = prerequisites.reduce(
    (acc, cat) => acc + cat.topics.filter(t => t.essential).length, 
    0
  );
  const checkedEssentialCount = prerequisites.reduce(
    (acc, cat) => acc + cat.topics.filter(t => 
      t.essential && checkedTopics.has(`${cat.category}-${t.name}`)
    ).length, 
    0
  );

  const resetQuiz = () => {
    setQuizAnswers([]);
    setQuizComplete(false);
    setQuizStarted(false);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Hero Section */}
      <section className="py-12 px-4 bg-gradient-to-b from-neutral-800 to-neutral-900">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Prerequisites Check</h1>
          <p className="text-xl text-neutral-300">
            Make sure you have the foundation needed to succeed
          </p>
        </div>
      </section>

      {/* Self-Assessment Checklist */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <BookOpen className="h-6 w-6 mr-2 text-teal-400" />
              Self-Assessment Checklist
            </h2>
            <p className="text-neutral-400 mb-6">
              Check off the topics you feel comfortable with. Essential topics are marked in red.
            </p>
            
            {/* Progress Indicator */}
            <div className="bg-neutral-800 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-400">Essential Topics Checked</span>
                <span className="text-sm font-medium text-white">
                  {checkedEssentialCount} / {essentialTopicsCount}
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-teal-400 rounded-full transition-all duration-300"
                  style={{ width: `${(checkedEssentialCount / essentialTopicsCount) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {prerequisites.map((category) => (
              <div key={category.category} className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                <h3 className="text-lg font-semibold mb-4">{category.category}</h3>
                <div className="space-y-2">
                  {category.topics.map((topic) => (
                    <label
                      key={topic.name}
                      className="flex items-center space-x-3 cursor-pointer hover:bg-neutral-700/50 p-2 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={checkedTopics.has(`${category.category}-${topic.name}`)}
                        onChange={() => toggleTopic(category.category, topic.name)}
                        className="w-5 h-5 rounded border-neutral-600 bg-neutral-700 text-teal-400 focus:ring-teal-400"
                      />
                      <span className={cn(
                        "flex-1",
                        checkedTopics.has(`${category.category}-${topic.name}`) && "text-neutral-300"
                      )}>
                        {topic.name}
                      </span>
                      {topic.essential && (
                        <span className="text-xs px-2 py-1 bg-red-900/50 text-red-400 rounded-full">
                          Essential
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Quiz Section */}
      <section className="py-12 px-4 bg-neutral-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center justify-center">
              <Target className="h-6 w-6 mr-2 text-teal-400" />
              Quick Self-Assessment Quiz
            </h2>
            <p className="text-neutral-400">
              Test your readiness with these fundamental questions
            </p>
          </div>

          {!quizStarted ? (
            <div className="text-center">
              <Button 
                onClick={() => setQuizStarted(true)}
                variant="primary"
                size="lg"
              >
                Start Quiz
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {selfAssessmentQuestions.map((question, index) => (
                <QuizQuestion
                  key={question.id}
                  question={question}
                  index={index}
                  onAnswer={(correct) => handleQuizAnswer(index, correct)}
                  answered={quizAnswers[index] !== undefined}
                />
              ))}
              
              {quizComplete && (
                <div className="bg-gradient-to-r from-teal-900/20 to-blue-900/20 rounded-lg p-8 border border-neutral-700 text-center">
                  <h3 className="text-2xl font-bold mb-4">
                    Quiz Complete!
                  </h3>
                  <div className="text-5xl font-bold text-teal-400 mb-4">
                    {quizScore} / {selfAssessmentQuestions.length}
                  </div>
                  <p className="text-neutral-300 mb-6">
                    {quizScore >= 4 
                      ? "Great! You have a strong foundation to start learning."
                      : quizScore >= 3
                      ? "Good start! You might want to review a few topics."
                      : "Consider reviewing the prerequisite materials before starting."}
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button 
                      onClick={resetQuiz}
                      variant="neutral"
                      size="sm"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retake Quiz
                    </Button>
                    <Link href="/chapter1">
                      <Button variant="primary" size="sm">
                        Start Learning
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Need to Review?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
              <Calculator className="h-8 w-8 text-teal-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Khan Academy</h3>
              <p className="text-neutral-400 mb-4">
                Free comprehensive math review covering all prerequisites
              </p>
              <a 
                href="https://www.khanacademy.org/math"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-teal-400 hover:text-teal-300 transition-colors"
              >
                Visit Khan Academy
                <ExternalLink className="h-4 w-4 ml-2" />
                <span className="text-xs text-neutral-500 ml-2">(opens in new tab)</span>
              </a>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
              <BookOpen className="h-8 w-8 text-teal-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Quick Review Sheets</h3>
              <p className="text-neutral-400 mb-4">
                Access our prerequisite review materials
              </p>
              <Link 
                href="/resources/prerequisite-review"
                className="text-teal-400 hover:text-teal-300 transition-colors"
              >
                View Review Materials →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 px-4 bg-neutral-950">
        <div className="max-w-4xl mx-auto text-center">
          <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Remember</h2>
          <p className="text-neutral-300 mb-8 max-w-2xl mx-auto">
            Don&apos;t let prerequisites intimidate you! The platform reviews necessary 
            math concepts as they come up. You can always come back here if you need 
            a refresher.
          </p>
          <Link href="/chapter1">
            <Button size="lg" variant="primary">
              I&apos;m Ready to Start
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}