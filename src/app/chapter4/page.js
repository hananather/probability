"use client";

import { useState } from 'react';
import MeanMedianMode from '@/components/04-descriptive-statistics-sampling/MeanMedianMode';
import { TDistributionExplorer } from '@/components/04-descriptive-statistics-sampling/TDistributionExplorer';
import HistogramShapeExplorer from '@/components/04-descriptive-statistics-sampling/HistogramShapeExplorer';
import DescriptiveStatsExplorer from '@/components/04-descriptive-statistics-sampling/DescriptiveStatsExplorer';
import { FDistributionExplorer } from '@/components/04-descriptive-statistics-sampling/FDistributionExplorer';
import ConceptSection from '@/components/ConceptSection';

export default function Chapter4Page() {
  const [currentSection, setCurrentSection] = useState(0);

  const sections = [
    {
      title: "Measures of Central Tendency",
      description: "Learn about mean, median, and mode - the three fundamental ways to describe the center of a dataset.",
      component: <MeanMedianMode />
    },
    {
      title: "Histograms & Data Shapes",
      description: "Explore how histograms represent data distributions and learn to identify symmetric, right-skewed, and left-skewed datasets.",
      component: <HistogramShapeExplorer />
    },
    {
      title: "Interactive Statistics Explorer",
      description: "Explore central tendency and dispersion measures interactively. Drag data points, observe outlier effects, and understand statistical robustness.",
      component: <DescriptiveStatsExplorer />
    },
    {
      title: "t-Distribution vs Normal",
      description: "Explore how the t-distribution accounts for uncertainty when estimating population variance and converges to normal as sample size increases.",
      component: <TDistributionExplorer />
    },
    {
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
              onClick={() => setCurrentSection(index)}
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