'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import BackToHub from '@/components/ui/BackToHub';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Chapter6ReferenceSheet } from '@/components/reference-sheets/Chapter6ReferenceSheet';
import { 
  Calculator, 
  BookOpen,
  BarChart,
  Table
} from 'lucide-react';

const TestForMeanKnownVariance = dynamic(
  () => import('@/components/06-hypothesis-testing/6-4-1-TestForMeanKnownVariance'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);

export default function TestMeanKnownVariancePage() {
  const sections = [
    {
      title: "Critical Values & Z-Tables",
      description: "Learn how to read and use z-tables to find critical values for hypothesis testing",
      icon: <BookOpen className="w-6 h-6" />,
      href: "/chapter6/test-mean-known-variance/z-table-education",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Interactive Z-Table Explorer",
      description: "Find critical values and p-values for hypothesis testing with known σ",
      icon: <Table className="w-6 h-6" />,
      href: "/chapter6/test-mean-known-variance/z-table-explorer",
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <>
      <Chapter6ReferenceSheet mode="floating" />
      <BackToHub chapter={6} />
      
      <div className="space-y-8">
        {/* Main Component */}
        <TestForMeanKnownVariance />
        
        {/* Z-Table Tools Section */}
        <div className="mt-12 pt-8 border-t border-neutral-700">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Z-Table Tools</h2>
            <p className="text-neutral-300">
              Essential tools for finding critical values and understanding z-tests
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Prerequisite: Review{' '}
              <Link href="/chapter3/normal-distributions" className="text-blue-400 hover:text-blue-300 underline">
                normal distributions and z-scores
              </Link>{' '}
              from Chapter 3
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
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
    </>
  );
}