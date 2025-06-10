"use client";
import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ConceptSection from '../../components/ConceptSection.jsx';
import ErrorBoundary from '../../components/ErrorBoundary.jsx';

// Lazy load all components with error handling
const SpatialRandomVariable = lazy(() => 
  import('@/components/02-discrete-random-variables/SpatialRandomVariable')
    .catch(() => {
      return { default: () => <div className="text-red-500">Failed to load component</div> };
    })
);

const ExpectationVariance = lazy(() => 
  import('@/components/02-discrete-random-variables/ExpectationVariance')
    .catch(() => {
      return { default: () => <div className="text-red-500">Failed to load component</div> };
    })
);

const ExpectationVarianceWorkedExample = lazy(() => 
  import('@/components/02-discrete-random-variables/ExpectationVarianceWorkedExample')
    .catch(() => {
      return { default: () => <div className="text-red-500">Failed to load component</div> };
    })
);

const LinearTransformations = lazy(() => 
  import('@/components/02-discrete-random-variables/LinearTransformations')
    .catch(() => {
      return { default: () => <div className="text-red-500">Failed to load component</div> };
    })
);

const FunctionTransformations = lazy(() => 
  import('@/components/02-discrete-random-variables/FunctionTransformations')
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
      title: '2.3 Transformations of Random Variables',
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