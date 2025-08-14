'use client';

import Link from 'next/link';
import BackToHub from '@/components/ui/BackToHub';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Calculator, 
  BarChart, 
  BookOpen, 
  Target,
  Brain
} from 'lucide-react';

export default function NormalDistributionsHub() {
  const sections = [
    {
      title: "Z-Score Explorer",
      description: "Interactive exploration of normal distributions and z-score transformations",
      icon: <TrendingUp className="w-6 h-6" />,
      href: "/chapter3/normal-distributions/z-score-explorer",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Empirical Rule (68-95-99.7)",
      description: "Visualize the famous 68-95-99.7 rule for normal distributions",
      icon: <BarChart className="w-6 h-6" />,
      href: "/chapter3/normal-distributions/empirical-rule",
      color: "from-emerald-500 to-emerald-600"
    },
    {
      title: "Practice Problems",
      description: "Test your understanding with normal distribution practice problems",
      icon: <Brain className="w-6 h-6" />,
      href: "/chapter3/normal-distributions/practice-problems",
      color: "from-pink-500 to-pink-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 to-neutral-900">
      <BackToHub chapter={3} />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Normal Distributions
          </h1>
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
            Master the normal distribution, z-scores, and probability calculations through interactive visualizations
          </p>
          <p className="text-sm text-neutral-400 mt-4">
            Note: Looking for z-table lookups? See{' '}
            <Link href="/chapter6/test-mean-known-variance" className="text-blue-400 hover:text-blue-300 underline">
              Chapter 6.4: Hypothesis Testing with Known σ
            </Link>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, index) => (
            <Link href={section.href} key={index}>
              <Card className="h-full bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center mb-4`}>
                    {section.icon}
                  </div>
                  <CardTitle className="text-white text-xl">
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-400">
                    {section.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}