"use client";

import React, { useState, useEffect, useRef } from 'react';
import SectionBasedContent, { 
  SectionContent, 
  MathFormula, 
  InteractiveElement 
} from '@/components/ui/SectionBasedContent';
import MathJaxSection from '@/components/ui/MathJaxSection';
import { WorkedExample, ExampleSection, InsightBox, Formula } from '@/components/ui/WorkedExample';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { createColorScheme } from '@/lib/design-system';

const colorScheme = createColorScheme('probability');

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
            A cybersecurity system flags 85% of actual threats correctly (true positive rate) and 
            incorrectly flags 15% of safe traffic (false positive rate). If only 2% of all traffic 
            contains actual threats, what's the probability that flagged traffic is actually a threat?
          </p>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-neutral-400">Quick: Can you...</p>
            <ul className="list-disc list-inside text-sm text-neutral-400 ml-4">
              <li>Identify what probability you're looking for?</li>
              <li>Determine which formula to use?</li>
              <li>Calculate P(threat|flagged)?</li>
            </ul>
          </div>
        </div>
        <p className="mt-4 text-neutral-400">
          This is a classic Bayes' theorem problem that appears in tech interviews. 
          By the end of this module, you'll solve it effortlessly!
        </p>
      </SectionContent>
    )
  },
  {
    id: 'intuition',
    title: 'Building Intuition',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <MathJaxSection>
            <WorkedExample title="Understanding Conditional Probability">
              <ExampleSection title="The Core Idea">
                <p className="mb-4 text-neutral-300">
                  Conditional probability answers: "What's the probability of A happening, 
                  given that we already know B happened?"
                </p>
                <div className="bg-blue-900/20 p-4 rounded-lg mb-4">
                  <p className="text-neutral-300 font-semibold mb-2">The key insight:</p>
                  <p className="text-neutral-300">
                    When we know B happened, our "universe" shrinks to only include outcomes where B is true.
                  </p>
                </div>
              </ExampleSection>
              
              <ExampleSection title="Visual Intuition">
                <div className="space-y-4">
                  <div className="bg-neutral-800 p-4 rounded-lg">
                    <p className="text-neutral-300 mb-2">Imagine a dartboard:</p>
                    <ul className="list-disc list-inside space-y-2 text-sm text-neutral-300 ml-4">
                      <li>The whole board = Sample space S</li>
                      <li>Red region = Event A</li>
                      <li>Blue region = Event B</li>
                      <li>Purple overlap = A ∩ B</li>
                    </ul>
                  </div>
                  <div className="bg-purple-900/20 p-3 rounded">
                    <p className="text-sm text-neutral-300">
                      P(A|B) = "Of all the darts that hit blue, what fraction also hit red?"
                    </p>
                  </div>
                </div>
              </ExampleSection>
              
              <ExampleSection title="Real-World Analogy">
                <div className="bg-green-900/20 p-4 rounded-lg">
                  <p className="text-neutral-300 font-semibold mb-2">Medical Testing:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-neutral-300 ml-4">
                    <li>P(Disease) = Prior probability of having the disease</li>
                    <li>P(Positive|Disease) = Test sensitivity</li>
                    <li>P(Disease|Positive) = What we actually care about!</li>
                  </ul>
                  <p className="text-sm text-neutral-400 mt-2">
                    Notice: These are different probabilities! This confusion costs lives in real medical decisions.
                  </p>
                </div>
              </ExampleSection>
            </WorkedExample>
            
            <InsightBox variant="info">
              💡 Remember: P(A|B) ≠ P(B|A) in general. The probability of "rain given clouds" 
              is very different from "clouds given rain"!
            </InsightBox>
        </MathJaxSection>
      </SectionContent>
    )
  },
  {
    id: 'formal-definition',
    title: 'Formal Definition',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <MathJaxSection>
            <WorkedExample title="Mathematical Foundations">
              <ExampleSection title="Definition of Conditional Probability">
                <Formula>
                  <div dangerouslySetInnerHTML={{ 
                    __html: `\\[P(A|B) = \\frac{P(A \\cap B)}{P(B)}, \\quad \\text{where } P(B) > 0\\]` 
                  }} />
                </Formula>
                <p className="mt-2 text-sm text-neutral-400">
                  The probability of A given B equals the probability of both divided by the probability of B
                </p>
              </ExampleSection>
              
              <ExampleSection title="Key Properties">
                <div className="space-y-3">
                  <div className="p-3 bg-neutral-800 rounded">
                    <p className="text-neutral-300 font-semibold">1. Multiplication Rule:</p>
                    <div className="mt-2" dangerouslySetInnerHTML={{ 
                      __html: `\\[P(A \\cap B) = P(A|B) \\cdot P(B) = P(B|A) \\cdot P(A)\\]` 
                    }} />
                  </div>
                  
                  <div className="p-3 bg-neutral-800 rounded">
                    <p className="text-neutral-300 font-semibold">2. Independence:</p>
                    <div className="mt-2" dangerouslySetInnerHTML={{ 
                      __html: `\\[\\text{A and B independent} \\Leftrightarrow P(A|B) = P(A)\\]` 
                    }} />
                    <p className="text-sm text-neutral-400 mt-1">
                      If A and B are independent, knowing B doesn't change P(A)
                    </p>
                  </div>
                  
                  <div className="p-3 bg-neutral-800 rounded">
                    <p className="text-neutral-300 font-semibold">3. Law of Total Probability:</p>
                    <div className="mt-2" dangerouslySetInnerHTML={{ 
                      __html: `\\[P(A) = P(A|B)P(B) + P(A|B^c)P(B^c)\\]` 
                    }} />
                  </div>
                </div>
              </ExampleSection>
              
              <ExampleSection title="Bayes' Theorem">
                <div className="bg-purple-900/20 p-4 rounded-lg">
                  <Formula>
                    <div dangerouslySetInnerHTML={{ 
                      __html: `\\[P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}\\]` 
                    }} />
                  </Formula>
                  <p className="mt-3 text-neutral-300">
                    This powerful formula lets us "reverse" conditional probabilities!
                  </p>
                  <div className="mt-4 text-sm">
                    <p className="text-neutral-400">Where:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-neutral-400">
                      <li>P(A) = Prior probability</li>
                      <li>P(B|A) = Likelihood</li>
                      <li>P(A|B) = Posterior probability</li>
                    </ul>
                  </div>
                </div>
              </ExampleSection>
            </WorkedExample>
        </MathJaxSection>
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
              🚀 Critical for Tech Careers:
            </h4>
            <ul className="list-disc list-inside space-y-2 text-neutral-300 ml-4">
              <li><strong>Machine Learning:</strong> Naive Bayes classifiers, probabilistic graphical models</li>
              <li><strong>A/B Testing:</strong> Understanding statistical significance and p-values</li>
              <li><strong>Recommendation Systems:</strong> Collaborative filtering algorithms</li>
              <li><strong>Natural Language Processing:</strong> Language models and text classification</li>
              <li><strong>Computer Vision:</strong> Object detection and image segmentation</li>
            </ul>
          </div>
          
          <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-600/30">
            <h4 className="font-semibold text-blue-400 mb-2">
              💼 Interview Topics:
            </h4>
            <p className="text-neutral-300 mb-2">
              Top tech companies (Google, Meta, Amazon) frequently ask:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-neutral-300 ml-4">
              <li>Bayes' theorem problems (spam filters, disease testing)</li>
              <li>A/B test interpretation questions</li>
              <li>Conditional probability in system design</li>
              <li>False positive/negative trade-offs</li>
            </ul>
          </div>
          
          <div className="bg-green-900/20 p-4 rounded-lg border border-green-600/30">
            <h4 className="font-semibold text-green-400 mb-2">
              🎯 Master These Concepts:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div className="bg-neutral-800/50 p-3 rounded">
                <p className="font-semibold text-neutral-200">Conditional vs Joint</p>
                <p className="text-sm text-neutral-400">Know when to use P(A|B) vs P(A∩B)</p>
              </div>
              <div className="bg-neutral-800/50 p-3 rounded">
                <p className="font-semibold text-neutral-200">Independence Testing</p>
                <p className="text-sm text-neutral-400">Check if P(A|B) = P(A)</p>
              </div>
              <div className="bg-neutral-800/50 p-3 rounded">
                <p className="font-semibold text-neutral-200">Bayes' Reversal</p>
                <p className="text-sm text-neutral-400">Convert P(B|A) to P(A|B)</p>
              </div>
              <div className="bg-neutral-800/50 p-3 rounded">
                <p className="font-semibold text-neutral-200">Total Probability</p>
                <p className="text-sm text-neutral-400">Break complex events into cases</p>
              </div>
            </div>
          </div>
        </div>
      </SectionContent>
    )
  }
];

export default function Tab1FoundationsTab({ onComplete }) {
  return (
    <SectionBasedContent
      title="Foundations"
      description="Motivation, intuition, and formal definitions"
      sections={SECTIONS}
      onComplete={onComplete}
      chapter={1}
      progressVariant="green"
      showBackToHub={false}
      showHeader={false}
    />
  );
}