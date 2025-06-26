"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Sidebar, SidebarContent } from '../ui/sidebar';
import { ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { chapters } from '@/config/sidebar-chapters';

// Map component names to section IDs
const sectionIdMap = {
  'SampleSpacesEvents': 'sample-spaces',
  'CountingTechniques': 'counting',
  'OrderedSamples': 'ordered',
  'UnorderedSamples': 'unordered',
  'ProbabilityEvent': 'probability',
  'ConditionalProbability': 'conditional',
  'MontyHallProblem': 'monty-hall',
  'BayesTheoremVisualizer': 'bayes-theorem',
  'ProbabilisticFallacies': 'fallacies',
  'MontyHallMasterclass': 'monty-hall-masterclass',
  'HistogramShapeExplorer': 'histograms',
  'DescriptiveStatsExplorer': 'stats-explorer',
  'TDistributionExplorer': 't-distribution',
  'FDistributionExplorer': 'f-distribution',
  'PointEstimation': 'point-estimation',
  'ConfidenceInterval': 'confidence-intervals',
  'Bootstrapping': 'bootstrapping',
  'HypothesisTestingGame': 'hypothesis-game',
  'SpatialRandomVariable': 'random-variables',
  'ExpectationVariance': 'expectation-variance',
  'ExpectationVarianceWorkedExample': 'expectation-variance',
  'LinearTransformations': 'transformations',
  'FunctionTransformations': 'transformations',
  'BinomialDistribution': 'binomial-distribution',
  'GeometricDistribution': 'geometric-distribution',
  'NegativeBinomialDistribution': 'negative-binomial-distribution',
  'PoissonDistribution': 'poisson-distribution',
  'DistributionComparison': 'distribution-comparison',
  'ComprehensiveStats': 'comprehensive-stats',
  'SamplingDistributions': 'sampling-distributions',
  'FDistributionWorkedExample': 'f-distribution',
  'BoxplotQuartilesExplorer': 'boxplot-quartiles',
  // Chapter 3 mappings
  'BridgeToContinuous': 'introduction',
  'ContinuousDistributionsPDF': 'probability-density',
  'ContinuousExpectationVariance': 'expectation-variance',
  'NormalZScoreExplorer': 'normal-distributions',
  'ExponentialDistribution': 'exponential',
  'GammaDistribution': 'gamma',
  'JointDistributions': 'joint',
  'NormalApproxBinomial': 'normal-approximation'
};

// Helper function to get section ID from component name
const getSectionId = (componentName) => {
  return sectionIdMap[componentName] || componentName.toLowerCase();
};

// Use the centralized chapter configuration
// The chapters array is now imported from @/config/sidebar-chapters

function AppSidebarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeId, setActiveId] = useState('');
  const [expandedChapters, setExpandedChapters] = useState(() => {
    // Expand current chapter by default
    const currentChapter = chapters.find(ch => ch.path === pathname);
    return currentChapter ? [currentChapter.path] : ['/overview'];
  });

  useEffect(() => {
    // Only use intersection observer on the overview page
    if (pathname === '/overview') {
      const handleIntersect = (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      };
      const observer = new IntersectionObserver(handleIntersect, { rootMargin: '0px 0px -80% 0px' });
      const headings = document.querySelectorAll('h2[id]');
      headings.forEach((h) => observer.observe(h));
      return () => headings.forEach((h) => observer.unobserve(h));
    }
  }, [pathname]);

  const toggleChapter = (path) => {
    setExpandedChapters(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  return (
    <Sidebar>
      <SidebarContent>
        <nav className="space-y-1 p-2">
          {/* Course Overview Link */}
          <Link
            href="/"
            className="flex items-center px-3 py-2 mb-4 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Course Overview
          </Link>
          <div className="border-t border-neutral-700 mb-2"></div>
          
          {chapters.map((chapter) => {
            const isExpanded = expandedChapters.includes(chapter.path);
            const isActive = pathname === chapter.path;
            
            return (
              <div key={chapter.path} className="space-y-1">
                {/* Chapter header */}
                <div className="flex items-center">
                  <button
                    onClick={() => toggleChapter(chapter.path)}
                    className="p-1 hover:bg-neutral-800 rounded transition-colors"
                    aria-label={`Toggle ${chapter.title}`}
                  >
                    {isExpanded ? (
                      <ChevronDownIcon className="w-4 h-4 text-neutral-400" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4 text-neutral-400" />
                    )}
                  </button>
                  <Link
                    href={chapter.path}
                    className={cn(
                      "flex-1 px-2 py-1.5 rounded text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-neutral-700 text-white" 
                        : "hover:bg-neutral-800 text-neutral-300 hover:text-white"
                    )}
                  >
                    {chapter.title.replace(/Chapter \d+: /, '')}
                  </Link>
                </div>
                
                {/* Chapter sections */}
                {isExpanded && chapter.sections.length > 0 && (
                  <div className="ml-6 space-y-0.5">
                    {chapter.sections.map((section) => {
                      const sectionId = section.url?.substring(1);
                      const currentSection = searchParams.get('section');
                      
                      // Determine if this section is active
                      let isActiveSection = false;
                      if (pathname === chapter.path) {
                        if (section.url) {
                          // For hash-based sections
                          isActiveSection = activeId === sectionId;
                        } else if (section.component) {
                          // For component-based sections, check search param
                          const mappedSectionId = getSectionId(section.component);
                          isActiveSection = currentSection === mappedSectionId || 
                                          (!currentSection && section === chapter.sections[0]); // Default to first section
                        }
                      }
                      
                      if (section.disabled) {
                        return (
                          <div
                            key={section.title}
                            className="px-3 py-1.5 text-xs text-neutral-500 italic"
                          >
                            {section.title}
                          </div>
                        );
                      }
                      
                      // Generate appropriate URL based on section type
                      let href;
                      if (section.customPath) {
                        // For sections with custom paths (like MDX pages)
                        href = section.customPath;
                      } else if (section.url) {
                        // For hash-based sections (overview page and chapter 3)
                        href = `${chapter.path}${section.url}`;
                      } else if (section.component) {
                        // For component-based sections (chapters with button navigation)
                        const sectionId = getSectionId(section.component);
                        href = `${chapter.path}?section=${sectionId}`;
                        if (chapter.path === '/chapter3') {
                          console.log(`Sidebar - Chapter 3 link: ${section.title} → ${href}`);
                        }
                      } else {
                        href = chapter.path;
                      }
                      
                      return (
                        <Link
                          key={section.title}
                          href={href}
                          className={cn(
                            "block px-3 py-1.5 rounded text-xs transition-colors",
                            isActiveSection
                              ? "bg-neutral-700 text-white font-medium" 
                              : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                          )}
                        >
                          {section.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </SidebarContent>
    </Sidebar>
  );
}

export function AppSidebar() {
  return (
    <Suspense fallback={
      <Sidebar>
        <SidebarContent>
          <div className="p-4 text-neutral-400">Loading...</div>
        </SidebarContent>
      </Sidebar>
    }>
      <AppSidebarInner />
    </Suspense>
  );
}
