"use client";

import React from 'react';
import { useMathJax } from '../../../hooks/useMathJax';
import SectionBasedContent from '@/components/ui/SectionBasedContent';
import { StepByStepCalculation, CalculationStep, FormulaDisplay } from '@/components/ui/patterns/StepByStepCalculation';
import { SimpleInsightBox } from '@/components/ui/patterns/SimpleComponents';
import { cn } from '@/lib/utils';
import { createColorScheme } from '@/lib/design-system';
import { AlertTriangle, Target, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

// Use consistent color scheme
const colorScheme = createColorScheme('purple');

// Animation timing constants
const ANIMATION_CONSTANTS = {
  LONG_ANIMATION_DURATION: 1.5, // Duration for main section animations
};

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: ANIMATION_CONSTANTS.LONG_ANIMATION_DURATION }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: ANIMATION_CONSTANTS.LONG_ANIMATION_DURATION }
};

export default function Tab1FoundationsTab({ onComplete }) {
  const sections = [
    {
      id: 'solve-this',
      title: 'Can You Solve This?',
      content: () => <SolveThisSection />
    },
    {
      id: 'building-intuition',
      title: 'Building Intuition',
      content: () => <BuildingIntuitionSection />
    },
    {
      id: 'formal-definition',
      title: 'Formal Definition',
      content: () => <FormalDefinitionSection />
    },
    {
      id: 'why-matters',
      title: 'Why This Matters',
      content: () => <WhyThisMattersSection />
    }
  ];

  return (
    <SectionBasedContent
      title="Foundations of Bayes' Theorem"
      description="Master the art of updating beliefs with evidence"
      sections={sections}
      onComplete={onComplete}
      progressVariant="purple"
      showBackToHub={false}
      showHeader={false}
    />
  );
}

// Section 1: Can You Solve This?
function SolveThisSection() {
  const contentRef = useMathJax([]);

  return (
    <div ref={contentRef} className="space-y-6">
      <div className="bg-gradient-to-br from-red-900/20 to-red-800/20 border border-red-700/50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Real Exam Problem
        </h3>
        
        <p className="text-neutral-300 mb-4 font-semibold">
          A medical test for a rare disease has these characteristics:
        </p>
        
        <ul className="list-disc list-inside space-y-2 text-neutral-300 ml-4 mb-4">
          <li>The disease affects 1% of the population</li>
          <li>The test correctly identifies 99% of people who have the disease (sensitivity)</li>
          <li>The test correctly identifies 95% of healthy people (specificity)</li>
        </ul>
        
        <div className="bg-neutral-900/50 p-4 rounded-lg">
          <p className="font-bold text-yellow-400 mb-4">
            Question: If someone tests positive, what's the probability they actually have the disease?
          </p>
          
          <div className="space-y-3">
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

      <SimpleInsightBox variant="info" className="border-blue-700/50">
        <p className="text-neutral-300">
          <strong className="text-blue-400">Surprising Answer:</strong> It's only about 17%! 
          Despite the test being highly accurate, most positive results are false positives because the disease is so rare.
        </p>
        <p className="text-sm text-neutral-400 mt-2">
          This counterintuitive result is why Bayes' Theorem is crucial in medical diagnosis, 
          machine learning, and decision-making under uncertainty.
        </p>
      </SimpleInsightBox>
    </div>
  );
}

