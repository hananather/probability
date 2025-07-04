"use client";

import React from 'react';
import { QuizBreak } from '@/components/mdx/QuizBreak';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestQuizPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Quiz Test Page</h1>
        
        <Card className="bg-neutral-800/50 border-neutral-700 mb-8">
          <CardHeader>
            <CardTitle>Test Quiz 1: Sample Space</CardTitle>
          </CardHeader>
          <CardContent>
            <QuizBreak
              question="What is the sample space when flipping two coins?"
              options={[
                "{H, T}",
                "{HH, HT, TH, TT}",
                "{2H, 1H1T, 2T}",
                "{H, T, H, T}"
              ]}
              correctIndex={1}
              explanation="When flipping two coins, we need to consider all possible combinations: HH (both heads), HT (first heads, second tails), TH (first tails, second heads), and TT (both tails)."
              onComplete={() => console.log('Quiz 1 completed!')}
            />
          </CardContent>
        </Card>

        <Card className="bg-neutral-800/50 border-neutral-700 mb-8">
          <CardHeader>
            <CardTitle>Test Quiz 2: Probability</CardTitle>
          </CardHeader>
          <CardContent>
            <QuizBreak
              question="What is the probability of rolling a prime number (2, 3, 5) on a fair six-sided die?"
              options={[
                "1/6",
                "1/3",
                "1/2",
                "2/3"
              ]}
              correctIndex={2}
              explanation="Prime numbers on a die are {2, 3, 5}, which is 3 outcomes out of 6 total. So P(prime) = 3/6 = 1/2."
              onComplete={() => console.log('Quiz 2 completed!')}
            />
          </CardContent>
        </Card>

        <Card className="bg-neutral-800/50 border-neutral-700">
          <CardHeader>
            <CardTitle>Test Quiz 3: Multiple Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <QuizBreak
              questions={[
                {
                  question: "What is 2 + 2?",
                  options: ["3", "4", "5", "6"],
                  correctIndex: 1,
                  explanation: "Basic addition: 2 + 2 = 4"
                },
                {
                  question: "What is the capital of France?",
                  options: ["London", "Paris", "Berlin", "Madrid"],
                  correctIndex: 1,
                  explanation: "Paris is the capital of France"
                }
              ]}
              onComplete={() => console.log('Multiple quiz completed!')}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 