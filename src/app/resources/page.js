'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Calculator, 
  BookOpen, 
  GraduationCap,
  ArrowRight,
  ClipboardList
} from 'lucide-react';
import { Button } from '../../components/ui/button';

const resources = [
  {
    icon: GraduationCap,
    title: 'Study Tips',
    description: 'Strategies for learning probability and statistics effectively.',
    link: '/resources/study-tips',
    features: ['Learning strategies', 'Test preparation', 'Time management'],
    color: 'text-purple-400'
  },
  {
    icon: BookOpen,
    title: 'Prerequisite Review',
    description: 'Review essential math concepts needed for this course.',
    link: '/resources/prerequisite-review',
    features: ['Algebra review', 'Set theory basics', 'Function notation'],
    color: 'text-teal-400'
  }
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Hero Section */}
      <section className="py-12 px-4 bg-gradient-to-b from-neutral-800 to-neutral-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500/10 rounded-full mb-6">
            <FileText className="h-8 w-8 text-teal-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Learning Resources</h1>
          <p className="text-xl text-neutral-300">
            Everything you need to succeed in probability and statistics
          </p>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <Link key={index} href={resource.link}>
                  <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700 hover:border-neutral-600 transition-all hover:bg-neutral-800/80 cursor-pointer group h-full">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-neutral-700 rounded-lg flex items-center justify-center">
                          <Icon className={`h-6 w-6 ${resource.color}`} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-teal-400 transition-colors">
                          {resource.title}
                        </h3>
                        <p className="text-neutral-400 mb-4">
                          {resource.description}
                        </p>
                        <ul className="space-y-1 mb-4">
                          {resource.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center text-sm text-neutral-500">
                              <span className="text-teal-400 mr-2">✓</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <div className="flex items-center text-teal-400 text-sm">
                          <span>Access resources</span>
                          <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-12 px-4 bg-neutral-950">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Quick Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/resources/practice" className="group">
              <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700 hover:border-neutral-600 transition-colors">
                <div className="flex items-center space-x-3">
                  <ClipboardList className="h-6 w-6 text-green-400" />
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-teal-400 transition-colors mb-1">
                      Practice Problems
                    </h3>
                    <p className="text-sm text-neutral-400">Access chapter quizzes</p>
                  </div>
                </div>
              </div>
            </Link>
            
            <Link href="/resources/formulas/chapter-1" className="group">
              <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700 hover:border-neutral-600 transition-colors">
                <div className="flex items-center space-x-3">
                  <Calculator className="h-6 w-6 text-blue-400" />
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-teal-400 transition-colors mb-1">
                      Formula Sheets
                    </h3>
                    <p className="text-sm text-neutral-400">Complete formula reference</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}