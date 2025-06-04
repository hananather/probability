"use client";
import ConceptSection from '../../components/ConceptSection.jsx';
import SampleSpacesEvents from '../../components/01-introduction-to-probabilities/SampleSpacesEvents.jsx';
import CountingTechniques from '../../components/01-introduction-to-probabilities/CountingTechniques.jsx';
import OrderedSamples from '../../components/01-introduction-to-probabilities/OrderedSamples.jsx';
import UnorderedSamples from '../../components/01-introduction-to-probabilities/UnorderedSamples.jsx';
import ProbabilityEvent from '../../components/01-introduction-to-probabilities/ProbabilityEvent.jsx';
import ConditionalProbability from '../../components/01-introduction-to-probabilities/ConditionalProbability.jsx';

export default function Chapter1() {
  return (
    <div className="space-y-8 p-4 max-w-7xl mx-auto">
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <h1 className="text-3xl font-bold text-white mb-2">Chapter 1: Introduction to Probabilities</h1>
        <p className="text-neutral-400">MAT 2377 - Interactive Visualizations</p>
        <hr style={{ margin: '2rem auto', width: '50%' }} />
      </div>

      <h2 id="sample-spaces-events" className="text-2xl font-bold text-white mt-8">1.1 Sample Spaces and Events</h2>
      <ConceptSection
        title="Sample Spaces and Events"
        description={
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
        }
      >
        <SampleSpacesEvents />
      </ConceptSection>

      <h2 id="counting-techniques" className="text-2xl font-bold text-white mt-8">1.2 Counting Techniques</h2>
      <ConceptSection
        title="Counting Techniques"
        description={
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
        }
      >
        <CountingTechniques />
      </ConceptSection>

      <h2 id="ordered-samples" className="text-2xl font-bold text-white mt-8">1.3 Ordered Samples (Permutations)</h2>
      <ConceptSection
        title="Ordered Samples"
        description={
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
        }
      >
        <OrderedSamples />
      </ConceptSection>

      <h2 id="unordered-samples" className="text-2xl font-bold text-white mt-8">1.4 Unordered Samples (Combinations)</h2>
      <ConceptSection
        title="Unordered Samples"
        description={
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
        }
      >
        <UnorderedSamples />
      </ConceptSection>

      <h2 id="probability-event" className="text-2xl font-bold text-white mt-8">1.5 Probability of an Event</h2>
      <ConceptSection
        title="Probability of an Event"
        description={
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
        }
      >
        <ProbabilityEvent />
      </ConceptSection>

      <h2 id="conditional-probability" className="text-2xl font-bold text-white mt-8">1.6 Conditional Probability</h2>
      <ConceptSection
        title="Conditional Probability and Independence"
        description={
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
        }
      >
        <ConditionalProbability />
      </ConceptSection>
    </div>
  );
}