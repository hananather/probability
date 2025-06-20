"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

// Introduction component
const BridgeToContinuous = dynamic(
  () => import('@/components/03-continuous-random-variables/3-0-1-BridgeToContinuousClient').then(mod => ({ default: mod.default })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

// Section 3.1 - Probability Density Functions
const ContinuousDistributionsPDF = dynamic(
  () => import('@/components/03-continuous-random-variables/3-1-1-ContinuousDistributionsPDFClient').then(mod => ({ default: mod.default })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const IntegralWorkedExample = dynamic(
  () => import('@/components/03-continuous-random-variables/3-1-2-IntegralWorkedExample').then(mod => ({ default: mod.IntegralWorkedExample })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

// Section 3.2 - Expectation and Variance
const ContinuousExpectationVariance = dynamic(
  () => import('@/components/03-continuous-random-variables/3-2-1-ContinuousExpectationVarianceClient').then(mod => ({ default: mod.default })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

// Section 3.3 - Normal Distributions
const NormalZScoreExplorer = dynamic(
  () => import('@/components/03-continuous-random-variables/3-3-1-NormalZScoreExplorerClient').then(mod => ({ default: mod.default })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const NormalZScoreWorkedExample = dynamic(
  () => import('@/components/03-continuous-random-variables/3-3-2-NormalZScoreWorkedExample').then(mod => ({ default: mod.NormalZScoreWorkedExample })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const EmpiricalRule = dynamic(
  () => import('@/components/03-continuous-random-variables/3-3-3-EmpiricalRuleClient').then(mod => ({ default: mod.default })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const ZTableLookup = dynamic(
  () => import('@/components/03-continuous-random-variables/3-3-4-ZTableLookupClient').then(mod => ({ default: mod.default })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const ZScorePracticeProblems = dynamic(
  () => import('@/components/03-continuous-random-variables/3-3-5-ZScorePracticeProblemsClient').then(mod => ({ default: mod.default })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

// Section 3.4 - Exponential Distributions
const ExponentialDistribution = dynamic(
  () => import('@/components/03-continuous-random-variables/3-4-1-ExponentialDistributionClient').then(mod => ({ default: mod.default })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const ExponentialDistributionWorkedExample = dynamic(
  () => import('@/components/03-continuous-random-variables/3-4-2-ExponentialDistributionWorkedExample').then(mod => ({ default: mod.ExponentialDistributionWorkedExample })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

// Section 3.5 - Gamma Distributions
const GammaDistribution = dynamic(
  () => import('@/components/03-continuous-random-variables/3-5-1-GammaDistributionClient').then(mod => ({ default: mod.default })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const GammaDistributionWorkedExample = dynamic(
  () => import('@/components/03-continuous-random-variables/3-5-2-GammaDistributionWorkedExample').then(mod => ({ default: mod.GammaDistributionWorkedExample })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

// Section 3.6 - Joint Distributions
const JointDistributions = dynamic(
  () => import('@/components/03-continuous-random-variables/3-6-1-JointDistributionsClient').then(mod => ({ default: mod.default })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const JointDistributionWorkedExample = dynamic(
  () => import('@/components/03-continuous-random-variables/3-6-2-JointDistributionWorkedExample').then(mod => ({ default: mod.JointDistributionWorkedExample })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const JointProbabilityCalculator = dynamic(
  () => import('@/components/03-continuous-random-variables/3-6-3-JointProbabilityCalculatorClient').then(mod => ({ default: mod.default })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

// Section 3.7 - Normal Approximation
const NormalApproxBinomial = dynamic(
  () => import('@/components/03-continuous-random-variables/3-7-1-NormalApproxBinomialClient').then(mod => ({ default: mod.default })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const NormalApproxBinomialWorkedExample = dynamic(
  () => import('@/components/03-continuous-random-variables/3-7-2-NormalApproxBinomialWorkedExample').then(mod => ({ default: mod.NormalApproxBinomialWorkedExample })),
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

export default function Chapter3Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentSection, setCurrentSection] = useState(0);

  // Read section from URL on mount and when URL changes
  useEffect(() => {
    // Map section IDs to indices
    const sectionIdToIndex = {
      'introduction': 0,
      'probability-density': 1,
      'expectation-variance': 2,
      'normal-distributions': 3,
      'exponential': 4,
      'gamma': 5,
      'joint': 6,
      'normal-approximation': 7
    };
    
    const section = searchParams.get('section');
    console.log('Chapter 3 - URL section param:', section);
    console.log('Chapter 3 - Current section state:', currentSection);
    
    if (section && sectionIdToIndex[section] !== undefined) {
      console.log('Chapter 3 - Setting section to index:', sectionIdToIndex[section]);
      setCurrentSection(sectionIdToIndex[section]);
    }
  }, [searchParams]);

  const sections = [
    {
      id: 'introduction',
      title: "Introduction: Bridge to Continuous",
      description: "Understand the transition from discrete to continuous probability. Explore why exact values have zero probability and how histograms approximate continuous curves.",
      component: <BridgeToContinuous />
    },
    {
      id: 'probability-density',
      title: "3.1 Probability Density Functions",
      description: "Learn how continuous random variables are described by PDFs. Calculate probabilities using integration and explore worked examples.",
      component: (
        <div className="space-y-8">
          <ContinuousDistributionsPDF />
          <IntegralWorkedExample />
        </div>
      )
    },
    {
      id: 'expectation-variance',
      title: "3.2 Expectation & Variance",
      description: "Master the computation of expected value and variance for continuous distributions using integration.",
      component: <ContinuousExpectationVariance />
    },
    {
      id: 'normal-distributions',
      title: "3.3 Normal Distributions",
      description: "Explore the most important continuous distribution. Learn about z-scores, the empirical rule, and how to use z-tables.",
      component: (
        <div className="space-y-8">
          <NormalZScoreExplorer />
          <NormalZScoreWorkedExample />
          <EmpiricalRule />
          <ZTableLookup />
          <ZScorePracticeProblems />
        </div>
      )
    },
    {
      id: 'exponential',
      title: "3.4 Exponential Distributions",
      description: "Study the distribution of waiting times. Explore memoryless property and real-world applications.",
      component: (
        <div className="space-y-8">
          <ExponentialDistribution />
          <ExponentialDistributionWorkedExample />
        </div>
      )
    },
    {
      id: 'gamma',
      title: "3.5 Gamma Distributions",
      description: "Generalize the exponential distribution. Understand shape and scale parameters through interactive exploration.",
      component: (
        <div className="space-y-8">
          <GammaDistribution />
          <GammaDistributionWorkedExample />
        </div>
      )
    },
    {
      id: 'joint',
      title: "3.6 Joint Distributions",
      description: "Explore relationships between multiple continuous random variables through interactive visualizations of joint PDFs, marginal distributions, and conditional probabilities.",
      component: (
        <div className="space-y-8">
          <JointDistributions />
          <JointProbabilityCalculator />
          <JointDistributionWorkedExample />
        </div>
      )
    },
    {
      id: 'normal-approximation',
      title: "3.7 Normal Approximation",
      description: "Learn when and how to approximate the binomial distribution with the normal distribution.",
      component: (
        <div className="space-y-8">
          <NormalApproxBinomial />
          <NormalApproxBinomialWorkedExample />
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F0F10] text-white">
      <div className="mx-auto max-w-screen-2xl px-4 py-8">
        <h1 className="text-4xl font-bold mb-6 text-center">
          Chapter 3: Continuous Random Variables
        </h1>
        
        <div className="mb-8 text-center">
          <p className="text-lg text-neutral-300 max-w-3xl mx-auto">
            Make the leap from discrete to continuous probability. Master integration, 
            probability density functions, and the most important continuous distributions.
          </p>
        </div>

        {/* Section Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentSection(index);
                router.push(`/chapter3?section=${section.id}`);
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
        </div>

        {/* Current Section */}
        <ConceptSection
          title={sections[currentSection].title}
          description={sections[currentSection].description}
        >
          {sections[currentSection].component}
        </ConceptSection>
      </div>
    </div>
  );
}