"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import ConceptSection from '../../components/shared/ConceptSection.jsx';

// Section hub components
const StatisticalInferenceHub = dynamic(
  () => import('../../components/05-estimation/5-1-statistical-inference/index.jsx'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const CIKnownVarianceHub = dynamic(
  () => import('../../components/05-estimation/5-2-ci-known-variance/index.jsx'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const SampleSizeHub = dynamic(
  () => import('../../components/05-estimation/5-3-sample-size/index.jsx'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const CIUnknownVarianceHub = dynamic(
  () => import('../../components/05-estimation/5-4-ci-unknown-variance/index.jsx'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const ProportionsHub = dynamic(
  () => import('../../components/05-estimation/5-5-proportions/index.jsx'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

export default function Chapter5() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState('statistical-inference');

  // Read section from URL on mount and when URL changes
  useEffect(() => {
    const section = searchParams.get('section');
    if (section) {
      setActiveSection(section);
    }
  }, [searchParams]);

  const sections = [
    {
      id: 'statistical-inference',
      title: '5.1 Statistical Inference',
      component: StatisticalInferenceHub,
      section: 'statistical-inference',
      description: (
        <>
          <p>
            Statistical inference is the process of drawing conclusions about a population
            based on sample data. This fundamental concept underlies all of statistical
            estimation and hypothesis testing.
          </p>
          <p>
            Explore Bayesian inference, the journey from population to sample, and point
            estimation techniques through interactive visualizations.
          </p>
        </>
      )
    },
    {
      id: 'ci-known-variance',
      title: '5.2 Confidence Intervals (σ Known)',
      component: CIKnownVarianceHub,
      section: 'ci-known-variance',
      description: (
        <>
          <p>
            When the population standard deviation σ is known, we can construct confidence
            intervals using the normal distribution. Master the construction and interpretation
            of confidence intervals.
          </p>
          <p>
            Build intervals, explore the 68-95-99.7 rule, and understand coverage properties
            through comprehensive visualizations and simulations.
          </p>
        </>
      )
    },
    {
      id: 'sample-size',
      title: '5.3 Sample Size Determination',
      component: SampleSizeHub,
      section: 'sample-size',
      description: (
        <>
          <p>
            Explore the critical relationship between sample size, margin of error, and
            confidence level. Learn how to calculate optimal sample sizes for different
            scenarios.
          </p>
          <p>
            Interactive laboratories feature stunning 3D visualizations, practical cost-benefit
            analysis, and real-world applications.
          </p>
        </>
      )
    },
    {
      id: 'ci-unknown-variance',
      title: '5.4 Confidence Intervals (σ Unknown)',
      component: CIUnknownVarianceHub,
      section: 'ci-unknown-variance',
      description: (
        <>
          <p>
            When the population standard deviation σ is unknown, we use the t-distribution
            and the sample standard deviation s. Learn about bootstrapping and the beautiful
            properties of the t-distribution.
          </p>
          <p>
            Compare t-intervals with z-intervals, explore small sample scenarios, and master
            modern resampling techniques.
          </p>
        </>
      )
    },
    {
      id: 'proportions',
      title: '5.5 Proportion Confidence Intervals',
      component: ProportionsHub,
      section: 'proportions',
      description: (
        <>
          <p>
            Apply confidence intervals to real-world proportion problems including election
            polling, quality control, and A/B testing. Compare different CI methods and
            understand when each is appropriate.
          </p>
          <p>
            Interactive scenarios bring statistical concepts to life with beautiful
            visualizations and practical insights.
          </p>
        </>
      )
    }
  ];

  const activeContent = sections.find(s => s.id === activeSection);
  const ActiveComponent = activeContent?.component;

  return (
    <div className="min-h-screen bg-[#0F0F10]">
      <div className="space-y-8 p-4 max-w-7xl mx-auto">
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <h1 className="text-3xl font-bold text-white mb-2">Chapter 5: Estimation</h1>
          <p className="text-neutral-400">MAT 2377 - Interactive Visualizations</p>
          <hr style={{ margin: '2rem auto', width: '50%' }} />
        </div>

        {/* Section Navigation */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id);
                router.push(`/chapter5?section=${section.id}`);
              }}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeSection === section.id
                  ? 'bg-violet-600 text-white font-semibold'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>

        {/* Active Section Content */}
        {activeContent && (
          <>
            <h2 className="text-2xl font-bold text-white mt-8">{activeContent.title}</h2>
            <ConceptSection
              title={activeContent.title.split(' ').slice(1).join(' ')}
              description={activeContent.description}
            >
              {ActiveComponent && <ActiveComponent />}
            </ConceptSection>
          </>
        )}
      </div>
    </div>
  );
}