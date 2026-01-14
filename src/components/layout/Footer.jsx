'use client';

import React from 'react';
import Link from 'next/link';
import { 
  AlertCircle,
  BookOpen,
  Calculator,
  FileText,
  GraduationCap,
  Info,
  Shield
} from 'lucide-react';

export function Footer() {

  return (
    <footer className="mt-auto border-t border-neutral-800 bg-neutral-900">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="flex items-center space-x-2 text-lg font-semibold text-white mb-4">
              <Info className="h-5 w-5 text-teal-400" />
              <span>About</span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-neutral-400 hover:text-white transition-colors">
                  About This Platform
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="flex items-center space-x-2 text-lg font-semibold text-white mb-4">
              <BookOpen className="h-5 w-5 text-teal-400" />
              <span>Resources</span>
            </h3>
            <ul className="space-y-3">
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

          {/* Legal */}
          <div>
            <h3 className="flex items-center space-x-2 text-lg font-semibold text-white mb-4">
              <Shield className="h-5 w-5 text-teal-400" />
              <span>Legal</span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="flex items-center space-x-2 text-neutral-400 hover:text-white transition-colors">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">Terms of Use</span>
                </Link>
              </li>
              <li>
                <Link href="/academic-integrity" className="flex items-center space-x-2 text-neutral-400 hover:text-white transition-colors">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">Academic Integrity</span>
                </Link>
              </li>
            </ul>
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
