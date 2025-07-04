"use client";

import React, { useState } from 'react';
import SectionBasedContent, { 
  SectionContent, 
  MathFormula, 
  InteractiveElement 
} from '@/components/ui/SectionBasedContent';
import { WorkedExample, ExampleSection, InsightBox, Formula } from '@/components/ui/WorkedExample';
import { Button } from '@/components/ui/button';

const SECTIONS = [
  {
    id: 'challenge',
    title: 'Can You Solve This?',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-600/30">
          <h4 className="font-semibold text-amber-400 mb-3">
            📝 A Real Exam Problem:
          </h4>
          <p className="text-neutral-300 mb-3">
            A quality control test for circuit boards has a 40% failure rate. 
            If we randomly test 3 boards, what's the probability that at least one passes?
          </p>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-neutral-400">Quick: Can you...</p>
            <ul className="list-disc list-inside text-sm text-neutral-400 ml-4">
              <li>List all possible outcomes?</li>
              <li>Identify which outcomes satisfy "at least one passes"?</li>
              <li>Calculate the final probability?</li>
            </ul>
          </div>
        </div>
        <p className="mt-4 text-neutral-400">
          If this seems confusing, don't worry! By the end of this section, 
          you'll solve problems like this in under 2 minutes.
        </p>
      </SectionContent>
    )
  },
  {
    id: 'intuition',
    title: 'Building Intuition',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <WorkedExample title="What Are Sample Spaces and Events?">
          <ExampleSection title="The Big Picture">
            <p className="mb-4 text-neutral-300">
              Think of probability like a game where:
            </p>
            <ul className="list-disc list-inside space-y-2 text-neutral-300 ml-4">
              <li><strong>Sample Space (S)</strong> = All possible things that could happen</li>
              <li><strong>Event (A, B, etc.)</strong> = Specific outcomes we care about</li>
              <li><strong>Probability</strong> = How likely an event is</li>
            </ul>
          </ExampleSection>
          
          <ExampleSection title="Real-World Analogy">
            <div className="bg-blue-900/20 p-4 rounded-lg">
              <p className="text-neutral-300">
                Imagine a bag of colored balls:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-neutral-300 ml-4">
                <li>Sample Space = All balls in the bag</li>
                <li>Event "Red" = Just the red balls</li>
                <li>Event "Not Blue" = All balls except blue ones</li>
              </ul>
            </div>
          </ExampleSection>
        </WorkedExample>
        
        <InsightBox variant="info">
          💡 Key Insight: Every probability problem starts with identifying the sample space. 
          Get this right, and the rest becomes much easier!
        </InsightBox>
      </SectionContent>
    )
  },
  {
    id: 'formal-definition',
    title: 'The Formal Definition',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <WorkedExample title="Mathematical Definitions">
          <ExampleSection title="Sample Space">
            <Formula>
              <MathFormula>
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\(S = \\{\\text{all possible outcomes}\\}\\)` 
                }} />
              </MathFormula>
            </Formula>
            <p className="mt-2 text-sm text-neutral-400">
              The set of ALL possible outcomes of an experiment
            </p>
          </ExampleSection>
          
          <ExampleSection title="Event">
            <Formula>
              <MathFormula>
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\(A \\subseteq S\\)` 
                }} />
              </MathFormula>
            </Formula>
            <p className="mt-2 text-sm text-neutral-400">
              Any subset of the sample space
            </p>
          </ExampleSection>
          
          <ExampleSection title="Set Operations">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-neutral-800 rounded">
                <span className="text-neutral-300">Union:</span>
                <MathFormula block={false}>
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\(A \\cup B\\)` 
                  }} />
                </MathFormula>
                <span className="text-sm text-neutral-400">A OR B</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-neutral-800 rounded">
                <span className="text-neutral-300">Intersection:</span>
                <MathFormula block={false}>
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\(A \\cap B\\)` 
                  }} />
                </MathFormula>
                <span className="text-sm text-neutral-400">A AND B</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-neutral-800 rounded">
                <span className="text-neutral-300">Complement:</span>
                <MathFormula block={false}>
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\(A^c\\) or \\(A'\\)` 
                  }} />
                </MathFormula>
                <span className="text-sm text-neutral-400">NOT A</span>
              </div>
            </div>
          </ExampleSection>
        </WorkedExample>
      </SectionContent>
    )
  },
  {
    id: 'why-matters',
    title: 'Why This Matters',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <div className="space-y-6">
          <div className="bg-red-900/20 p-4 rounded-lg border border-red-600/30">
            <h4 className="font-semibold text-red-400 mb-2">
              ⚠️ Why This is Critical:
            </h4>
            <p className="text-neutral-300">
              Sample spaces and events are fundamental because:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-neutral-300 ml-4">
              <li>They form the foundation for ALL probability theory</li>
              <li>Essential for understanding conditional probability</li>
              <li>Required for probability distributions (normal, binomial, etc.)</li>
              <li>Used in machine learning for probabilistic models and Bayesian inference</li>
              <li>Critical for data science roles at tech companies (Google, Meta, etc.)</li>
            </ul>
          </div>
          
          <div className="bg-green-900/20 p-4 rounded-lg border border-green-600/30">
            <h4 className="font-semibold text-green-400 mb-2">
              ✅ Master This First!
            </h4>
            <p className="text-neutral-300">
              Mastering sample spaces is crucial because every advanced topic 
              (Bayes' theorem, distributions, hypothesis testing) builds directly on these concepts.
            </p>
          </div>
          
          <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-600/30">
            <h4 className="font-semibold text-purple-400 mb-2">
              🎯 Your Goal
            </h4>
            <p className="text-neutral-300">
              By the end of this module, you should be able to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-neutral-300 ml-4">
              <li>Identify sample spaces in under 30 seconds</li>
              <li>Convert word problems into set notation</li>
              <li>Use Venn diagrams to solve complex problems</li>
              <li>Apply De Morgan's laws without thinking</li>
            </ul>
          </div>
        </div>
      </SectionContent>
    )
  }
];

export default function FoundationsTab({ onComplete }) {
  return (
    <SectionBasedContent
      title="Foundations"
      description="Motivation, intuition, and formal definitions"
      sections={SECTIONS}
      onComplete={onComplete}
      chapter={1}
      progressVariant="green"
      showHeader={false}
    />
  );
}