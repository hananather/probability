'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  BookOpen,
  PlayCircle,
  MousePointer,
  Layers,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Lightbulb
} from 'lucide-react';
import { Button } from '../../../components/ui/button';

const gettingStartedSteps = [
  {
    number: '1',
    title: 'Check Your Prerequisites',
    description: 'Ensure you have the mathematical foundation needed for success.',
    icon: CheckCircle,
    link: '/prerequisites',
    linkText: 'Take Prerequisites Quiz'
  },
  {
    number: '2',
    title: 'Explore the Interface',
    description: 'Familiarize yourself with the navigation, sidebar, and interactive elements.',
    icon: MousePointer,
    tips: [
      'Use the sidebar to navigate between chapters',
      'Click on any visualization to interact with it',
      'Hover over formulas for additional explanations'
    ]
  },
  {
    number: '3',
    title: 'Start with Chapter 1',
    description: 'Begin your journey with fundamental probability concepts.',
    icon: PlayCircle,
    link: '/chapter1',
    linkText: 'Go to Chapter 1'
  },
  {
    number: '4',
    title: 'Interact with Visualizations',
    description: 'Don&apos;t just read—manipulate parameters and see concepts come alive.',
    icon: Layers,
    tips: [
      'Drag sliders to change values',
      'Click buttons to run simulations',
      'Observe how changes affect outcomes'
    ]
  },
  {
    number: '5',
    title: 'Practice with Exercises',
    description: 'Test your understanding with interactive problems and quizzes.',
    icon: BarChart3,
    link: '/resources/practice',
    linkText: 'Practice Problems'
  }
];

const platformFeatures = [
  {
    title: 'Interactive Visualizations',
    description: 'Every concept includes hands-on visualizations you can manipulate to build intuition.',
    icon: '🎯'
  },
  {
    title: 'Step-by-Step Examples',
    description: 'Worked examples show you exactly how to approach and solve problems.',
    icon: '📝'
  },
  {
    title: 'Progress Tracking',
    description: 'Your progress is automatically saved as you complete sections.',
    icon: '📊'
  },
  {
    title: 'Formula References',
    description: 'Quick access to all formulas with explanations and examples.',
    icon: '📐'
  },
  {
    title: 'Self-Paced Learning',
    description: 'Go at your own speed, review as needed, skip ahead when ready.',
    icon: '⏱️'
  },
  {
    title: 'Mobile Friendly',
    description: 'Learn on any device—desktop, tablet, or phone.',
    icon: '📱'
  }
];

export default function GettingStartedPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/help" className="text-neutral-400 hover:text-white transition-colors">
              Help Center
            </Link>
            <span className="text-neutral-500">/</span>
            <span className="text-white">Getting Started</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/help">
            <Button variant="neutral" size="sm" className="mb-6">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Help Center
            </Button>
          </Link>
          
          <div className="flex items-center space-x-3 mb-4">
            <BookOpen className="h-8 w-8 text-teal-400" />
            <h1 className="text-3xl font-bold">Getting Started Guide</h1>
          </div>
          <p className="text-neutral-400">
            Welcome to Probability Lab! This guide will help you make the most of your learning experience.
          </p>
        </div>
      </section>

      {/* Getting Started Steps */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Your Learning Journey</h2>
          
          <div className="space-y-6">
            {gettingStartedSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                        {step.number}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon className="h-5 w-5 text-teal-400" />
                        <h3 className="text-xl font-semibold">{step.title}</h3>
                      </div>
                      <p className="text-neutral-300 mb-4">
                        {step.description}
                      </p>
                      
                      {step.tips && (
                        <ul className="space-y-1 mb-4">
                          {step.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="flex items-start text-sm text-neutral-400">
                              <span className="text-teal-400 mr-2">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      
                      {step.link && (
                        <Link href={step.link}>
                          <Button variant="primary" size="sm">
                            {step.linkText}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-12 px-4 bg-neutral-950">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Platform Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platformFeatures.map((feature, index) => (
              <div key={index} className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
                <div className="text-2xl mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pro Tips */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-teal-900/20 to-blue-900/20 rounded-lg p-8 border border-neutral-700">
            <div className="flex items-center space-x-3 mb-4">
              <Lightbulb className="h-6 w-6 text-yellow-400" />
              <h2 className="text-xl font-bold">Pro Tips for Success</h2>
            </div>
            
            <ul className="space-y-3 text-neutral-300">
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">💡</span>
                <span>
                  <strong>Don&apos;t skip the visualizations</strong> - They&apos;re not just pretty pictures. 
                  Interacting with them builds intuition that formulas alone can&apos;t provide.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">💡</span>
                <span>
                  <strong>Practice immediately after learning</strong> - Each concept has practice problems. 
                  Do them while the material is fresh.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">💡</span>
                <span>
                  <strong>Use the formula sheets</strong> - Keep them open in another tab while working 
                  through problems.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">💡</span>
                <span>
                  <strong>Review prerequisites if stuck</strong> - Many difficulties stem from gaps in 
                  foundational math. Don&apos;t hesitate to review.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">💡</span>
                <span>
                  <strong>Attend office hours early</strong> - Don&apos;t wait until the exam. Regular 
                  check-ins help identify issues before they become problems.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Navigation Shortcuts */}
      <section className="py-12 px-4 bg-neutral-950">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Keyboard Shortcuts</h2>
          
          <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Toggle Sidebar</span>
                  <kbd className="px-2 py-1 bg-neutral-700 rounded text-white">⌘ + B</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Next Section</span>
                  <kbd className="px-2 py-1 bg-neutral-700 rounded text-white">→</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Previous Section</span>
                  <kbd className="px-2 py-1 bg-neutral-700 rounded text-white">←</kbd>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Search</span>
                  <kbd className="px-2 py-1 bg-neutral-700 rounded text-white">⌘ + K</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Go to Chapter</span>
                  <kbd className="px-2 py-1 bg-neutral-700 rounded text-white">⌘ + [1-7]</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Help</span>
                  <kbd className="px-2 py-1 bg-neutral-700 rounded text-white">?</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Start CTA */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Begin?</h2>
          <p className="text-neutral-400 mb-8">
            You&apos;re all set! Start with Chapter 1 and build your probability expertise step by step.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/chapter1">
              <Button size="lg" variant="primary">
                Start Chapter 1
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/prerequisites">
              <Button size="lg" variant="neutral">
                Check Prerequisites First
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}