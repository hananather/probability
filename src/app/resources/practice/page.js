'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ClipboardList, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';

const chapters = [
  {
    number: 1,
    title: 'Introduction to Probabilities',
    topics: ['Basic Probability', 'Counting Methods', 'Conditional Probability', 'Bayes\' Theorem']
  },
  {
    number: 2,
    title: 'Discrete Random Variables',
    topics: ['Probability Distributions', 'Binomial Distribution', 'Poisson Distribution', 'Expected Value']
  },
  {
    number: 3,
    title: 'Continuous Random Variables',
    topics: ['Normal Distribution', 'Exponential Distribution', 'Central Limit Theorem', 'Z-Scores']
  },
  {
    number: 4,
    title: 'Descriptive Statistics and Sampling',
    topics: ['Measures of Center', 'Measures of Spread', 'Sampling Distributions', 'Data Visualization']
  },
  {
    number: 5,
    title: 'Statistical Inference and Estimation',
    topics: ['Confidence Intervals', 'Margin of Error', 'Sample Size', 'Point Estimation']
  },
  {
    number: 6,
    title: 'Hypothesis Testing',
    topics: ['Null Hypothesis', 'Type I & II Errors', 'P-Values', 'Statistical Power']
  },
  {
    number: 7,
    title: 'Simple Linear Regression',
    topics: ['Correlation', 'Least Squares', 'R-Squared', 'Prediction Intervals']
  }
];

export default function PracticePage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="border-b border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/resources" className="text-neutral-400 hover:text-white transition-colors">
              Resources
            </Link>
            <span className="text-neutral-500">/</span>
            <span className="text-white">Practice Problems</span>
          </nav>
        </div>
      </div>

      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/resources">
            <Button variant="neutral" size="sm" className="mb-6">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Resources
            </Button>
          </Link>
          
          <div className="flex items-center space-x-3 mb-4">
            <ClipboardList className="h-8 w-8 text-teal-400" />
            <h1 className="text-3xl font-bold">Practice Problems</h1>
          </div>
          <p className="text-neutral-400">
            Test your understanding with comprehensive end-of-chapter quizzes for each topic.
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Chapter Quizzes</h2>
          <div className="space-y-4">
            {chapters.map((chapter) => (
              <Link key={chapter.number} href={`/chapter/${chapter.number}/quiz`}>
                <div className="group bg-neutral-800 rounded-lg p-6 border border-neutral-700 hover:border-teal-500/50 transition-all cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-teal-400 font-semibold">Chapter {chapter.number}</span>
                        <CheckCircle className="h-5 w-5 text-neutral-600" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3 group-hover:text-teal-400 transition-colors">
                        {chapter.title}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {chapter.topics.map((topic, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-neutral-700 rounded text-neutral-300">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-neutral-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all mt-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-12 p-6 bg-gradient-to-r from-teal-900/20 to-blue-900/20 rounded-lg border border-neutral-700">
            <h3 className="text-lg font-semibold mb-2">📝 Quiz Features</h3>
            <ul className="text-neutral-300 space-y-1 text-sm">
              <li>• Multiple choice and problem-solving questions</li>
              <li>• Immediate feedback with detailed explanations</li>
              <li>• Track your progress and identify areas for improvement</li>
              <li>• Aligned with chapter learning objectives</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}