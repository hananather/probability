"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import ConceptSection from '../../components/shared/ConceptSection.jsx';

// Existing components
const BayesianInference = dynamic(
  () => import('../../components/05-estimation/5-1-1-BayesianInference.jsx').then(mod => ({ default: mod.BayesianInference })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

// New high-quality components
const InteractiveInferenceJourney = dynamic(
  () => import('../../components/05-estimation/5-1-2-InteractiveInferenceJourney.jsx'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const PointEstimation = dynamic(
  () => import('../../components/05-estimation/5-2-1-PointEstimation.jsx'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const ConfidenceIntervalMasterclass = dynamic(
  () => import('../../components/05-estimation/5-2-2-ConfidenceIntervalMasterclass.jsx'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const ConfidenceInterval = dynamic(
  () => import('../../components/05-estimation/5-3-1-ConfidenceInterval.jsx'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const SampleSizeLaboratory = dynamic(
  () => import('../../components/05-estimation/5-3-2-SampleSizeLaboratory.jsx'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const Bootstrapping = dynamic(
  () => import('../../components/05-estimation/5-4-1-Bootstrapping.jsx'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const TDistributionShowcase = dynamic(
  () => import('../../components/05-estimation/5-4-2-TDistributionShowcase.jsx'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

const ProportionEstimationStudio = dynamic(
  () => import('../../components/05-estimation/5-5-1-ProportionEstimationStudio.jsx'),
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
  const [activeSection, setActiveSection] = useState('bayesian');

  // Read section from URL on mount and when URL changes
  useEffect(() => {
    const section = searchParams.get('section');
    if (section) {
      setActiveSection(section);
    }
  }, [searchParams]);

  const sections = [
    {
      id: 'bayesian',
      title: '5.1 Bayesian Inference',
      component: BayesianInference,
      description: (
        <>
          <p>
            Bayesian inference updates our beliefs based on new evidence. This powerful
            framework is essential for medical diagnosis, machine learning, and decision
            making under uncertainty.
          </p>
          <p>
            Explore how a medical test&apos;s accuracy combines with disease prevalence to
            determine the actual probability of having a disease given a positive test.
          </p>
        </>
      )
    },
    {
      id: 'inference-journey',
      title: '5.1 Interactive Inference Journey',
      component: InteractiveInferenceJourney,
      description: (
        <>
          <p>
            Statistical inference is the process of drawing conclusions about a population
            based on sample data. This fundamental concept underlies all of statistical
            estimation and hypothesis testing.
          </p>
          <p>
            Explore the beautiful journey from population to sample to statistic, and see
            how sampling distributions emerge through interactive animations.
          </p>
        </>
      )
    },
    {
      id: 'point-estimation',
      title: '5.2 Point Estimation',
      component: PointEstimation,
      description: (
        <>
          <p>
            Point estimation finds single values that best estimate population parameters
            from sample data. Common estimators include the sample mean for population
            mean and sample variance for population variance.
          </p>
          <p>
            Visualize how sample statistics converge to population parameters as sample
            size increases, demonstrating consistency and unbiasedness.
          </p>
        </>
      )
    },
    {
      id: 'ci-masterclass',
      title: '5.2 Confidence Interval Masterclass',
      component: ConfidenceIntervalMasterclass,
      description: (
        <>
          <p>
            Master the construction and interpretation of confidence intervals with this
            comprehensive three-panel visualization. Explore critical values, the 68-95-99.7
            rule, and see confidence intervals in action.
          </p>
          <p>
            Build intervals, compare methods, and understand the long-run coverage behavior
            that makes confidence intervals such a powerful statistical tool.
          </p>
        </>
      )
    },
    {
      id: 'ci-simulation',
      title: '5.3 Confidence Interval Simulation',
      component: ConfidenceInterval,
      description: (
        <>
          <p>
            Confidence intervals provide a range of plausible values for a parameter.
            A 95% confidence interval means that if we repeated our sampling process
            many times, 95% of the intervals would contain the true parameter.
          </p>
          <p>
            Build intuition by generating multiple confidence intervals and observing
            their coverage properties in real-time.
          </p>
        </>
      )
    },
    {
      id: 'sample-size-lab',
      title: '5.3 Sample Size Laboratory',
      component: SampleSizeLaboratory,
      description: (
        <>
          <p>
            Explore the critical relationship between sample size, margin of error, and
            confidence level. This interactive laboratory features stunning 3D visualizations
            and practical cost-benefit analysis.
          </p>
          <p>
            Calculate optimal sample sizes for means and proportions, discover the square
            root law, and apply your knowledge to real-world scenarios.
          </p>
        </>
      )
    },
    {
      id: 'bootstrapping',
      title: '5.4 Bootstrapping',
      component: Bootstrapping,
      description: (
        <>
          <p>
            Bootstrapping estimates sampling distributions by resampling from the data
            itself. This powerful technique works when theoretical distributions are
            unknown or complex.
          </p>
          <p>
            See how resampling with replacement creates a distribution of statistics,
            enabling confidence interval construction without assumptions.
          </p>
        </>
      )
    },
    {
      id: 't-distribution',
      title: '5.4 t-Distribution Showcase',
      component: TDistributionShowcase,
      description: (
        <>
          <p>
            When the population standard deviation σ is unknown, we use the t-distribution
            and the sample standard deviation s to construct confidence intervals.
            Watch the beautiful animation as t approaches normal.
          </p>
          <p>
            Compare t-intervals with z-intervals, explore small sample scenarios, and
            understand when each distribution is appropriate.
          </p>
        </>
      )
    },
    {
      id: 'proportion-studio',
      title: '5.5 Proportion Estimation Studio',
      component: ProportionEstimationStudio,
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