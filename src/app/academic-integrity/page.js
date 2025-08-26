'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Home, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function AcademicIntegrityPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/">
            <Button variant="neutral" size="sm" className="mb-6">
              <Home className="h-4 w-4 mr-1" />
              Back to Home
            </Button>
          </Link>
          
          <div className="flex items-center space-x-3 mb-8">
            <Shield className="h-8 w-8 text-teal-400" />
            <h1 className="text-3xl font-bold">Academic Integrity Policy</h1>
          </div>

          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-blue-300 mb-2">Important Notice</h2>
                <p className="text-blue-200">
                  This platform is designed to help you learn and understand probability and statistics. 
                  Using it to complete graded assignments without learning undermines your education and 
                  may violate your institution’s academic policies.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 text-neutral-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Appropriate Use</h2>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Use visualizations to understand concepts better</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Practice with examples to prepare for exams</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Check your understanding after attempting problems yourself</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Use as a supplement to lectures and textbooks</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Inappropriate Use</h2>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">✗</span>
                  <span>Copying solutions directly for graded homework</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">✗</span>
                  <span>Using during closed-book exams without permission</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">✗</span>
                  <span>Sharing your institution’s specific assignment solutions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">✗</span>
                  <span>Avoiding learning by only memorizing answers</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Honor Code</h2>
              <p className="mb-4">
                By using this platform, you agree to:
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Use the platform primarily for learning and understanding</li>
                <li>Complete your own work on graded assignments</li>
                <li>Follow your institution’s academic integrity policies</li>
                <li>Seek help from instructors when you don’t understand something</li>
                <li>Use this resource ethically and responsibly</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Remember</h2>
              <p>
                The goal of education is to learn and grow. Taking shortcuts may seem easier in the moment, 
                but it deprives you of the knowledge and skills you’re here to gain. Your future career 
                will depend on what you actually know, not just the grades you received.
              </p>
            </section>

            <div className="pt-8 mt-8 border-t border-neutral-700">
              <p className="text-sm text-neutral-400">
                If you have questions about appropriate use, consult with your instructor or 
                <a href="mailto:support@problab.com" className="text-teal-400 hover:text-teal-300"> contact us</a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}