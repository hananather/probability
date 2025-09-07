'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FileText, 
  BookOpen, 
  Calculator,
  AlertCircle,
  GraduationCap
} from 'lucide-react';

export function Footer() {

  return (
    <footer className="mt-auto border-t border-neutral-800 bg-neutral-900">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Academic Resources */}
          <div>
            <h3 className="flex items-center space-x-2 text-lg font-semibold text-white mb-4">
              <BookOpen className="h-5 w-5 text-teal-400" />
              <span>Academic Resources</span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/resources/formulas" className="flex items-center space-x-2 text-neutral-400 hover:text-white transition-colors">
                  <Calculator className="h-4 w-4" />
                  <span className="text-sm">Formula Reference</span>
                </Link>
              </li>
              <li>
                <Link href="/resources/practice" className="flex items-center space-x-2 text-neutral-400 hover:text-white transition-colors">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">Practice Problems</span>
                </Link>
              </li>
              <li>
                <Link href="/prerequisites" className="flex items-center space-x-2 text-neutral-400 hover:text-white transition-colors">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Prerequisites Guide</span>
                </Link>
              </li>
              <li>
                <Link href="/resources/study-tips" className="flex items-center space-x-2 text-neutral-400 hover:text-white transition-colors">
                  <GraduationCap className="h-4 w-4" />
                  <span className="text-sm">Study Tips</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-neutral-400 hover:text-white transition-colors">
                  About This Platform
                </Link>
              </li>
              <li>
                <Link href="/overview" className="text-sm text-neutral-400 hover:text-white transition-colors">
                  Course Overview
                </Link>
              </li>
              <li>
                <Link href="/chapter1" className="text-sm text-neutral-400 hover:text-white transition-colors">
                  Start Chapter 1
                </Link>
              </li>
            </ul>
          </div>

          {/* Course Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Course Information</h3>
            <div className="space-y-3 text-sm text-neutral-400">
              <p>MAT 2377 - Probability & Statistics</p>
              <p>For Engineering Students</p>
              <p className="pt-2">
                Built with interactive visualizations to help you understand complex concepts through hands-on learning.
              </p>
              <div className="pt-4 text-xs">
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Use
                </Link>
                <span className="mx-2">•</span>
                <Link href="/academic-integrity" className="hover:text-white transition-colors">
                  Academic Integrity
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-neutral-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Calculator className="h-5 w-5 text-teal-400" />
              <span className="text-sm text-neutral-400">
                Probability Lab - Interactive Learning Platform
              </span>
            </div>
            <div className="text-sm text-neutral-500">
              Free for students • No signup required
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
