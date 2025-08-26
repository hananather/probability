'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, BookOpen, Calculator, ExternalLink } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export default function PrerequisiteReviewPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="border-b border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/resources" className="text-neutral-400 hover:text-white transition-colors">
              Resources
            </Link>
            <span className="text-neutral-500">/</span>
            <span className="text-white">Prerequisite Review</span>
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
            <BookOpen className="h-8 w-8 text-teal-400" />
            <h1 className="text-3xl font-bold">Prerequisite Math Review</h1>
          </div>
          <p className="text-neutral-400">
            Review essential mathematical concepts needed for probability and statistics.
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-300 mb-3">Quick Assessment</h2>
            <p className="text-blue-200 mb-4">
              Not sure what you need to review? Take our prerequisite assessment first.
            </p>
            <Link href="/prerequisites">
              <Button variant="primary" size="sm">
                Take Assessment
              </Button>
            </Link>
          </div>

          <div className="space-y-6">
            <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
              <h2 className="text-xl font-semibold mb-4">Essential Topics</h2>
              <ul className="space-y-3 text-neutral-300">
                <li className="flex items-start">
                  <Calculator className="h-4 w-4 text-teal-400 mt-1 mr-2 flex-shrink-0" />
                  <div>
                    <strong>Algebra Fundamentals:</strong> Solving equations, working with exponents, logarithms
                  </div>
                </li>
                <li className="flex items-start">
                  <Calculator className="h-4 w-4 text-teal-400 mt-1 mr-2 flex-shrink-0" />
                  <div>
                    <strong>Set Theory:</strong> Union, intersection, complements, Venn diagrams
                  </div>
                </li>
                <li className="flex items-start">
                  <Calculator className="h-4 w-4 text-teal-400 mt-1 mr-2 flex-shrink-0" />
                  <div>
                    <strong>Functions:</strong> Function notation, domain and range, composition
                  </div>
                </li>
                <li className="flex items-start">
                  <Calculator className="h-4 w-4 text-teal-400 mt-1 mr-2 flex-shrink-0" />
                  <div>
                    <strong>Summation Notation:</strong> Understanding and working with Σ
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
              <h2 className="text-xl font-semibold mb-4">External Resources</h2>
              <p className="text-neutral-400 mb-4">
                These external resources can help you review prerequisite topics:
              </p>
              <a 
                href="https://www.khanacademy.org/math" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-teal-400 hover:text-teal-300 transition-colors"
              >
                Khan Academy - Free Math Courses
                <ExternalLink className="h-4 w-4 ml-2" />
                <span className="text-xs text-neutral-500 ml-2">(opens in new tab)</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}