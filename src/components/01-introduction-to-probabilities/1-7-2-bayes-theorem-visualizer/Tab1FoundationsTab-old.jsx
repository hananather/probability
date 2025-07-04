"use client";

import React, { useRef, useEffect } from 'react';
import SectionBasedContent, { SectionContent, MathFormula, InteractiveElement } from '@/components/ui/SectionBasedContent';
import { VisualizationSection, GraphContainer } from '@/components/ui/VisualizationContainer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { colors, createColorScheme } from '@/lib/design-system';
import { Info, AlertTriangle, Target, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

// Use consistent color scheme
const colorScheme = createColorScheme('probability');

export default function Tab1FoundationsTab({ onComplete }) {
  const sections = [
    {
      id: 'solve-this',
      title: 'Can You Solve This?',
      icon: '🏥',
      content: () => <SolveThisSection />
    },
    {
      id: 'building-intuition',
      title: 'Building Intuition',
      icon: '🧠',
      content: () => <BuildingIntuitionSection />
    },
    {
      id: 'formal-definition',
      title: 'Formal Definition',
      icon: '📐',
      content: () => <FormalDefinitionSection />
    },
    {
      id: 'why-matters',
      title: 'Why This Matters',
      icon: '🚀',
      content: () => <WhyThisMattersSection />
    }
  ];

  return (
    <SectionBasedContent
      title="Foundations of Bayes' Theorem"
      description="Master the art of updating beliefs with evidence"
      sections={sections}
      onComplete={onComplete}
      progressVariant="green"
      showBackToHub={false}
    />
  );
}

// Section 1: Can You Solve This?
function SolveThisSection() {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <SectionContent>
      <div ref={contentRef}>
        <VisualizationSection className="bg-red-950/30 border-red-700/50 p-6">
          <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Real Exam Problem
          </h3>
          
          <div className="text-neutral-300 space-y-4">
            <p className="font-semibold">
              A medical test for a rare disease has these characteristics:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>The disease affects 1% of the population</li>
              <li>The test correctly identifies 99% of people who have the disease (sensitivity)</li>
              <li>The test correctly identifies 95% of healthy people (specificity)</li>
            </ul>
            
            <div className="bg-neutral-900/50 p-4 rounded-lg mt-4">
              <p className="font-bold text-yellow-400 mb-2">
                Question: If someone tests positive, what's the probability they actually have the disease?
              </p>
              
              <div className="space-y-3 mt-4">
                <button className="w-full text-left p-3 bg-neutral-800 rounded hover:bg-neutral-700 transition-colors">
                  A) 99% - The test is 99% accurate
                </button>
                <button className="w-full text-left p-3 bg-neutral-800 rounded hover:bg-neutral-700 transition-colors">
                  B) 95% - Average of sensitivity and specificity
                </button>
                <button className="w-full text-left p-3 bg-neutral-800 rounded hover:bg-neutral-700 transition-colors">
                  C) About 17% - Much lower than you'd expect
                </button>
                <button className="w-full text-left p-3 bg-neutral-800 rounded hover:bg-neutral-700 transition-colors">
                  D) 50% - Either they have it or they don't
                </button>
              </div>
            </div>
          </div>
        </VisualizationSection>

        <div className="mt-6 p-4 bg-blue-950/30 border border-blue-700/50 rounded-lg">
          <p className="text-neutral-300">
            <strong className="text-blue-400">Surprising Answer:</strong> It's only about 17%! 
            Despite the test being highly accurate, most positive results are false positives because the disease is so rare.
          </p>
          <p className="text-neutral-400 text-sm mt-2">
            This counterintuitive result is why Bayes' Theorem is crucial in medical diagnosis, 
            machine learning, and decision-making under uncertainty.
          </p>
        </div>
      </div>
    </SectionContent>
  );
}

