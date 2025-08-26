'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import progressService from '../../services/progressService';
import { 
  ChevronDown, 
  BookOpen, 
  Info, 
  FileText, 
  HelpCircle,
  BarChart3,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/design-system';

const chapters = [
  { id: 1, title: 'Introduction to Probabilities', path: '/chapter1' },
  { id: 2, title: 'Discrete Random Variables', path: '/chapter2' },
  { id: 3, title: 'Continuous Random Variables', path: '/chapter3' },
  { id: 4, title: 'Descriptive Statistics & Sampling', path: '/chapter4' },
  { id: 5, title: 'Estimation', path: '/chapter5' },
  { id: 6, title: 'Hypothesis Testing', path: '/chapter6' },
  { id: 7, title: 'Linear Regression & Correlation', path: '/chapter7' },
];

export function Header() {
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [chaptersClickLocked, setChaptersClickLocked] = useState(false);
  const [resourcesClickLocked, setResourcesClickLocked] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileChaptersOpen, setMobileChaptersOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 7, percentage: 0 });
  const [loadingProgress, setLoadingProgress] = useState(true);
  const pathname = usePathname();
  
  const chaptersRef = useRef(null);
  const resourcesRef = useRef(null);
  
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

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chaptersRef.current && !chaptersRef.current.contains(event.target)) {
        if (chaptersClickLocked) {
          setChaptersOpen(false);
          setChaptersClickLocked(false);
        }
      }
      if (resourcesRef.current && !resourcesRef.current.contains(event.target)) {
        if (resourcesClickLocked) {
          setResourcesOpen(false);
          setResourcesClickLocked(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [chaptersClickLocked, resourcesClickLocked]);

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

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {/* Chapters Dropdown */}
            <div 
              ref={chaptersRef}
              className="relative"
              onMouseEnter={() => {
                if (!chaptersClickLocked) {
                  setChaptersOpen(true);
                }
              }}
              onMouseLeave={() => {
                if (!chaptersClickLocked) {
                  setChaptersOpen(false);
                }
              }}
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (chaptersClickLocked) {
                    // If already click-locked, close it
                    setChaptersOpen(false);
                    setChaptersClickLocked(false);
                  } else {
                    // Open and lock it
                    setChaptersOpen(true);
                    setChaptersClickLocked(true);
                    // Close the other dropdown if it's open
                    setResourcesOpen(false);
                    setResourcesClickLocked(false);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setChaptersOpen(!chaptersOpen);
                    setChaptersClickLocked(!chaptersOpen);
                  }
                  if (e.key === 'Escape') {
                    setChaptersOpen(false);
                    setChaptersClickLocked(false);
                  }
                }}
                className="flex items-center space-x-1 text-neutral-300 hover:text-white transition-colors"
                aria-expanded={chaptersOpen}
                aria-haspopup="true"
                aria-label="Chapters menu"
              >
                <BookOpen className="h-4 w-4" />
                <span>Chapters</span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  chaptersOpen && "rotate-180"
                )} />
              </button>
              
              {chaptersOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-80 rounded-lg bg-neutral-800 border border-neutral-700 shadow-xl"
                >
                  <div className="p-2">
                    {chapters.map((chapter) => (
                      <Link
                        key={chapter.id}
                        href={chapter.path}
                        onClick={() => {
                          setChaptersOpen(false);
                          setChaptersClickLocked(false);
                        }}
                        className={cn(
                          "block px-4 py-3 rounded hover:bg-neutral-700 transition-colors",
                          pathname.startsWith(chapter.path) && "bg-neutral-700"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-white">
                              Chapter {chapter.id}
                            </div>
                            <div className="text-xs text-neutral-400">
                              {chapter.title}
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-neutral-500" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Resources Dropdown */}
            <div 
              ref={resourcesRef}
              className="relative"
              onMouseEnter={() => {
                if (!resourcesClickLocked) {
                  setResourcesOpen(true);
                }
              }}
              onMouseLeave={() => {
                if (!resourcesClickLocked) {
                  setResourcesOpen(false);
                }
              }}
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (resourcesClickLocked) {
                    // If already click-locked, close it
                    setResourcesOpen(false);
                    setResourcesClickLocked(false);
                  } else {
                    // Open and lock it
                    setResourcesOpen(true);
                    setResourcesClickLocked(true);
                    // Close the other dropdown if it's open
                    setChaptersOpen(false);
                    setChaptersClickLocked(false);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setResourcesOpen(!resourcesOpen);
                    setResourcesClickLocked(!resourcesOpen);
                  }
                  if (e.key === 'Escape') {
                    setResourcesOpen(false);
                    setResourcesClickLocked(false);
                  }
                }}
                className="flex items-center space-x-1 text-neutral-300 hover:text-white transition-colors"
                aria-expanded={resourcesOpen}
                aria-haspopup="true"
                aria-label="Resources menu"
              >
                <FileText className="h-4 w-4" />
                <span>Resources</span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  resourcesOpen && "rotate-180"
                )} />
              </button>
              
              {resourcesOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-64 rounded-lg bg-neutral-800 border border-neutral-700 shadow-xl"
                >
                  <div className="p-2">
                    <Link
                      href="/resources/practice"
                      onClick={() => {
                        setResourcesOpen(false);
                        setResourcesClickLocked(false);
                      }}
                      className="block px-4 py-3 rounded hover:bg-neutral-700 transition-colors"
                    >
                      <div className="text-sm font-medium text-white">Practice Problems</div>
                      <div className="text-xs text-neutral-400">Test your knowledge</div>
                    </Link>
                    <Link
                      href="/prerequisites"
                      onClick={() => {
                        setResourcesOpen(false);
                        setResourcesClickLocked(false);
                      }}
                      className="block px-4 py-3 rounded hover:bg-neutral-700 transition-colors"
                    >
                      <div className="text-sm font-medium text-white">Prerequisites</div>
                      <div className="text-xs text-neutral-400">Check your readiness</div>
                    </Link>
                    <Link
                      href="/resources/study-tips"
                      onClick={() => {
                        setResourcesOpen(false);
                        setResourcesClickLocked(false);
                      }}
                      className="block px-4 py-3 rounded hover:bg-neutral-700 transition-colors"
                    >
                      <div className="text-sm font-medium text-white">Study Tips</div>
                      <div className="text-xs text-neutral-400">Learn effectively</div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* CTA Button */}
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
            
            <Link href="/chapter1">
              <Button variant="primary" size="sm">
                Start Learning
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-neutral-800">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between overflow-x-auto space-x-4">
            <Link href="/chapter1" className="text-sm text-neutral-300 whitespace-nowrap">
              Chapters
            </Link>
            <Link href="/resources" className="text-sm text-neutral-300 whitespace-nowrap">
              Resources
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}