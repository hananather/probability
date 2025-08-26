'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, GraduationCap, Target, Clock, Brain } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export default function StudyTipsPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="border-b border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/resources" className="text-neutral-400 hover:text-white transition-colors">
              Resources
            </Link>
            <span className="text-neutral-500">/</span>
            <span className="text-white">Study Tips</span>
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
            <GraduationCap className="h-8 w-8 text-teal-400" />
            <h1 className="text-3xl font-bold">Study Tips & Strategies</h1>
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
              <Target className="h-6 w-6 text-teal-400 mb-3" />
              <h2 className="text-xl font-semibold mb-3">Active Learning</h2>
              <ul className="space-y-2 text-neutral-300">
                <li>• Work through problems yourself before looking at solutions</li>
                <li>• Explain concepts to others or yourself out loud</li>
                <li>• Create your own examples and test cases</li>
              </ul>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
              <Clock className="h-6 w-6 text-purple-400 mb-3" />
              <h2 className="text-xl font-semibold mb-3">Time Management</h2>
              <ul className="space-y-2 text-neutral-300">
                <li>• Study in focused 25-minute blocks with 5-minute breaks</li>
                <li>• Review material within 24 hours of learning</li>
                <li>• Start assignments early to allow time for questions</li>
              </ul>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
              <Brain className="h-6 w-6 text-blue-400 mb-3" />
              <h2 className="text-xl font-semibold mb-3">Understanding Concepts</h2>
              <ul className="space-y-2 text-neutral-300">
                <li>• Focus on understanding &quot;why&quot; not just &quot;how&quot;</li>
                <li>• Connect new concepts to what you already know</li>
                <li>• Use multiple representations: visual, numerical, symbolic</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}