// Section 2: Building Intuition
function BuildingIntuitionSection() {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <SectionContent>
      <div ref={contentRef}>
        <VisualizationSection title="Think of Bayes as a Belief Updater" className="mb-6">
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-3">The Core Idea</h4>
              <p className="text-neutral-300">
                Bayes' Theorem is like a machine that updates your beliefs when you get new evidence:
              </p>
              <div className="mt-4 flex items-center justify-center gap-4 text-center">
                <div className="bg-neutral-800 p-4 rounded-lg">
                  <p className="text-sm text-neutral-400">What you believed</p>
                  <p className="font-bold text-white">BEFORE</p>
                </div>
                <div className="text-2xl">+</div>
                <div className="bg-blue-900/50 p-4 rounded-lg">
                  <p className="text-sm text-blue-400">New</p>
                  <p className="font-bold text-blue-300">EVIDENCE</p>
                </div>
                <div className="text-2xl">=</div>
                <div className="bg-green-900/50 p-4 rounded-lg">
                  <p className="text-sm text-green-400">What you believe</p>
                  <p className="font-bold text-green-300">AFTER</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-neutral-800/50 p-4 rounded-lg">
                <h5 className="font-semibold text-yellow-400 mb-2">Real World Example 1: Spam Filters</h5>
                <p className="text-sm text-neutral-300">
                  Email contains "FREE MONEY" → Update belief it's spam<br/>
                  Prior: 30% spam → Evidence: suspicious words → Posterior: 95% spam
                </p>
              </div>
              
              <div className="bg-neutral-800/50 p-4 rounded-lg">
                <h5 className="font-semibold text-cyan-400 mb-2">Real World Example 2: Weather Prediction</h5>
                <p className="text-sm text-neutral-300">
                  Dark clouds appear → Update belief it will rain<br/>
                  Prior: 20% rain → Evidence: dark clouds → Posterior: 70% rain
                </p>
              </div>
            </div>

            <div className="bg-orange-950/30 border border-orange-700/50 p-4 rounded-lg">
              <h5 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                The Key Insight
              </h5>
              <p className="text-neutral-300">
                Bayes' Theorem tells us <strong>exactly how much</strong> to update our beliefs. 
                Not too much (overreacting to evidence), not too little (ignoring evidence), 
                but <em>just the right amount</em> based on how reliable the evidence is.
              </p>
            </div>
          </div>
        </VisualizationSection>
      </div>
    </SectionContent>
  );
}

// Section 3: Formal Definition
function FormalDefinitionSection() {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <SectionContent>
      <div ref={contentRef}>
        <VisualizationSection title="The Mathematical Framework">
          <div className="space-y-6">
            <div className="bg-neutral-900 p-6 rounded-lg border border-purple-600/30">
              <h4 className="text-lg font-semibold text-purple-400 mb-4">Bayes' Theorem</h4>
              
              <MathFormula>
                <div className="text-2xl" dangerouslySetInnerHTML={{ 
                  __html: `\\[P(H|D) = \\frac{P(D|H) \\cdot P(H)}{P(D)}\\]` 
                }} />
              </MathFormula>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-20 text-purple-400 font-mono">P(H|D)</div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">Posterior Probability</p>
                    <p className="text-sm text-neutral-400">The updated belief after seeing evidence</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-20 text-blue-400 font-mono">P(D|H)</div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">Likelihood</p>
                    <p className="text-sm text-neutral-400">How likely the evidence is if hypothesis is true</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-20 text-green-400 font-mono">P(H)</div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">Prior Probability</p>
                    <p className="text-sm text-neutral-400">Initial belief before seeing evidence</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-20 text-yellow-400 font-mono">P(D)</div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">Evidence (Marginal Likelihood)</p>
                    <p className="text-sm text-neutral-400">Overall probability of seeing this evidence</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-950/30 p-4 rounded-lg border border-blue-700/50">
              <h5 className="font-semibold text-blue-400 mb-2">Alternative Forms</h5>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-neutral-400 mb-1">Expanded form (when calculating P(D)):</p>
                  <div dangerouslySetInnerHTML={{ 
                    __html: `\\[P(H|D) = \\frac{P(D|H) \\cdot P(H)}{P(D|H) \\cdot P(H) + P(D|\\neg H) \\cdot P(\\neg H)}\\]` 
                  }} />
                </div>
                
                <div>
                  <p className="text-sm text-neutral-400 mb-1">Odds form (useful for sequential updates):</p>
                  <div dangerouslySetInnerHTML={{ 
                    __html: `\\[\\frac{P(H|D)}{P(\\neg H|D)} = \\frac{P(D|H)}{P(D|\\neg H)} \\cdot \\frac{P(H)}{P(\\neg H)}\\]` 
                  }} />
                </div>
              </div>
            </div>

            <div className="bg-green-950/30 p-4 rounded-lg border border-green-700/50">
              <h5 className="font-semibold text-green-400 mb-2">Key Properties</h5>
              <ul className="list-disc list-inside space-y-1 text-sm text-neutral-300">
                <li>Always produces valid probabilities (between 0 and 1)</li>
                <li>Consistent with the laws of probability</li>
                <li>Can be applied iteratively as new evidence arrives</li>
                <li>Converges to truth with enough evidence (under certain conditions)</li>
              </ul>
            </div>
          </div>
        </VisualizationSection>
      </div>
    </SectionContent>
  );
}

