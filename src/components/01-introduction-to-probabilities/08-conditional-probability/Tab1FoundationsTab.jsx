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
            A Real Exam Problem:
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
              Remember: P(A|B) ≠ P(B|A) in general. The probability of "rain given clouds" 
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
    title: 'Fundamental Applications',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <div className="space-y-6">
          <div className="bg-neutral-800 p-5 rounded-lg">
            <h4 className="font-semibold text-white mb-4">
              Where Conditional Probability Shapes Decisions
            </h4>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-blue-300 mb-2">Medical Diagnostics</p>
                <p className="text-sm text-neutral-300 mb-2">
                  A test with 99% accuracy sounds reliable, but conditional probability reveals the truth:
                </p>
                <ul className="list-disc list-inside text-xs text-neutral-400 ml-4 space-y-1">
                  <li>For rare diseases (0.1% prevalence), a positive test often means &lt;50% chance of disease</li>
                  <li>This counterintuitive result affects millions of medical decisions daily</li>
                  <li>Understanding P(disease|positive) vs P(positive|disease) saves lives and resources</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium text-green-300 mb-2">Risk Assessment in Complex Systems</p>
                <p className="text-sm text-neutral-300 mb-2">
                  Financial markets and infrastructure depend on conditional probability chains:
                </p>
                <ul className="list-disc list-inside text-xs text-neutral-400 ml-4 space-y-1">
                  <li>Credit default swaps: P(default|market conditions) determines trillion-dollar positions</li>
                  <li>Power grid failures: P(cascade|initial failure) guides infrastructure investment</li>
                  <li>Supply chain resilience: P(shortage|disruption) affects global commerce</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium text-purple-300 mb-2">Information Theory and Communication</p>
                <p className="text-sm text-neutral-300 mb-2">
                  Every digital communication relies on conditional probability:
                </p>
                <ul className="list-disc list-inside text-xs text-neutral-400 ml-4 space-y-1">
                  <li>Error correction codes: P(original message|received signal with noise)</li>
                  <li>Data compression: P(next symbol|previous symbols) enables efficient encoding</li>
                  <li>Cryptography: P(plaintext|ciphertext) must be negligible for security</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-900/20 p-5 rounded-lg border border-purple-600/30">
            <h4 className="font-semibold text-purple-400 mb-3">
              The Deeper Insight
            </h4>
            <p className="text-sm text-neutral-300 mb-3">
              Conditional probability isn't just a mathematical tool—it's how we update beliefs with new information. 
              It formalizes the process of learning from evidence, making it fundamental to:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-neutral-800/50 p-3 rounded">
                <p className="font-medium text-neutral-200 mb-1">Scientific Method</p>
                <p className="text-xs text-neutral-400">
                  P(hypothesis|data) drives research conclusions
                </p>
              </div>
              <div className="bg-neutral-800/50 p-3 rounded">
                <p className="font-medium text-neutral-200 mb-1">Legal Systems</p>
                <p className="text-xs text-neutral-400">
                  P(guilt|evidence) determines justice outcomes
                </p>
              </div>
              <div className="bg-neutral-800/50 p-3 rounded">
                <p className="font-medium text-neutral-200 mb-1">Machine Intelligence</p>
                <p className="text-xs text-neutral-400">
                  P(action|observation) enables autonomous systems
                </p>
              </div>
              <div className="bg-neutral-800/50 p-3 rounded">
                <p className="font-medium text-neutral-200 mb-1">Decision Theory</p>
                <p className="text-xs text-neutral-400">
                  P(outcome|choice) guides optimal strategies
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-900/20 p-4 rounded-lg">
            <p className="text-sm text-neutral-300">
              <span className="font-medium text-amber-400">Historical Note:</span> Thomas Bayes developed his theorem 
              in the 1760s to address philosophical questions about the existence of God. Today, it underpins 
              everything from spam filters to particle physics discoveries at CERN. The mathematical framework 
              for updating beliefs has become one of humanity's most powerful tools for understanding uncertainty.
            </p>
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