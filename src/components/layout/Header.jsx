'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, FileText } from 'lucide-react';

import progressService from '../../services/progressService';
import { Button } from '../ui/button';

export function Header() {
  const [progress, setProgress] = useState({ completed: 0, total: 7, percentage: 0 });
  const [loadingProgress, setLoadingProgress] = useState(true);
  const pathname = usePathname();
  
  // Fetch progress data
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoadingProgress(true);
        const overallProgress = await progressService.getOverallProgress();
        setProgress({
          completed: overallProgress.completedChapters || 0,
          total: overallProgress.totalChapters || 7,
          percentage: Math.round(((overallProgress.completedChapters || 0) / (overallProgress.totalChapters || 7)) * 100)
        });
      } catch (error) {
        console.error('Error fetching progress:', error);
        // Default values on error
        setProgress({ completed: 0, total: 7, percentage: 0 });
      } finally {
        setLoadingProgress(false);
      }
    };

    fetchProgress();
  }, [pathname]); // Update when route changes

  // Don't show header on landing page
  if (pathname === '/') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-neutral-900/95 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/75">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-teal-400" />
            <span className="text-xl font-bold text-white">Probability Lab</span>
          </Link>

          <div className="flex items-center space-x-4">
            {/* Progress Indicator */}
            {!loadingProgress && (
              <div className="hidden lg:flex items-center space-x-2 text-sm text-neutral-400">
                <span>Progress:</span>
                <div className="w-24 h-2 bg-neutral-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-teal-400 rounded-full transition-all duration-300" 
                    style={{ width: `${progress.percentage}%` }} 
                  />
                </div>
                <span>{progress.completed}/{progress.total}</span>
              </div>
            )}

            <Button asChild variant="neutral" size="sm">
              <Link href="/resources">
                <FileText className="h-4 w-4" />
                Resources
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
