"use client";

import React, { useRef, useEffect } from 'react';
import SectionBasedContent, { SectionContent, MathFormula, InteractiveElement } from '@/components/ui/SectionBasedContent';
import { VisualizationSection, GraphContainer } from '@/components/ui/VisualizationContainer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { colors, createColorScheme } from '@/lib/design-system';
import { Info, AlertTriangle, Target, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Use consistent color scheme
const colorScheme = createColorScheme('probability');

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1.5 }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 1.5 }
};

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
      showHeader={false}
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
        <motion.div {...fadeInUp}>
          <VisualizationSection className="bg-red-950/30 border-red-700/50 p-6">
            <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Real Exam Problem
            </h3>
            
            <div className="text-sm text-neutral-300 space-y-4">
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
                  {['99% - The test is 99% accurate', '95% - Average of sensitivity and specificity', 
                    'About 17% - Much lower than you\'d expect', '50% - Either they have it or they don\'t'].map((option, idx) => (
                    <motion.button 
                      key={idx}
                      className="w-full text-left p-3 bg-neutral-800 rounded hover:bg-neutral-700 transition-colors text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {String.fromCharCode(65 + idx)}) {option}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </VisualizationSection>
        </motion.div>

        <motion.div 
          {...fadeInUp}
          transition={{ delay: 0.2 }}
          className="mt-6 p-4 bg-blue-950/30 border border-blue-700/50 rounded-lg"
        >
          <p className="text-sm text-neutral-300">
            <strong style={{ color: colorScheme.secondary }}>Surprising Answer:</strong> It's only about 17%! 
            Despite the test being highly accurate, most positive results are false positives because the disease is so rare.
          </p>
          <p className="text-xs text-neutral-400 mt-2">
            This counterintuitive result is why Bayes' Theorem is crucial in medical diagnosis, 
            machine learning, and decision-making under uncertainty.
          </p>
        </motion.div>
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
        <motion.div {...scaleIn}>
          <GraphContainer title="Think of Bayes as a Belief Updater">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-white mb-3">The Core Idea</h4>
                <p className="text-sm text-neutral-300">
                  Bayes' Theorem is like a machine that updates your beliefs when you get new evidence:
                </p>
                <div className="mt-4 flex items-center justify-center gap-4 text-center">
                  {[
                    { label: 'What you believed', sublabel: 'BEFORE', bg: 'bg-neutral-800' },
                    { label: '+', isOperator: true },
                    { label: 'New', sublabel: 'EVIDENCE', bg: 'bg-blue-900/50', color: 'text-blue-400' },
                    { label: '=', isOperator: true },
                    { label: 'What you believe', sublabel: 'AFTER', bg: 'bg-green-900/50', color: 'text-green-400' }
                  ].map((item, idx) => (
                    item.isOperator ? (
                      <div key={idx} className="text-2xl">{item.label}</div>
                    ) : (
                      <motion.div 
                        key={idx}
                        className={cn(item.bg, "p-4 rounded-lg")}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 1.5 }}
                      >
                        <p className={cn("text-xs", item.color || "text-neutral-400")}>{item.label}</p>
                        <p className="font-bold text-white text-base">{item.sublabel}</p>
                      </motion.div>
                    )
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div 
                  className="bg-neutral-800/50 p-4 rounded-lg"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 1.5 }}
                >
                  <h5 className="font-semibold text-base" style={{ color: colorScheme.warning }}>
                    Real World Example 1: Spam Filters
                  </h5>
                  <p className="text-xs text-neutral-300 mt-2">
                    Email contains "FREE MONEY" → Update belief it's spam<br/>
                    Prior: 30% spam → Evidence: suspicious words → Posterior: 95% spam
                  </p>
                </motion.div>
                
                <motion.div 
                  className="bg-neutral-800/50 p-4 rounded-lg"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 1.5 }}
                >
                  <h5 className="font-semibold text-base" style={{ color: colorScheme.info }}>
                    Real World Example 2: Weather Prediction
                  </h5>
                  <p className="text-xs text-neutral-300 mt-2">
                    Dark clouds appear → Update belief it will rain<br/>
                    Prior: 20% rain → Evidence: dark clouds → Posterior: 70% rain
                  </p>
                </motion.div>
              </div>

              <motion.div 
                className="bg-orange-950/30 border border-orange-700/50 p-4 rounded-lg"
                {...fadeInUp}
                transition={{ delay: 0.3 }}
              >
                <h5 className="font-semibold text-base text-orange-400 mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  The Key Insight
                </h5>
                <p className="text-sm text-neutral-300">
                  Bayes' Theorem tells us <strong>exactly how much</strong> to update our beliefs. 
                  Not too much (overreacting to evidence), not too little (ignoring evidence), 
                  but <em>just the right amount</em> based on how reliable the evidence is.
                </p>
              </motion.div>
            </div>
          </GraphContainer>
        </motion.div>
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
        <GraphContainer title="The Mathematical Framework">
          <div className="space-y-6">
            <motion.div 
              className="bg-neutral-900 p-6 rounded-lg border border-purple-600/30"
              {...scaleIn}
            >
              <h4 className="text-lg font-semibold mb-4" style={{ color: colorScheme.primary }}>
                Bayes' Theorem
              </h4>
              
              <MathFormula>
                <div className="text-xl" dangerouslySetInnerHTML={{ 
                  __html: `\\[P(H|D) = \\frac{P(D|H) \\cdot P(H)}{P(D)}\\]` 
                }} />
              </MathFormula>

              <div className="mt-6 space-y-3">
                {[
                  { symbol: 'P(H|D)', color: colorScheme.primary, name: 'Posterior Probability', 
                    desc: 'The updated belief after seeing evidence' },
                  { symbol: 'P(D|H)', color: colorScheme.secondary, name: 'Likelihood', 
                    desc: 'How likely the evidence is if hypothesis is true' },
                  { symbol: 'P(H)', color: colorScheme.accent, name: 'Prior Probability', 
                    desc: 'Initial belief before seeing evidence' },
                  { symbol: 'P(D)', color: colorScheme.warning, name: 'Evidence (Marginal Likelihood)', 
                    desc: 'Overall probability of seeing this evidence' }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="w-20 font-mono text-sm" style={{ color: item.color }}>
                      {item.symbol}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white text-sm">{item.name}</p>
                      <p className="text-xs text-neutral-400">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              className="bg-blue-950/30 p-4 rounded-lg border border-blue-700/50"
              {...fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <h5 className="font-semibold text-base" style={{ color: colorScheme.secondary }}>
                Alternative Forms
              </h5>
              
              <div className="space-y-3 mt-3">
                <div>
                  <p className="text-xs text-neutral-400 mb-1">Expanded form (when calculating P(D)):</p>
                  <div className="text-sm" dangerouslySetInnerHTML={{ 
                    __html: `\\[P(H|D) = \\frac{P(D|H) \\cdot P(H)}{P(D|H) \\cdot P(H) + P(D|\\neg H) \\cdot P(\\neg H)}\\]` 
                  }} />
                </div>
                
                <div>
                  <p className="text-xs text-neutral-400 mb-1">Odds form (useful for sequential updates):</p>
                  <div className="text-sm" dangerouslySetInnerHTML={{ 
                    __html: `\\[\\frac{P(H|D)}{P(\\neg H|D)} = \\frac{P(D|H)}{P(D|\\neg H)} \\cdot \\frac{P(H)}{P(\\neg H)}\\]` 
                  }} />
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-green-950/30 p-4 rounded-lg border border-green-700/50"
              {...fadeInUp}
              transition={{ delay: 0.3 }}
            >
              <h5 className="font-semibold text-base" style={{ color: colorScheme.accent }}>
                Key Properties
              </h5>
              <ul className="list-disc list-inside space-y-1 text-xs text-neutral-300 mt-2">
                <li>Always produces valid probabilities (between 0 and 1)</li>
                <li>Consistent with the laws of probability</li>
                <li>Can be applied iteratively as new evidence arrives</li>
                <li>Converges to truth with enough evidence (under certain conditions)</li>
              </ul>
            </motion.div>
          </div>
        </GraphContainer>
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
        <GraphContainer title="Applications in Tech & AI">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div 
                className="bg-gradient-to-br from-purple-900/20 to-purple-950/20 p-5 rounded-lg border border-purple-700/30"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <h4 className="font-bold text-base mb-3 flex items-center gap-2" style={{ color: colorScheme.primary }}>
                  <Target className="w-5 h-5" />
                  Machine Learning
                </h4>
                <ul className="space-y-2 text-xs text-neutral-300">
                  <li>• <strong>Naive Bayes Classifiers:</strong> Spam detection, sentiment analysis</li>
                  <li>• <strong>Bayesian Neural Networks:</strong> Uncertainty quantification in deep learning</li>
                  <li>• <strong>A/B Testing:</strong> Determining which version performs better</li>
                  <li>• <strong>Recommendation Systems:</strong> Netflix, YouTube algorithms</li>
                </ul>
              </motion.div>

              <motion.div 
                className="bg-gradient-to-br from-blue-900/20 to-blue-950/20 p-5 rounded-lg border border-blue-700/30"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <h4 className="font-bold text-base mb-3 flex items-center gap-2" style={{ color: colorScheme.secondary }}>
                  <Brain className="w-5 h-5" />
                  Artificial Intelligence
                </h4>
                <ul className="space-y-2 text-xs text-neutral-300">
                  <li>• <strong>Computer Vision:</strong> Object detection and tracking</li>
                  <li>• <strong>Natural Language Processing:</strong> Language models, translation</li>
                  <li>• <strong>Robotics:</strong> SLAM (Simultaneous Localization and Mapping)</li>
                  <li>• <strong>Autonomous Vehicles:</strong> Sensor fusion and decision making</li>
                </ul>
              </motion.div>
            </div>

            <motion.div 
              className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 p-5 rounded-lg border border-green-700/30"
              {...fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <h4 className="font-bold text-base mb-3" style={{ color: colorScheme.accent }}>
                Real Industry Examples
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {[
                  { company: 'Google', application: 'Search ranking algorithms' },
                  { company: 'Tesla', application: 'Autopilot sensor fusion' },
                  { company: 'OpenAI', application: 'GPT uncertainty estimation' }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 1.5 }}
                  >
                    <p className="font-semibold text-white">{item.company}</p>
                    <p className="text-neutral-400">{item.application}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              className="bg-orange-950/30 p-4 rounded-lg border border-orange-700/50"
              {...fadeInUp}
              transition={{ delay: 0.3 }}
            >
              <h5 className="font-semibold text-base text-orange-400 mb-2">Career Relevance</h5>
              <p className="text-xs text-neutral-300">
                Understanding Bayes' Theorem is essential for roles in:
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {['Data Science', 'ML Engineering', 'Quantitative Analysis', 'AI Research', 'Risk Assessment'].map((role, idx) => (
                  <motion.span 
                    key={idx}
                    className="px-3 py-1 bg-neutral-800 rounded-full text-xs"
                    whileHover={{ scale: 1.1 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + idx * 0.05 }}
                  >
                    {role}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            <motion.div 
              className="bg-neutral-800/50 p-4 rounded-lg"
              {...fadeInUp}
              transition={{ delay: 0.5 }}
            >
              <p className="text-center text-sm text-neutral-400 italic">
                "Bayes' Theorem is to machine learning what calculus is to physics - 
                a fundamental tool that appears everywhere once you know how to look for it."
              </p>
            </motion.div>
          </div>
        </GraphContainer>
      </div>
    </SectionContent>
  );
}