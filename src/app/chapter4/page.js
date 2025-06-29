"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const DescriptiveStatsJourney = dynamic(
  () => import('@/components/04-descriptive-statistics-sampling/4-1-central-tendency/4-1-2-DescriptiveStatsJourney'),
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

// Archived - functionality moved to DescriptiveStatsJourney
// const DescriptiveStatsExplorer = dynamic(
//   () => import('@/components/04-descriptive-statistics-sampling/4-1-3-DescriptiveStatsExplorer'),
//   { 
//     ssr: false,
//     loading: () => (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-gray-400">Loading visualization...</div>
//       </div>
//     )
//   }
// );

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

// Sampling Distributions Hub - New comprehensive learning system
const SamplingDistributionsHub = dynamic(
  () => import('@/components/04-descriptive-statistics-sampling/4-3-sampling-distributions-new/4-3-0-SamplingDistributionsHub'),
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


// Central Tendency Hub - New comprehensive learning system
const CentralTendencyHub = dynamic(
  () => import('@/components/04-descriptive-statistics-sampling/4-1-central-tendency/4-1-0-CentralTendencyHub'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);



// Archived - CentralTendencyMasterclass
// const CentralTendencyMasterclass = dynamic(
//   () => import('@/components/04-descriptive-statistics-sampling/4-1-0-CentralTendencyMasterclass'),
//   { 
//     ssr: false,
//     loading: () => (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-gray-400">Loading visualization...</div>
//       </div>
//     )
//   }
// );



// Individual components from the hub
const CentralTendencyIntuitiveIntro = dynamic(
  () => import('@/components/04-descriptive-statistics-sampling/4-1-central-tendency/4-1-1-CentralTendencyIntro'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const DescriptiveStatisticsFoundations = dynamic(
  () => import('@/components/04-descriptive-statistics-sampling/4-1-central-tendency/4-1-3-DescriptiveStatisticsFoundations'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const MathematicalFoundations = dynamic(
  () => import('@/components/04-descriptive-statistics-sampling/4-1-central-tendency/4-1-4-MathematicalFoundations'),
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


const SamplingDistributionsPropertiesBonus = dynamic(
  () => import('@/components/04-descriptive-statistics-sampling/4-3-sampling-distributions-new/4-3-2-SamplingDistributionsProperties-impl'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const CLTPropertiesMerged = dynamic(
  () => import('@/components/04-descriptive-statistics-sampling/4-3-sampling-distributions-new/4-3-2-CLTProperties-merged'),
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
      // '4-1-1-central-tendency-intro': 1, // Access through hub
      // '4-1-4-mathematical-foundations': 2, // Access through hub
      // '4-1-0-central-tendency-masterclass': 3, // Archived
      // '4-1-2-descriptive-stats-journey': 3, // Access through hub
      // '4-1-3-descriptive-statistics-foundations': 4, // Access through hub
      // '4-1-3-descriptive-stats-explorer': 6, // Archived
      
      // Histograms
      'histograms': 1,
      
      // Sampling Distributions
      'sampling-distributions-hub': 2,
      
      // T-Distribution
      't-distribution': 3,
      
      // F-Distribution
      'f-distribution-intro': 4,
      'f-distribution': 5,
      'f-distribution-journey': 6,
      'f-distribution-worked': 7,
      'f-distribution-masterclass': 8,
      'f-distribution-mastery': 9,
      'f-distribution-full-journey': 10,
      
      // Boxplots
      'boxplot-quartiles': 11,
      'boxplot-journey': 12,
      'boxplot-real-world': 13,
      
      // Bonus implementations for review
      'sampling-bonus-properties': 14,
      'clt-properties-merged': 15
    };
    
    const section = searchParams.get('section');
    if (section && sectionIdToIndex[section] !== undefined) {
      setCurrentSection(sectionIdToIndex[section]);
    }
  }, [searchParams]);

  const sections = [
    // Data Descriptions - Section 4.1
    {
      id: 'central-tendency-hub',
      title: "4.1 - Data Descriptions",
      description: "Explore numerical summaries including sample median, sample mean, quartiles, and outliers. Master the fundamental measures of centrality and spread through interactive visualizations and hands-on learning.",
      component: <CentralTendencyHub />,
      category: 'data-descriptions'
    },
    // Individual central tendency components - Access through hub
    // {
    //   id: '4-1-1-central-tendency-intro',
    //   title: "4-1-1-CentralTendencyIntro",
    //   description: "Start your journey with an intuitive introduction to central tendency concepts.",
    //   component: <CentralTendencyIntuitiveIntro />,
    //   category: 'central-tendency'
    // },
    // {
    //   id: '4-1-4-mathematical-foundations',
    //   title: "4-1-4-MathematicalFoundations",
    //   description: "Deep dive into the mathematical foundations of central tendency with proofs and advanced concepts.",
    //   component: <MathematicalFoundations />,
    //   category: 'central-tendency'
    // },
    // Archived - CentralTendencyMasterclass
    // {
    //   id: '4-1-0-central-tendency-masterclass',
    //   title: "4-1-0-CentralTendencyMasterclass",
    //   description: "A gamified learning experience with progressive stages, challenges, and achievements.",
    //   component: <CentralTendencyMasterclass />,
    //   category: 'central-tendency'
    // },
    // {
    //   id: '4-1-2-descriptive-stats-journey',
    //   title: "4-1-2-DescriptiveStatsJourney",
    //   description: "Master statistical analysis through interactive exploration and computation. Progress through central tendency, dispersion, quartiles, and outlier detection with hands-on visualization.",
    //   component: <DescriptiveStatsJourney />,
    //   category: 'central-tendency'
    // },
    // {
    //   id: '4-1-3-descriptive-statistics-foundations',
    //   title: "4-1-3-DescriptiveStatisticsFoundations",
    //   description: "Master statistical measures including quartiles, variance, standard deviation, and outlier detection.",
    //   component: <DescriptiveStatisticsFoundations />,
    //   category: 'central-tendency'
    // },
    // Archived - functionality moved to DescriptiveStatsJourney
    // {
    //   id: '4-1-3-descriptive-stats-explorer',
    //   title: "4-1-3-DescriptiveStatsExplorer",
    //   description: "Explore central tendency and dispersion measures interactively. Includes quartiles, IQR, and boxplots.",
    //   component: <DescriptiveStatsExplorer />,
    //   category: 'central-tendency'
    // },
    
    // Visual Summaries - Section 4.2
    {
      id: 'histograms',
      title: "4.2 - Visual Summaries",
      description: "Learn about histograms, shapes of datasets, skewness, and dispersion measures. Understand how to visually represent and interpret data distributions through interactive visualizations.",
      component: <HistogramHub />,
      category: 'visual-summaries'
    },
    
    // Sampling Distributions - Section 4.3
    {
      id: 'sampling-distributions-hub',
      title: "4.3 - Sampling Distributions",
      description: "Explore the behavior of sample statistics, including the sum of independent random variables, sample mean distributions, and the foundational concepts leading to the Central Limit Theorem.",
      component: <SamplingDistributionsHub />,
      category: 'sampling-distributions'
    },
    
    // Sampling Distributions (Reprise) - Section 4.5
    {
      id: 't-distribution',
      title: "4.5 - Sample Mean with Unknown Population Variance",
      description: "Understand the t-distribution and how it accounts for uncertainty when estimating population variance. Learn when and why to use t-distribution instead of normal distribution.",
      component: <TDistributionExplorer />,
      category: 'sampling-distributions-reprise'
    },
    
    // F-Distribution - Part of Section 4.5
    {
      id: 'f-distribution-intro',
      title: "4.5 - F-Distribution: Introduction",
      description: "Get an intuitive understanding of the F-distribution and its role in comparing variances between two samples.",
      component: <FDistributionIntuitiveIntro />,
      category: 'sampling-distributions-reprise'
    },
    {
      id: 'f-distribution',
      title: "4.5 - F-Distribution Explorer",
      description: "Compare variances from two samples using the F-distribution. Essential for ANOVA and variance ratio tests.",
      component: <FDistributionExplorer />,
      category: 'sampling-distributions-reprise'
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
    },
    
    {
      id: 'sampling-bonus-properties',
      title: "[REVIEW] Properties & Shape Evolution",
      description: "Bonus implementation: Side-by-side comparison showing how n affects distribution shape",
      component: <SamplingDistributionsPropertiesBonus />,
      category: 'bonus-review'
    },
    {
      id: 'clt-properties-merged',
      title: "4.3 - CLT & Properties (Merged)",
      description: "Experience the magic of the Central Limit Theorem and explore how sample size affects sampling distributions through beautiful, animated visualizations.",
      component: <CLTPropertiesMerged />,
      category: 'sampling-distributions'
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
              {sections.filter(s => s.category === 'data-descriptions' || s.category === 'central-tendency').map((section, index) => {
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
              {sections.filter(s => s.category === 'visual-summaries' || s.category === 'histograms').map((section) => {
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

          {/* Sampling Distributions */}
          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-3">Sampling Distributions & CLT</h3>
            <div className="flex flex-wrap gap-2">
              {sections.filter(s => s.category === 'sampling-distributions').map((section) => {
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
              {sections.filter(s => s.category === 'sampling-distributions-reprise' || s.category === 't-distribution').map((section) => {
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
              {sections.filter(s => s.category === 'sampling-distributions-reprise' || s.category === 'f-distribution').map((section) => {
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
          
          {/* TEMPORARY - Bonus Review */}
          <div>
            <h3 className="text-lg font-semibold text-red-400 mb-3">🎁 Bonus Implementations for Review (TEMPORARY)</h3>
            <div className="flex flex-wrap gap-2">
              {sections.filter(s => s.category === 'bonus-review').map((section) => {
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
                        ? 'bg-red-600 text-white font-semibold'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-red-600'
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