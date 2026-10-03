'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, FileText } from 'lucide-react';

import { useProgress } from '@/hooks/useProgress';
import { Button } from '../ui/button';
import { SidebarTrigger } from '../ui/sidebar';
import { MotionPreferenceControl } from '../shared/MotionPreferenceControl';

export function Header() {
  const { overallStats, loading } = useProgress();
  const pathname = usePathname();
  const progress = {
    completed: overallStats.completedChapters,
    total: overallStats.totalChapters,
    percentage: Math.round(overallStats.completedChapters / overallStats.totalChapters * 100),
  };

  // Don't show header on landing page
  if (pathname === '/') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-neutral-900/95 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/75">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center gap-3 sm:gap-4">
          <SidebarTrigger />
          {/* Logo */}
          <Link href="/" className="flex min-w-0 flex-1 items-center gap-2">
            <BarChart3 className="h-5 w-5 shrink-0 text-teal-400 sm:h-6 sm:w-6" aria-hidden="true" />
            <span className="truncate text-base font-bold text-white sm:text-xl">Probability Lab</span>
          </Link>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            {/* Progress Indicator */}
            {!loading && (
              <div className="hidden lg:flex items-center space-x-2 text-sm text-neutral-400">
                <span>Progress:</span>
                <div className="w-24 h-2 bg-neutral-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-teal-400 rounded-full transition-[width] duration-300"
                    style={{ width: `${progress.percentage}%` }} 
                  />
                </div>
                <span>{progress.completed}/{progress.total}</span>
              </div>
            )}

            <MotionPreferenceControl compact />

            <Button asChild variant="neutral" size="sm" className="h-10 w-10 px-0 sm:h-8 sm:w-auto sm:px-3">
              <Link href="/resources" aria-label="Resources">
                <FileText className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Resources</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
