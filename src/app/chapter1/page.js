"use client";
import { useState, useEffect, Suspense, lazy } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ConceptSection from '../../components/shared/ConceptSection.jsx';
import ErrorBoundary from '../../components/shared/ErrorBoundary.jsx';

// Lazy load all components with error handling
const SampleSpacesEvents = lazy(() => 
  import('../../components/01-introduction-to-probabilities/1-1-1-SampleSpacesEvents.jsx')
    .catch(() => {
      return { default: () => <div className="text-red-500">Failed to load component</div> };
    })
);
const CountingTechniques = lazy(() => 
  import('../../components/01-introduction-to-probabilities/1-2-1-CountingTechniques.jsx')
    .catch(() => {
      return { default: () => <div className="text-red-500">Failed to load component</div> };
    })
);
const OrderedSamples = lazy(() => 
  import('../../components/01-introduction-to-probabilities/1-3-1-OrderedSamples.jsx')
    .catch(() => {
      return { default: () => <div className="text-red-500">Failed to load component</div> };
    })
);
const UnorderedSamples = lazy(() => 
  import('../../components/01-introduction-to-probabilities/1-4-1-UnorderedSamples.jsx')
    .catch(() => {
      return { default: () => <div className="text-red-500">Failed to load component</div> };
    })
);
const ProbabilityEvent = lazy(() => 
  import('../../components/01-introduction-to-probabilities/1-5-1-ProbabilityEvent.jsx')
    .catch(() => {
      return { default: () => <div className="text-red-500">Failed to load component</div> };
    })
);
const ConditionalProbability = lazy(() => 
  import('../../components/01-introduction-to-probabilities/1-6-1-ConditionalProbability.jsx')
    .catch(() => {
      return { default: () => <div className="text-red-500">Failed to load component</div> };
    })
);
// Individual Monty Hall components are now handled inside MontyHallJourney
// const MontyHallInteractive = lazy(() => 
//   import('../../components/01-introduction-to-probabilities/1-7-monty-hall/1-7-2-MontyHallGame.jsx')
//     .catch(() => {
//       return { default: () => <div className="text-red-500">Failed to load component</div> };
//     })
// );
// const MontyHallBayesian = lazy(() => 
//   import('../../components/01-introduction-to-probabilities/1-7-monty-hall/1-7-3-MontyHallBayesProof.jsx')
//     .catch(() => {
//       return { default: () => <div className="text-red-500">Failed to load component</div> };
//     })
// );
// const MontyHallSimulation = lazy(() => 
//   import('../../components/01-introduction-to-probabilities/1-7-monty-hall/1-7-4-MontyHallSimulation.jsx')
//     .catch(() => {
//       return { default: () => <div className="text-red-500">Failed to load component</div> };
//     })
// );
const MontyHallJourney = lazy(() => 
  import('../../components/01-introduction-to-probabilities/1-7-monty-hall/1-7-0-MontyHallHub.jsx')
    .catch(() => {
      return { default: () => <div className="text-red-500">Failed to load component</div> };
    })
);
const ProbabilisticFallacies = lazy(() => 
  import('../../components/01-introduction-to-probabilities/1-9-probabilistic-fallacies/1-9-1-ProbabilisticFallacies.jsx')
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

export default function Chapter1() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState('sample-spaces');

  // Read section from URL on mount and when URL changes
  useEffect(() => {
    const section = searchParams.get('section');
    if (section) {
      setActiveSection(section);
    }
  }, [searchParams]);


  const sections = [
    {
      id: 'sample-spaces',
      title: '1.1 Sample Spaces and Events',
      component: SampleSpacesEvents,
      description: (
        <>
          <p>
            A sample space is the set of all possible outcomes of a random experiment.
            Events are subsets of the sample space. We can combine events using set 
            operations: union (∪), intersection (∩), and complement (&apos;).
          </p>
          <p>
            Use the interactive Venn diagram below to explore how different set operations
            work. Try expressions like A∪B, A∩C, or (A∪B)&apos;.
          </p>
        </>
      )
    },
    {
      id: 'counting',
      title: '1.2 Counting Techniques',
      component: CountingTechniques,
      description: (
        <>
          <p>
            Counting techniques help us determine the number of ways events can occur.
            <strong> Permutations</strong> count arrangements where order matters (nPr),
            while <strong>combinations</strong> count selections where order doesn&apos;t matter (nCr).
          </p>
          <p>
            The tree diagram below visualizes how these counting principles work. Notice
            how combinations merge branches with the same letters in different orders.
          </p>
        </>
      )
    },
    {
      id: 'ordered',
      title: '1.3 Ordered Samples (Permutations)',
      component: OrderedSamples,
      description: (
        <>
          <p>
            When we select items and the order matters, we&apos;re counting permutations.
            The number of ways depends on whether we can reuse items (with replacement)
            or not (without replacement).
          </p>
          <p>
            Watch how balls are drawn from the bag to form sequences. With replacement,
            balls return to the bag; without replacement, each ball can only be used once.
          </p>
        </>
      )
    },
    {
      id: 'unordered',
      title: '1.4 Unordered Samples (Combinations)',
      component: UnorderedSamples,
      description: (
        <>
          <p>
            When order doesn&apos;t matter, we count combinations. The binomial coefficient
            C(n,r) tells us how many ways we can choose r items from n distinct items.
          </p>
          <p>
            Explore Pascal&apos;s Triangle to see how combinations relate to each other,
            and understand why C(n,r) = C(n,n-r) through interactive visualization.
          </p>
        </>
      )
    },
    {
      id: 'probability',
      title: '1.5 Probability of an Event',
      component: ProbabilityEvent,
      description: (
        <>
          <p>
            For equally likely outcomes, probability equals the number of favorable
            outcomes divided by the total number of outcomes. This classical definition
            forms the foundation of probability theory.
          </p>
          <p>
            Run experiments to see how experimental probability converges to theoretical
            probability as the number of trials increases - the Law of Large Numbers in action!
          </p>
        </>
      )
    },
    {
      id: 'conditional',
      title: '1.6 Conditional Probability',
      component: ConditionalProbability,
      description: (
        <>
          <p>
            Conditional probability P(B|A) represents the probability of event B occurring
            given that event A has already occurred. Two events are independent when
            P(B|A) = P(B).
          </p>
          <p>
            Drag the events below to change their overlap and observe how conditional
            probabilities change. Switch perspectives to see probabilities from different
            viewpoints.
          </p>
        </>
      )
    },
    {
      id: 'fallacies',
      title: '1.7 Probabilistic Fallacies',
      component: ProbabilisticFallacies,
      description: (
        <>
          <p>
            Understanding common probability mistakes helps us make better decisions.
            These fallacies occur when we misinterpret statistical information or rely
            on faulty intuition.
          </p>
          <p>
            Explore interactive demonstrations of the Gambler&apos;s Fallacy, Simpson&apos;s Paradox,
            Base Rate Fallacy, and Prosecutor&apos;s Fallacy. See how proper statistical
            thinking can help avoid these traps.
          </p>
        </>
      )
    },
    {
      id: 'monty-hall-masterclass',
      title: '1.8 Monty Hall Masterclass',
      component: MontyHallJourney,
      description: (
        <>
          <p>
            Experience the complete Monty Hall learning journey! This masterclass combines
            interactive gameplay, mathematical proofs, and large-scale simulations into
            a unified learning experience.
          </p>
          <p>
            Progress through four stages: discover the paradox, play and learn, understand
            the mathematics with Bayes&apos; theorem, and witness the Law of Large Numbers in action.
            Track your progress, unlock achievements, and share your insights!
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
          <h1 className="text-3xl font-bold text-white mb-2">Chapter 1: Introduction to Probabilities</h1>
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
                router.push(`/chapter1?section=${section.id}`);
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
            <h2 className="text-2xl font-bold text-white mt-8">{activeContent.title}</h2>
            <ConceptSection
              title={activeContent.title.split(' ').slice(1).join(' ')}
              description={activeContent.description}
            >
              <ErrorBoundary componentName={activeContent.title}>
                <Suspense fallback={<LoadingComponent />}>
                  {ActiveComponent && <ActiveComponent />}
                </Suspense>
              </ErrorBoundary>
            </ConceptSection>
          </>
        )}
      </div>
    </div>
  );
}