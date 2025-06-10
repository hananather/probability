"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const MeanMedianMode = dynamic(
  () => import('@/components/04-descriptive-statistics-sampling/4-1-1-MeanMedianMode'),
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
  () => import('@/components/04-descriptive-statistics-sampling/4-3-1-DescriptiveStatsExplorer'),
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
import ConceptSection from '@/components/shared/ConceptSection';

export default function Chapter4Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentSection, setCurrentSection] = useState(0);

  // Read section from URL on mount and when URL changes
  useEffect(() => {
    // Map section IDs to indices
    const sectionIdToIndex = {
      'measures-central': 0,
      'histograms': 1,
      'stats-explorer': 2,
      't-distribution': 3,
      'f-distribution': 4
    };
    
    const section = searchParams.get('section');
    if (section && sectionIdToIndex[section] !== undefined) {
      setCurrentSection(sectionIdToIndex[section]);
    }
  }, [searchParams]);

  const sections = [
    {
      id: 'measures-central',
      title: "Measures of Central Tendency",
      description: "Learn about mean, median, and mode - the three fundamental ways to describe the center of a dataset.",
      component: <MeanMedianMode />
    },
    {
      id: 'histograms',
      title: "Histograms & Data Shapes",
      description: "Explore how histograms represent data distributions and learn to identify symmetric, right-skewed, and left-skewed datasets.",
      component: <HistogramShapeExplorer />
    },
    {
      id: 'stats-explorer',
      title: "Interactive Statistics Explorer",
      description: "Explore central tendency and dispersion measures interactively. Drag data points, observe outlier effects, and understand statistical robustness.",
      component: <DescriptiveStatsExplorer />
    },
    {
      id: 't-distribution',
      title: "t-Distribution vs Normal",
      description: "Explore how the t-distribution accounts for uncertainty when estimating population variance and converges to normal as sample size increases.",
      component: <TDistributionExplorer />
    },
    {
      id: 'f-distribution',
      title: "F-Distribution Explorer",
      description: "Compare variances from two samples using the F-distribution. Essential for ANOVA and variance ratio tests.",
      component: <FDistributionExplorer />
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

        {/* Section Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentSection(index);
                router.push(`/chapter4?section=${section.id}`);
              }}
              className={`px-4 py-2 rounded-lg transition-all ${
                currentSection === index
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {section.title}
            </button>
          ))}
          
          {/* Coming Soon buttons */}
          <button
            disabled
            className="px-4 py-2 rounded-lg bg-neutral-900 text-neutral-500 cursor-not-allowed"
          >
            Sampling Distributions (Coming Soon)
          </button>
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
            standard deviation, quartiles, and sampling distributions will be added soon!
          </p>
        </div>
      </div>
    </div>
  );
}