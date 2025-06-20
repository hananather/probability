"use client";
import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ConceptSection from '../../components/shared/ConceptSection.jsx';
import ErrorBoundary from '../../components/shared/ErrorBoundary.jsx';

// Lazy load all components with error handling
const SpatialRandomVariable = lazy(() => 
  import('@/components/02-discrete-random-variables/2-1-1-SpatialRandomVariable.jsx')
    .catch(() => {
      return { default: () => <div className="text-red-500">Failed to load component</div> };
    })
);

const ExpectationVariance = lazy(() => 
  import('@/components/02-discrete-random-variables/2-2-1-ExpectationVariance.jsx')
    .catch(() => {
      return { default: () => <div className="text-red-500">Failed to load component</div> };
    })
);

const ExpectationVarianceWorkedExample = lazy(() => 
  import('@/components/02-discrete-random-variables/2-2-2-ExpectationVarianceWorkedExample.jsx')
    .catch(() => {
      return { default: () => <div className="text-red-500">Failed to load component</div> };
    })
);


const LinearTransformations = lazy(() => 
  import('@/components/02-discrete-random-variables/2-3-1-LinearTransformations.jsx')
    .catch(() => {
      return { default: () => <div className="text-red-500">Failed to load component</div> };
    })
);

const FunctionTransformations = lazy(() => 
  import('@/components/02-discrete-random-variables/2-3-2-FunctionTransformations.jsx')
    .catch(() => {
      return { default: () => <div className="text-red-500">Failed to load component</div> };
    })
);

const GeometricDistribution = lazy(() => 
  import('@/components/02-discrete-random-variables/2-4-1-GeometricDistribution.jsx')
    .catch(() => {
      return { default: () => <div className="text-red-500">Failed to load component</div> };
    })
);

const BinomialDistribution = lazy(() => 
  import('@/components/02-discrete-random-variables/2-3-3-BinomialDistribution.jsx')
    .catch(() => {
      return { default: () => <div className="text-red-500">Failed to load component</div> };
    })
);

const NegativeBinomialDistribution = lazy(() => 
  import('@/components/02-discrete-random-variables/2-5-1-NegativeBinomialDistribution.jsx')
    .catch(() => {
      return { default: () => <div className="text-red-500">Failed to load component</div> };
    })
);

const PoissonDistribution = lazy(() => 
  import('@/components/02-discrete-random-variables/2-6-1-PoissonDistribution.jsx')
    .catch(() => {
      return { default: () => <div className="text-red-500">Failed to load component</div> };
    })
);

const DistributionComparison = lazy(() => 
  import('@/components/02-discrete-random-variables/2-7-1-DistributionComparison.jsx')
    .catch(() => {
      return { default: () => <div className="text-red-500">Failed to load component</div> };
    })
);

// Loading component
const LoadingComponent = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-lg text-neutral-400">Loading visualization...</div>
  </div>
);