// Section 2: Building Intuition
function BuildingIntuitionSection() {
  const contentRef = useMathJax([]);

  return (
    <div ref={contentRef} className="space-y-6">
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-600/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-purple-300 mb-3">🧠 Think of Bayes as a Belief Updater</h3>
        <p className="text-neutral-300 mb-4">
          Bayes' Theorem is like a machine that updates your beliefs when you get new evidence:
        </p>
        
        <div className="flex items-center justify-center gap-4 text-center flex-wrap">
          {[
            { label: 'What you believed', sublabel: 'BEFORE', bg: 'bg-neutral-800' },
            { label: '+', isOperator: true },
            { label: 'New', sublabel: 'EVIDENCE', bg: 'bg-blue-900/50', color: 'text-blue-400' },
            { label: '=', isOperator: true },
            { label: 'What you believe', sublabel: 'AFTER', bg: 'bg-green-900/50', color: 'text-green-400' }
          ].map((item, idx) => (
            item.isOperator ? (
              <div key={idx} className="text-2xl text-white">{item.label}</div>
            ) : (
              <div 
                key={idx}
                className={cn(item.bg, "p-4 rounded-lg min-w-[120px]")}
              >
                <p className={cn("text-xs", item.color || "text-neutral-400")}>{item.label}</p>
                <p className="font-bold text-white text-sm">{item.sublabel}</p>
              </div>
            )
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-neutral-800/50 p-4 rounded-lg border border-neutral-600/30">
          <h4 className="font-semibold text-orange-400 mb-2">
            Real World Example 1: Spam Filters
          </h4>
          <p className="text-sm text-neutral-300">
            Email contains "FREE MONEY" → Update belief it's spam<br/>
            Prior: 30% spam → Evidence: suspicious words → Posterior: 95% spam
          </p>
        </div>
        
        <div className="bg-neutral-800/50 p-4 rounded-lg border border-neutral-600/30">
          <h4 className="font-semibold text-blue-400 mb-2">
            Real World Example 2: Weather Prediction
          </h4>
          <p className="text-sm text-neutral-300">
            Dark clouds appear → Update belief it will rain<br/>
            Prior: 20% rain → Evidence: dark clouds → Posterior: 70% rain
          </p>
        </div>
      </div>

      <SimpleInsightBox variant="warning" className="border-orange-700/50">
        <h4 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
          <Brain className="w-4 h-4" />
          The Key Insight
        </h4>
        <p className="text-neutral-300">
          Bayes' Theorem tells us <strong>exactly how much</strong> to update our beliefs. 
          Not too much (overreacting to evidence), not too little (ignoring evidence), 
          but <em>just the right amount</em> based on how reliable the evidence is.
        </p>
      </SimpleInsightBox>
    </div>
  );
}

// Section 3: Formal Definition
function FormalDefinitionSection() {
  const contentRef = useMathJax([]);

  return (
    <div ref={contentRef} className="space-y-6">
      <StepByStepCalculation title="📐 The Mathematical Framework" theme="purple">
        <CalculationStep title="Bayes' Theorem Formula" variant="highlight">
          <FormulaDisplay formula={`P(H|D) = \\frac{P(D|H) \\cdot P(H)}{P(D)}`} />
          
          <div className="mt-6 space-y-3">
            {[
              { symbol: 'P(H|D)', color: 'text-purple-400', name: 'Posterior Probability', 
                desc: 'The updated belief after seeing evidence' },
              { symbol: 'P(D|H)', color: 'text-blue-400', name: 'Likelihood', 
                desc: 'How likely the evidence is if hypothesis is true' },
              { symbol: 'P(H)', color: 'text-green-400', name: 'Prior Probability', 
                desc: 'Initial belief before seeing evidence' },
              { symbol: 'P(D)', color: 'text-yellow-400', name: 'Evidence (Marginal Likelihood)', 
                desc: 'Overall probability of seeing this evidence' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className={cn("w-20 font-mono text-sm", item.color)}>
                  {item.symbol}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm">{item.name}</p>
                  <p className="text-xs text-neutral-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CalculationStep>

        <CalculationStep title="Alternative Forms" variant="default">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-neutral-400 mb-2">Expanded form (when calculating P(D)):</p>
              <FormulaDisplay formula={`P(H|D) = \\frac{P(D|H) \\cdot P(H)}{P(D|H) \\cdot P(H) + P(D|\\neg H) \\cdot P(\\neg H)}`} />
            </div>
            
            <div>
              <p className="text-sm text-neutral-400 mb-2">Odds form (useful for sequential updates):</p>
              <FormulaDisplay formula={`\\frac{P(H|D)}{P(\\neg H|D)} = \\frac{P(D|H)}{P(D|\\neg H)} \\cdot \\frac{P(H)}{P(\\neg H)}`} />
            </div>
          </div>
        </CalculationStep>

        <CalculationStep title="Key Properties" variant="default">
          <ul className="list-disc list-inside space-y-2 text-neutral-300">
            <li>Always produces valid probabilities (between 0 and 1)</li>
            <li>Consistent with the laws of probability</li>
            <li>Can be applied iteratively as new evidence arrives</li>
            <li>Converges to truth with enough evidence (under certain conditions)</li>
          </ul>
        </CalculationStep>
      </StepByStepCalculation>
    </div>
  );
}

// Section 4: Why This Matters
function WhyThisMattersSection() {
  const contentRef = useMathJax([]);

  return (
    <div ref={contentRef} className="space-y-6">
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-600/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-purple-300 mb-4">Applications in Mathematics and Science</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-neutral-800/50 p-4 rounded-lg border border-purple-600/30">
            <h4 className="font-bold text-purple-400 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Statistical Inference
            </h4>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>• <strong>Hypothesis Testing:</strong> Updating prior beliefs with experimental data</li>
              <li>• <strong>Bayesian Statistics:</strong> Parameter estimation and model comparison</li>
              <li>• <strong>Decision Theory:</strong> Optimal decision making under uncertainty</li>
              <li>• <strong>Information Theory:</strong> Quantifying information gain from observations</li>
            </ul>
          </div>

          <div className="bg-neutral-800/50 p-4 rounded-lg border border-blue-600/30">
            <h4 className="font-bold text-blue-400 mb-3 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Scientific Applications
            </h4>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>• <strong>Medical Diagnosis:</strong> Interpreting test results with base rates</li>
              <li>• <strong>Physics:</strong> Particle physics experiments and cosmological inference</li>
              <li>• <strong>Genetics:</strong> Inferring evolutionary relationships and disease risk</li>
              <li>• <strong>Ecology:</strong> Species distribution modeling and population dynamics</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-green-900/20 p-4 rounded-lg border border-green-600/30">
          <h4 className="font-bold text-green-400 mb-3">Theoretical Foundations</h4>
          <p className="text-neutral-300 mb-2">
            Bayes' Theorem provides the mathematical foundation for:
          </p>
          <ul className="list-disc list-inside text-sm text-neutral-300 ml-4 space-y-1">
            <li>Conditional probability and independence</li>
            <li>The relationship between likelihood and posterior probability</li>
            <li>Coherent updating of beliefs in light of evidence</li>
            <li>The formal connection between causation and correlation</li>
          </ul>
        </div>
      </div>

      <SimpleInsightBox variant="success" className="border-orange-700/50">
        <h4 className="font-semibold text-orange-400 mb-2">Mathematical Significance</h4>
        <p className="text-neutral-300 mb-3">
          Bayes' Theorem represents one of the most profound insights in probability theory,
          providing a rigorous framework for reasoning under uncertainty.
        </p>
        <p className="text-neutral-300">
          Its influence extends from pure mathematics to philosophy of science, 
          offering a coherent approach to the problem of induction and the nature of scientific inference.
        </p>
      </SimpleInsightBox>

      <div className="bg-neutral-800/50 p-4 rounded-lg border border-neutral-600/30">
        <p className="text-center text-neutral-400 italic">
          "Probability theory is nothing but common sense reduced to calculation."
          <br/>
          <span className="text-sm">- Pierre-Simon Laplace</span>
        </p>
      </div>
    </div>
  );
}