// Section 4: Why This Matters
function WhyThisMattersSection() {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <SectionContent>
      <div ref={contentRef}>
        <VisualizationSection title="Applications in Tech & AI">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-900/20 to-purple-950/20 p-5 rounded-lg border border-purple-700/30">
                <h4 className="font-bold text-purple-400 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Machine Learning
                </h4>
                <ul className="space-y-2 text-sm text-neutral-300">
                  <li>• <strong>Naive Bayes Classifiers:</strong> Spam detection, sentiment analysis</li>
                  <li>• <strong>Bayesian Neural Networks:</strong> Uncertainty quantification in deep learning</li>
                  <li>• <strong>A/B Testing:</strong> Determining which version performs better</li>
                  <li>• <strong>Recommendation Systems:</strong> Netflix, YouTube algorithms</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-900/20 to-blue-950/20 p-5 rounded-lg border border-blue-700/30">
                <h4 className="font-bold text-blue-400 mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Artificial Intelligence
                </h4>
                <ul className="space-y-2 text-sm text-neutral-300">
                  <li>• <strong>Computer Vision:</strong> Object detection and tracking</li>
                  <li>• <strong>Natural Language Processing:</strong> Language models, translation</li>
                  <li>• <strong>Robotics:</strong> SLAM (Simultaneous Localization and Mapping)</li>
                  <li>• <strong>Autonomous Vehicles:</strong> Sensor fusion and decision making</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 p-5 rounded-lg border border-green-700/30">
              <h4 className="font-bold text-green-400 mb-3">Real Industry Examples</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="font-semibold text-white">Google</p>
                  <p className="text-neutral-400">Search ranking algorithms</p>
                </div>
                <div>
                  <p className="font-semibold text-white">Tesla</p>
                  <p className="text-neutral-400">Autopilot sensor fusion</p>
                </div>
                <div>
                  <p className="font-semibold text-white">OpenAI</p>
                  <p className="text-neutral-400">GPT uncertainty estimation</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-950/30 p-4 rounded-lg border border-orange-700/50">
              <h5 className="font-semibold text-orange-400 mb-2">Career Relevance</h5>
              <p className="text-neutral-300 text-sm">
                Understanding Bayes' Theorem is essential for roles in:
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-neutral-800 rounded-full text-xs">Data Science</span>
                <span className="px-3 py-1 bg-neutral-800 rounded-full text-xs">ML Engineering</span>
                <span className="px-3 py-1 bg-neutral-800 rounded-full text-xs">Quantitative Analysis</span>
                <span className="px-3 py-1 bg-neutral-800 rounded-full text-xs">AI Research</span>
                <span className="px-3 py-1 bg-neutral-800 rounded-full text-xs">Risk Assessment</span>
              </div>
            </div>

            <div className="bg-neutral-800/50 p-4 rounded-lg">
              <p className="text-center text-neutral-400 italic">
                "Bayes' Theorem is to machine learning what calculus is to physics - 
                a fundamental tool that appears everywhere once you know how to look for it."
              </p>
            </div>
          </div>
        </VisualizationSection>
      </div>
    </SectionContent>
  );
}