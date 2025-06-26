"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const DescriptiveStatsJourney = dynamic(
  () => import('@/components/04-descriptive-statistics-sampling/4-1-1-DescriptiveStatsJourney'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const ComprehensiveStats = dynamic(
  () => import('@/components/04-descriptive-statistics-sampling/4-1-1-ComprehensiveStats'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const TDistributionExplorer = dynamic(
  () => import('@/components/04-descriptive-statistics-sampling/4-4-1-TDistributionExplorer').then(mod => ({ default: mod.TDistributionExplorer })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const HistogramShapeExplorer = dynamic(
  () => import('@/components/04-descriptive-statistics-sampling/4-2-1-HistogramShapeExplorer'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const DescriptiveStatsExplorer = dynamic(
  () => import('@/components/04-descriptive-statistics-sampling/4-1-3-DescriptiveStatsExplorer'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const FDistributionExplorer = dynamic(
  () => import('@/components/04-descriptive-statistics-sampling/4-5-1-FDistributionExplorer').then(mod => ({ default: mod.FDistributionExplorer })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const SamplingDistributions = dynamic(
  () => import('@/components/04-descriptive-statistics-sampling/4-3-1-SamplingDistributions'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const BoxplotQuartilesExplorer = dynamic(
  () => import('@/components/04-descriptive-statistics-sampling/4-6-1-BoxplotQuartilesExplorer'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const CLTSimulation = dynamic(
  () => import('@/components/shared/CLTSimulation'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

// Central Tendency Hub - New comprehensive learning system
const CentralTendencyHub = dynamic(
  () => import('@/components/04-descriptive-statistics-sampling/4-1-central-tendency'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const CentralTendencyJourney = dynamic(
  () => import('@/components/04-descriptive-statistics-sampling/4-1-central-tendency/4-1-1-CentralTendencyJourney'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const DataExplorerIntro = dynamic(
  () => import('@/components/04-descriptive-statistics-sampling/4-1-1-DataExplorerIntro'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);


// Histogram Hub Component
const HistogramHub = dynamic(
  () => import('@/components/04-descriptive-statistics-sampling/4-2-histograms/4-2-0-HistogramHub'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

// Improved Sampling Distributions
const SamplingDistributionsImproved = dynamic(
  () => import('@/components/04-descriptive-statistics-sampling/4-3-1-SamplingDistributions-Improved'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

// Additional F-Distribution Components
const FDistributionIntuitiveIntro = dynamic(
  () => import('@/components/04-descriptive-statistics-sampling/4-5-1-FDistributionIntuitiveIntro').then(mod => ({ default: mod.FDistributionIntuitiveIntro })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const FDistributionInteractiveJourney = dynamic(
  () => import('@/components/04-descriptive-statistics-sampling/4-5-2-FDistributionInteractiveJourney').then(mod => ({ default: mod.FDistributionInteractiveJourney })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const FDistributionWorkedExample = dynamic(
  () => import('@/components/04-descriptive-statistics-sampling/4-5-2-FDistributionWorkedExample').then(mod => ({ default: mod.FDistributionWorkedExample })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const FDistributionMasterclass = dynamic(
  () => import('@/components/04-descriptive-statistics-sampling/4-5-3-FDistributionMasterclass'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const FDistributionMastery = dynamic(
  () => import('@/components/04-descriptive-statistics-sampling/4-5-3-FDistributionMastery').then(mod => ({ default: mod.FDistributionMastery })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const FDistributionJourney = dynamic(
  () => import('@/components/04-descriptive-statistics-sampling/4-5-4-FDistributionJourney'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

// Additional Boxplot Components
const BoxplotQuartilesJourney = dynamic(
  () => import('@/components/04-descriptive-statistics-sampling/4-6-1-BoxplotQuartilesJourney'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const BoxplotRealWorldExplorer = dynamic(
  () => import('@/components/04-descriptive-statistics-sampling/4-6-2-BoxplotRealWorldExplorer'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);
import ConceptSection from '@/components/shared/ConceptSection';

export default function Chapter4Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentSection, setCurrentSection] = useState(0);

  // Read section from URL on mount and when URL changes
  useEffect(() => {
    // Map section IDs to indices
    const sectionIdToIndex = {
      // Central Tendency & Descriptive Stats
      'central-tendency-hub': 0,
      'data-explorer-intro': 1,
      'descriptive-journey': 2,
      'stats-explorer': 3,
      'central-tendency-journey': 4,
      'comprehensive-stats': 5,
      
      // Histograms
      'histograms': 6,
      
      // Sampling & Distributions
      'sampling-distributions': 7,
      'sampling-distributions-improved': 8,
      'central-limit-theorem': 9,
      
      // T-Distribution
      't-distribution': 10,
      
      // F-Distribution
      'f-distribution-intro': 11,
      'f-distribution': 12,
      'f-distribution-journey': 13,
      'f-distribution-worked': 14,
      'f-distribution-masterclass': 15,
      'f-distribution-mastery': 16,
      'f-distribution-full-journey': 17,
      
      // Boxplots
      'boxplot-quartiles': 18,
      'boxplot-journey': 19,
      'boxplot-real-world': 20
    };
    
    const section = searchParams.get('section');
    if (section && sectionIdToIndex[section] !== undefined) {
      setCurrentSection(sectionIdToIndex[section]);
    }
  }, [searchParams]);

  const sections = [
    // Central Tendency & Descriptive Stats
    {
      id: 'central-tendency-hub',
      title: "4.1.0 - 🎯 Central Tendency: Learning Hub",
      description: "Master central tendency through multiple learning paths - from intuitive understanding to mathematical rigor. Choose your own journey through mean, median, and mode with interactive visualizations, challenges, and progressive learning.",
      component: <CentralTendencyHub />,
      category: 'central-tendency'
    },
    {
      id: 'data-explorer-intro',
      title: "4.1.1 - Data Explorer Introduction",
      description: "Get started with exploring data through interactive visualizations and hands-on examples.",
      component: <DataExplorerIntro />,
      category: 'central-tendency'
    },
    {
      id: 'descriptive-journey',
      title: "4.1.2 - 📚 Descriptive Stats Journey",
      description: "Learn descriptive statistics through an engaging, progressive journey with interactive challenges and gamification.",
      component: <DescriptiveStatsJourney />,
      category: 'central-tendency'
    },
    {
      id: 'stats-explorer',
      title: "4.1.3 - Interactive Statistics Explorer",
      description: "Explore central tendency and dispersion measures interactively. Drag data points, observe outlier effects, and understand statistical robustness.",
      component: <DescriptiveStatsExplorer />,
      category: 'central-tendency'
    },
    {
      id: 'central-tendency-journey',
      title: "4.1.4 - Central Tendency Journey",
      description: "Explore mean, median, and mode through interactive storytelling and progressive challenges.",
      component: <CentralTendencyJourney />,
      category: 'central-tendency'
    },
    {
      id: 'comprehensive-stats',
      title: "4.1.5 - Stats Lab: Practice & Apply",
      description: "Practice with real-world scenarios. Master mean, median, mode, and see how outliers affect different measures.",
      component: <ComprehensiveStats />,
      category: 'central-tendency'
    },
    
    // Histograms
    {
      id: 'histograms',
      title: "4.2 - Histogram Hub",
      description: "Explore how histograms represent data distributions and learn to identify symmetric, right-skewed, and left-skewed datasets.",
      component: <HistogramHub />,
      category: 'histograms'
    },
    
    // Sampling & Distributions
    {
      id: 'sampling-distributions',
      title: "4.3.1 - Sampling Distributions",
      description: "Discover how sample means form predictable patterns. Experience the Central Limit Theorem in action as you build sampling distributions.",
      component: <SamplingDistributions />,
      category: 'sampling'
    },
    {
      id: 'sampling-distributions-improved',
      title: "4.3.2 - Sampling Distributions (Enhanced)",
      description: "An improved version with better visualizations and more interactive features for understanding sampling distributions.",
      component: <SamplingDistributionsImproved />,
      category: 'sampling'
    },
    {
      id: 'central-limit-theorem',
      title: "4.3.3 - Central Limit Theorem",
      description: "Experience the most important theorem in statistics. Watch how sample means always form a normal distribution, regardless of the original data shape.",
      component: <CLTSimulation />,
      category: 'sampling'
    },
    
    // T-Distribution
    {
      id: 't-distribution',
      title: "4.4.1 - t-Distribution vs Normal",
      description: "Explore how the t-distribution accounts for uncertainty when estimating population variance and converges to normal as sample size increases.",
      component: <TDistributionExplorer />,
      category: 't-distribution'
    },
    
    // F-Distribution
    {
      id: 'f-distribution-intro',
      title: "4.5.1 - F-Distribution: Intuitive Introduction",
      description: "Get an intuitive understanding of the F-distribution and its role in comparing variances.",
      component: <FDistributionIntuitiveIntro />,
      category: 'f-distribution'
    },
    {
      id: 'f-distribution',
      title: "4.5.2 - F-Distribution Explorer",
      description: "Compare variances from two samples using the F-distribution. Essential for ANOVA and variance ratio tests.",
      component: <FDistributionExplorer />,
      category: 'f-distribution'
    },
    {
      id: 'f-distribution-journey',
      title: "4.5.3 - F-Distribution Interactive Journey",
      description: "Learn F-distribution concepts through hands-on exploration and guided exercises.",
      component: <FDistributionInteractiveJourney />,
      category: 'f-distribution'
    },
    {
      id: 'f-distribution-worked',
      title: "4.5.4 - F-Distribution Worked Examples",
      description: "Work through real-world examples using the F-distribution for hypothesis testing.",
      component: <FDistributionWorkedExample />,
      category: 'f-distribution'
    },
    {
      id: 'f-distribution-masterclass',
      title: "4.5.5 - F-Distribution Masterclass",
      description: "Advanced concepts and applications of the F-distribution in statistical analysis.",
      component: <FDistributionMasterclass />,
      category: 'f-distribution'
    },
    {
      id: 'f-distribution-mastery',
      title: "4.5.6 - F-Distribution Mastery",
      description: "Master the F-distribution with comprehensive exercises and real-world applications.",
      component: <FDistributionMastery />,
      category: 'f-distribution'
    },
    {
      id: 'f-distribution-full-journey',
      title: "4.5.7 - Complete F-Distribution Journey",
      description: "A comprehensive journey through all aspects of the F-distribution from basics to advanced topics.",
      component: <FDistributionJourney />,
      category: 'f-distribution'
    },
    
    // Boxplots
    {
      id: 'boxplot-quartiles',
      title: "4.6.1 - Boxplots & Quartiles",
      description: "Master the five-number summary and boxplot visualization. Learn to identify outliers and understand data distribution at a glance.",
      component: <BoxplotQuartilesExplorer />,
      category: 'boxplots'
    },
    {
      id: 'boxplot-journey',
      title: "4.6.2 - Boxplot Interactive Journey",
      description: "Learn boxplots through progressive, interactive lessons with real-time feedback.",
      component: <BoxplotQuartilesJourney />,
      category: 'boxplots'
    },
    {
      id: 'boxplot-real-world',
      title: "4.6.3 - Boxplots: Real-World Applications",
      description: "Apply boxplot analysis to real-world datasets and scenarios.",
      component: <BoxplotRealWorldExplorer />,
      category: 'boxplots'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F0F10] text-white">
      <div className="mx-auto max-w-screen-2xl px-4 py-8">
        <h1 className="text-4xl font-bold mb-6 text-center">
          Chapter 4: Descriptive Statistics & Sampling
        </h1>
        
        <div className="mb-8 text-center">
          <p className="text-lg text-neutral-300 max-w-3xl mx-auto">
            Explore the fundamental tools for summarizing and understanding data. 
            Learn how to describe datasets using measures of central tendency and variability.
          </p>
        </div>

        {/* Section Navigation by Category */}
        <div className="space-y-6 mb-8">
          {/* Central Tendency & Descriptive Stats */}
          <div>
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Central Tendency & Descriptive Statistics</h3>
            <div className="flex flex-wrap gap-2">
              {sections.filter(s => s.category === 'central-tendency').map((section, index) => {
                const sectionIndex = sections.findIndex(s => s.id === section.id);
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setCurrentSection(sectionIndex);
                      router.push(`/chapter4?section=${section.id}`);
                    }}
                    className={`px-4 py-2 rounded-lg transition-all text-sm ${
                      currentSection === sectionIndex
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    {section.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Histograms */}
          <div>
            <h3 className="text-lg font-semibold text-purple-400 mb-3">Histograms & Data Visualization</h3>
            <div className="flex flex-wrap gap-2">
              {sections.filter(s => s.category === 'histograms').map((section) => {
                const sectionIndex = sections.findIndex(s => s.id === section.id);
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setCurrentSection(sectionIndex);
                      router.push(`/chapter4?section=${section.id}`);
                    }}
                    className={`px-4 py-2 rounded-lg transition-all text-sm ${
                      currentSection === sectionIndex
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    {section.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sampling & CLT */}
          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-3">Sampling Distributions & CLT</h3>
            <div className="flex flex-wrap gap-2">
              {sections.filter(s => s.category === 'sampling').map((section) => {
                const sectionIndex = sections.findIndex(s => s.id === section.id);
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setCurrentSection(sectionIndex);
                      router.push(`/chapter4?section=${section.id}`);
                    }}
                    className={`px-4 py-2 rounded-lg transition-all text-sm ${
                      currentSection === sectionIndex
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    {section.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* T-Distribution */}
          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-3">T-Distribution</h3>
            <div className="flex flex-wrap gap-2">
              {sections.filter(s => s.category === 't-distribution').map((section) => {
                const sectionIndex = sections.findIndex(s => s.id === section.id);
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setCurrentSection(sectionIndex);
                      router.push(`/chapter4?section=${section.id}`);
                    }}
                    className={`px-4 py-2 rounded-lg transition-all text-sm ${
                      currentSection === sectionIndex
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    {section.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* F-Distribution */}
          <div>
            <h3 className="text-lg font-semibold text-orange-400 mb-3">F-Distribution</h3>
            <div className="flex flex-wrap gap-2">
              {sections.filter(s => s.category === 'f-distribution').map((section) => {
                const sectionIndex = sections.findIndex(s => s.id === section.id);
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setCurrentSection(sectionIndex);
                      router.push(`/chapter4?section=${section.id}`);
                    }}
                    className={`px-4 py-2 rounded-lg transition-all text-sm ${
                      currentSection === sectionIndex
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    {section.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Boxplots */}
          <div>
            <h3 className="text-lg font-semibold text-pink-400 mb-3">Boxplots & Quartiles</h3>
            <div className="flex flex-wrap gap-2">
              {sections.filter(s => s.category === 'boxplots').map((section) => {
                const sectionIndex = sections.findIndex(s => s.id === section.id);
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setCurrentSection(sectionIndex);
                      router.push(`/chapter4?section=${section.id}`);
                    }}
                    className={`px-4 py-2 rounded-lg transition-all text-sm ${
                      currentSection === sectionIndex
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    {section.title}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Current Section */}
        <ConceptSection
          title={sections[currentSection].title}
          description={sections[currentSection].description}
        >
          {sections[currentSection].component}
        </ConceptSection>
        
        {/* Chapter Progress Note */}
        <div className="mt-12 p-6 bg-yellow-900/20 border border-yellow-600/30 rounded-lg text-center">
          <p className="text-yellow-400 font-semibold mb-2">
            🚧 Chapter Under Development
          </p>
          <p className="text-sm text-neutral-300">
            This chapter is actively being developed. More visualizations for variance, 
            standard deviation, and chi-squared distributions will be added soon!
          </p>
        </div>
      </div>
    </div>
  );
}