export default function Chapter2() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contentRef = useRef(null);
  const [activeSection, setActiveSection] = useState('random-variables');

  // Read section from URL on mount and when URL changes
  useEffect(() => {
    const section = searchParams.get('section');
    if (section) {
      setActiveSection(section);
    }
  }, [searchParams]);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [activeSection]);

  const sections = [
    {
      id: 'random-variables',
      title: '2.1 Random Variables & Distributions',
      description: (
        <>
          <p className="text-base text-neutral-300 mb-3">
            A <span className="text-teal-400 font-semibold">random variable <span dangerouslySetInnerHTML={{ __html: `\\(X\\)` }} /></span> is a mapping function 
            that assigns numerical values to outcomes:
          </p>
          
          <div className="flex items-center gap-3 text-sm font-mono mb-3 ml-4">
            <span dangerouslySetInnerHTML={{ __html: `\\(X:\\)` }} />
            <span className="text-teal-400">outcome</span>
            <span className="text-neutral-500">→</span>
            <span className="text-white">numerical value</span>
          </div>
          
          <p className="text-sm text-neutral-300 mb-2">
            In this interactive visualization:
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-sm text-neutral-300 ml-4 mb-3">
            <li>Paint regions on the grid (these are your outcomes)</li>
            <li>Assign values to create the mapping <span dangerouslySetInnerHTML={{ __html: `\\(X\\)` }} /></li>
            <li>Sample to see probability emerge from region sizes</li>
          </ul>
          
          <p className="text-xs text-yellow-400/90 italic">
            💡 Larger regions = higher probability of being sampled
          </p>
        </>
      ),
      components: [SpatialRandomVariable]
    },
    {
      id: 'expectation-variance',
      title: '2.2 Expectation & Variance',
      description: (
        <>
          <p className="text-base text-neutral-300 mb-3">
            The <span className="text-teal-400 font-semibold">expectation</span> <span dangerouslySetInnerHTML={{ __html: `\\(E[X]\\)` }} /> represents the average value of a random variable,
            while <span className="text-teal-400 font-semibold">variance</span> <span dangerouslySetInnerHTML={{ __html: `\\(\\text{Var}(X)\\)` }} /> measures its spread.
          </p>
          
          <p className="text-sm text-neutral-300 mb-2">
            Explore these concepts through interactive visualizations and worked examples:
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-sm text-neutral-300 ml-4 mb-3">
            <li>Build PMFs by dragging probability bars</li>
            <li>See how expectation acts as the &ldquo;balance point&rdquo;</li>
            <li>Understand variance through visual spread</li>
            <li>Work through concrete examples with dice and engineering scenarios</li>
          </ul>
        </>
      ),
      components: [ExpectationVariance, ExpectationVarianceWorkedExample]
    },
    {
      id: 'transformations',
      title: '2.2.4 Transformations of Random Variables',
      description: (
        <>
          <p className="text-base text-neutral-300 mb-3">
            When we apply functions to random variables, we create new random variables with transformed distributions.
            Understanding these transformations is crucial for engineering applications.
          </p>
          
          <p className="text-sm text-neutral-300 mb-2">
            Explore two types of transformations:
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-sm text-neutral-300 ml-4 mb-3">
            <li><span className="text-teal-400 font-semibold">Linear transformations</span> <span dangerouslySetInnerHTML={{ __html: `\\(Y = aX + b\\)` }} /> - Scale and shift operations</li>
            <li><span className="text-teal-400 font-semibold">General functions</span> <span dangerouslySetInnerHTML={{ __html: `\\(Y = g(X)\\)` }} /> - Square, absolute value, and custom functions</li>
          </ul>
          
          <div className="bg-neutral-900 rounded-md p-3 mt-3">
            <h5 className="text-sm font-medium text-amber-400 mb-2">Key Properties to Discover</h5>
            <ul className="list-disc list-inside space-y-0.5 text-xs text-neutral-300">
              <li dangerouslySetInnerHTML={{ __html: `\\(E[aX + b] = aE[X] + b\\)` }} />
              <li dangerouslySetInnerHTML={{ __html: `\\(\\text{Var}(aX + b) = a^2\\text{Var}(X)\\)` }} />
              <li dangerouslySetInnerHTML={{ __html: `E[g(X)] \\neq g(E[X])` }} /> for non-linear functions
            </ul>
          </div>
        </>
      ),
      components: [LinearTransformations, FunctionTransformations]
    },
    {
      id: 'binomial-distribution',
      title: '2.3 Binomial Distribution',
      description: (
        <>
          <p className="text-base text-neutral-300 mb-3">
            The <span className="text-cyan-400 font-semibold">Binomial Distribution</span> models the number of successes 
            in <span dangerouslySetInnerHTML={{ __html: `\\(n\\)` }} /> independent trials, each with success probability <span dangerouslySetInnerHTML={{ __html: `\\(p\\)` }} />.
          </p>
          
          <p className="text-sm text-neutral-300 mb-2">
            Key characteristics:
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-sm text-neutral-300 ml-4 mb-3">
            <li>Fixed number of trials <span dangerouslySetInnerHTML={{ __html: `\\(n\\)` }} /></li>
            <li>Each trial is independent with constant probability <span dangerouslySetInnerHTML={{ __html: `\\(p\\)` }} /></li>
            <li>Probability of exactly <span dangerouslySetInnerHTML={{ __html: `\\(k\\)` }} /> successes: <span dangerouslySetInnerHTML={{ __html: `\\(P(X=k) = \\binom{n}{k}p^k(1-p)^{n-k}\\)` }} /></li>
            <li>Expected value: <span dangerouslySetInnerHTML={{ __html: `\\(E[X] = np\\)` }} />, Variance: <span dangerouslySetInnerHTML={{ __html: `\\(\\text{Var}(X) = np(1-p)\\)` }} /></li>
          </ul>
          
          <div className="bg-neutral-900 rounded-md p-3 mt-3">
            <h5 className="text-sm font-medium text-cyan-400 mb-2">Common Applications</h5>
            <ul className="list-disc list-inside space-y-0.5 text-xs text-neutral-300">
              <li>Quality control: defective items in a batch</li>
              <li>Medical trials: treatment success rates</li>
              <li>Network reliability: successful transmissions</li>
              <li>Manufacturing: yield rates in production</li>
            </ul>
          </div>
        </>
      ),
      components: [BinomialDistribution]
    },
    {
      id: 'geometric-distribution',
      title: '2.4 Geometric Distribution',
      description: (
        <>
          <p className="text-base text-neutral-300 mb-3">
            The <span className="text-orange-400 font-semibold">Geometric Distribution</span> models the number of trials 
            needed until the first success occurs. It&apos;s the discrete analogue of &ldquo;waiting time.&rdquo;
          </p>
          
          <p className="text-sm text-neutral-300 mb-2">
            Key characteristics:
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-sm text-neutral-300 ml-4 mb-3">
            <li>Models repeated independent trials with constant success probability <span dangerouslySetInnerHTML={{ __html: `\\(p\\)` }} /></li>
            <li>Probability of first success on trial <span dangerouslySetInnerHTML={{ __html: `\\(k\\)` }} />: <span dangerouslySetInnerHTML={{ __html: `\\(P(X=k) = (1-p)^{k-1}p\\)` }} /></li>
            <li>Expected number of trials: <span dangerouslySetInnerHTML={{ __html: `\\(E[X] = 1/p\\)` }} /></li>
            <li>Memoryless property: past failures don&apos;t affect future probabilities</li>
          </ul>
          
          <div className="bg-neutral-900 rounded-md p-3 mt-3">
            <h5 className="text-sm font-medium text-orange-400 mb-2">Real-world Applications</h5>
            <ul className="list-disc list-inside space-y-0.5 text-xs text-neutral-300">
              <li>Quality control: inspections until finding a defect</li>
              <li>Network packets: transmissions until successful delivery</li>
              <li>Manufacturing: items produced until first failure</li>
              <li>Clinical trials: patients treated until first success</li>
            </ul>
          </div>
        </>
      ),
      components: [GeometricDistribution]
    },
    {
      id: 'negative-binomial-distribution',
      title: '2.5 Negative Binomial Distribution',
      description: (
        <>
          <p className="text-base text-neutral-300 mb-3">
            The <span className="text-violet-400 font-semibold">Negative Binomial Distribution</span> extends the geometric distribution, 
            modeling the number of trials needed to achieve <span dangerouslySetInnerHTML={{ __html: `\\(r\\)` }} /> successes.
          </p>
          
          <p className="text-sm text-neutral-300 mb-2">
            Key characteristics:
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-sm text-neutral-300 ml-4 mb-3">
            <li>Generalizes geometric distribution (which is the special case <span dangerouslySetInnerHTML={{ __html: `\\(r=1\\)` }} />)</li>
            <li>Probability of <span dangerouslySetInnerHTML={{ __html: `\\(r\\)` }} />th success on trial <span dangerouslySetInnerHTML={{ __html: `\\(k\\)` }} />: <span dangerouslySetInnerHTML={{ __html: `\\(P(X=k) = \\binom{k-1}{r-1}p^r(1-p)^{k-r}\\)` }} /></li>
            <li>Expected trials: <span dangerouslySetInnerHTML={{ __html: `\\(E[X] = r/p\\)` }} /></li>
            <li>Variance: <span dangerouslySetInnerHTML={{ __html: `\\(\\text{Var}(X) = r(1-p)/p^2\\)` }} /></li>
          </ul>
          
          <div className="bg-neutral-900 rounded-md p-3 mt-3">
            <h5 className="text-sm font-medium text-violet-400 mb-2">Applications</h5>
            <ul className="list-disc list-inside space-y-0.5 text-xs text-neutral-300">
              <li>Quality assurance: items inspected to find <span dangerouslySetInnerHTML={{ __html: `\\(r\\)` }} /> defects</li>
              <li>Sports: games played until <span dangerouslySetInnerHTML={{ __html: `\\(r\\)` }} /> wins</li>
              <li>Polling: people surveyed until <span dangerouslySetInnerHTML={{ __html: `\\(r\\)` }} /> agree</li>
              <li>Sales: calls made until <span dangerouslySetInnerHTML={{ __html: `\\(r\\)` }} /> sales</li>
            </ul>
          </div>
        </>
      ),
      components: [NegativeBinomialDistribution]
    },
    {
      id: 'poisson-distribution',
      title: '2.6 Poisson Distribution',
      description: (
        <>
          <p className="text-base text-neutral-300 mb-3">
            The <span className="text-emerald-400 font-semibold">Poisson Distribution</span> models the number of events 
            occurring in a fixed interval of time or space, when events occur at a constant average rate <span dangerouslySetInnerHTML={{ __html: `\\(\\lambda\\)` }} />.
          </p>
          
          <p className="text-sm text-neutral-300 mb-2">
            Key characteristics:
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-sm text-neutral-300 ml-4 mb-3">
            <li>Events occur independently at constant rate <span dangerouslySetInnerHTML={{ __html: `\\(\\lambda\\)` }} /></li>
            <li>Probability of <span dangerouslySetInnerHTML={{ __html: `\\(k\\)` }} /> events: <span dangerouslySetInnerHTML={{ __html: `\\(P(X=k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}\\)` }} /></li>
            <li className="text-yellow-400">Unique property: <span dangerouslySetInnerHTML={{ __html: `\\(E[X] = \\text{Var}(X) = \\lambda\\)` }} /></li>
            <li>Approximates binomial when <span dangerouslySetInnerHTML={{ __html: `\\(n \\to \\infty\\)` }} />, <span dangerouslySetInnerHTML={{ __html: `\\(p \\to 0\\)` }} />, <span dangerouslySetInnerHTML={{ __html: `\\(np = \\lambda\\)` }} /></li>
          </ul>
          
          <div className="bg-neutral-900 rounded-md p-3 mt-3">
            <h5 className="text-sm font-medium text-emerald-400 mb-2">Common Applications</h5>
            <ul className="list-disc list-inside space-y-0.5 text-xs text-neutral-300">
              <li>Call centers: calls per hour</li>
              <li>Server requests: hits per minute</li>
              <li>Radioactive decay: particles per second</li>
              <li>Manufacturing defects: flaws per meter</li>
            </ul>
          </div>
        </>
      ),
      components: [PoissonDistribution]
    },
    {
      id: 'distribution-comparison',
      title: '2.7 Distribution Comparison',
      description: (
        <>
          <p className="text-base text-neutral-300 mb-3">
            Compare different discrete distributions side-by-side to understand their relationships and 
            when to use each one.
          </p>
          
          <p className="text-sm text-neutral-300 mb-2">
            Key insights to explore:
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-sm text-neutral-300 ml-4 mb-3">
            <li>Negative Binomial with <span dangerouslySetInnerHTML={{ __html: `\\(r=1\\)` }} /> equals Geometric</li>
            <li>Poisson approximates Binomial for large <span dangerouslySetInnerHTML={{ __html: `\\(n\\)` }} />, small <span dangerouslySetInnerHTML={{ __html: `\\(p\\)` }} /></li>
            <li>Compare shapes, spreads, and tail behaviors</li>
            <li>Understand parameter effects across distributions</li>
          </ul>
          
          <div className="bg-neutral-900 rounded-md p-3 mt-3">
            <h5 className="text-sm font-medium text-purple-400 mb-2">Selection Guide</h5>
            <ul className="list-disc list-inside space-y-0.5 text-xs text-neutral-300">
              <li><strong>Fixed trials, count successes:</strong> Binomial</li>
              <li><strong>Trials until first success:</strong> Geometric</li>
              <li><strong>Trials until r successes:</strong> Negative Binomial</li>
              <li><strong>Events in fixed interval:</strong> Poisson</li>
            </ul>
          </div>
        </>
      ),
      components: [DistributionComparison]
    }
  ];

  const activeContent = sections.find(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4" ref={contentRef}>
        {/* Chapter Header */}
        <div className="max-w-4xl mx-auto mb-4">
          <h1 className="text-2xl font-bold text-white mb-2">
            Chapter 2: Discrete Random Variables
          </h1>
          <p className="text-base text-neutral-400">
            Understanding probability through mapping functions
          </p>
        </div>

        {/* Section Navigation */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id);
                router.push(`/chapter2?section=${section.id}`);
              }}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeSection === section.id
                  ? 'bg-blue-600 text-white font-semibold'
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
            <div className="max-w-4xl mx-auto mb-4">
              <h2 className="text-2xl font-bold text-white mb-4">{activeContent.title}</h2>
              {activeContent.description}
            </div>

            {/* Render all components for the active section */}
            <div className="max-w-7xl mx-auto space-y-8">
              {activeContent.components.map((Component, index) => (
                <ErrorBoundary key={`${activeContent.id}-${index}`} componentName={activeContent.title}>
                  <Suspense fallback={<LoadingComponent />}>
                    <Component />
                  </Suspense>
                </ErrorBoundary>
              ))}
            </div>
          </>
        )}

        {/* Mathematical Note */}
        {activeSection === 'random-variables' && (
          <div className="max-w-4xl mx-auto mt-6 pt-4 border-t border-neutral-800/50">
            <p className="text-sm text-neutral-400">
              <span dangerouslySetInnerHTML={{ __html: `Formally: \\(X: \\Omega \\to \\mathbb{R}\\) where \\(P(X=x) = P(\\{\\omega \\in \\Omega : X(\\omega) = x\\})\\)` }} />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}