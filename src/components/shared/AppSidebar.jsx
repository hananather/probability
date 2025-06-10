"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Sidebar, SidebarContent } from '../ui/sidebar';
import { ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons';

const chapters = [
  {
    title: 'Overview',
    path: '/',
    sections: [
      { title: 'Chance Events', url: '#chance-events' },
      { title: 'Expectation & Variance', url: '#expectation-variance' },
      { title: 'Central Limit Theorem', url: '#central-limit-theorem' },
      { title: 'Point Estimation', url: '#point-estimation' },
      { title: 'Confidence Interval', url: '#confidence-interval' },
      { title: 'Bootstrapping', url: '#bootstrapping' },
      { title: 'Bayesian Inference', url: '#bayesian-inference' },
    ]
  },
  {
    title: 'Chapter 1: Introduction to Probabilities',
    path: '/chapter1',
    sections: [
      { title: 'Sample Spaces & Events', component: 'SampleSpacesEvents' },
      { title: 'Counting Techniques', component: 'CountingTechniques' },
      { title: 'Ordered Samples (Permutations)', component: 'OrderedSamples' },
      { title: 'Unordered Samples (Combinations)', component: 'UnorderedSamples' },
      { title: 'Probability of an Event', component: 'ProbabilityEvent' },
      { title: 'Conditional Probability', component: 'ConditionalProbability' },
    ]
  },
  {
    title: 'Chapter 2: Discrete Random Variables',
    path: '/chapter2',
    sections: [
      { title: 'Random Variables & Distributions', component: 'SpatialRandomVariable' },
      { title: 'Expectation & Variance', component: 'ExpectationVariance' },
      { title: 'Worked Examples', component: 'ExpectationVarianceWorkedExample' },
    ]
  },
  {
    title: 'Chapter 3: Continuous Random Variables',
    path: '/chapter3',
    sections: [
      { title: '3.1 Probability Density Functions', url: '#section-3-1' },
      { title: '3.2 Expectation of Continuous RV (ALL versions)', url: '#section-3-2' },
      { title: '3.3 Normal Distributions (ALL tools)', url: '#section-3-3' },
      { title: '3.4 Exponential Distributions', url: '#section-3-4' },
      { title: '3.5 Gamma Distributions', url: '#section-3-5' },
      { title: '3.6 Joint Distributions', url: '#section-3-6' },
      { title: '3.7 Normal Approximation', url: '#section-3-7' },
    ]
  },
  {
    title: 'Chapter 4: Descriptive Statistics & Sampling',
    path: '/chapter4',
    sections: [
      { title: 'Measures of Central Tendency', component: 'MeanMedianMode' },
      { title: 'Histograms & Data Shapes', component: 'HistogramShapeExplorer' },
      { title: 'Interactive Statistics Explorer', component: 'DescriptiveStatsExplorer' },
      { title: 't-Distribution vs Normal', component: 'TDistributionExplorer' },
      { title: 'F-Distribution Explorer', component: 'FDistributionExplorer' },
    ]
  },
  {
    title: 'Chapter 5: Estimation',
    path: '/chapter5',
    sections: [
      { title: 'Point Estimation', component: 'PointEstimation' },
      { title: 'Confidence Intervals', component: 'ConfidenceInterval' },
      { title: 'Bootstrapping', component: 'Bootstrapping' },
    ]
  },
  {
    title: 'Chapter 6: Hypothesis Testing',
    path: '/chapter6',
    sections: [
      { title: 'Coin Bias Detection Game', component: 'HypothesisTestingGame' },
    ]
  },
  {
    title: 'Chapter 7: Linear Regression & Correlation',
    path: '/chapter7',
    sections: [
      { title: 'Coming Soon...', disabled: true },
    ]
  },
];

function AppSidebarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeId, setActiveId] = useState('');
  const [expandedChapters, setExpandedChapters] = useState(() => {
    // Expand current chapter by default
    const currentChapter = chapters.find(ch => ch.path === pathname);
    return currentChapter ? [currentChapter.path] : ['/'];
  });

  useEffect(() => {
    // Only use intersection observer on the main page
    if (pathname === '/') {
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
                    className={`flex-1 px-2 py-1.5 rounded text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-neutral-700 text-white' 
                        : 'hover:bg-neutral-800 text-neutral-300 hover:text-white'
                    }`}
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
                          const sectionIdMap = {
                            'SampleSpacesEvents': 'sample-spaces',
                            'CountingTechniques': 'counting',
                            'OrderedSamples': 'ordered',
                            'UnorderedSamples': 'unordered',
                            'ProbabilityEvent': 'probability',
                            'ConditionalProbability': 'conditional',
                            'MeanMedianMode': 'measures-central',
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
                            'ExpectationVarianceWorkedExample': 'worked-examples'
                          };
                          const mappedSectionId = sectionIdMap[section.component] || section.component.toLowerCase();
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
                      if (section.url) {
                        // For hash-based sections (main page and chapter 3)
                        href = `${chapter.path === '/' ? '' : chapter.path}${section.url}`;
                      } else if (section.component) {
                        // For component-based sections (chapters with button navigation)
                        // Map component names to section IDs
                        const sectionIdMap = {
                          'SampleSpacesEvents': 'sample-spaces',
                          'CountingTechniques': 'counting',
                          'OrderedSamples': 'ordered',
                          'UnorderedSamples': 'unordered',
                          'ProbabilityEvent': 'probability',
                          'ConditionalProbability': 'conditional',
                          'MeanMedianMode': 'measures-central',
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
                          'ExpectationVarianceWorkedExample': 'worked-examples'
                        };
                        const sectionId = sectionIdMap[section.component] || section.component.toLowerCase();
                        href = `${chapter.path}?section=${sectionId}`;
                      } else {
                        href = chapter.path;
                      }
                      
                      return (
                        <Link
                          key={section.title}
                          href={href}
                          className={`block px-3 py-1.5 rounded text-xs transition-colors ${
                            isActiveSection
                              ? 'bg-neutral-700 text-white font-medium' 
                              : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                          }`}
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
