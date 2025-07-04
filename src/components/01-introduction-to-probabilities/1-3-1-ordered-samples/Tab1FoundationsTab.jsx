"use client";

import React, { useState, useEffect, useRef } from 'react';
import SectionBasedContent, { 
  SectionContent, 
  InteractiveElement 
} from '@/components/ui/SectionBasedContent';
import { WorkedExample, ExampleSection, InsightBox, Formula } from '@/components/ui/WorkedExample';
import { Button } from '@/components/ui/button';
import { VisualizationSection } from '@/components/ui/VisualizationContainer';

const SECTIONS = [
  {
    id: 'challenge',
    title: 'Can You Solve This?',
    content: ({ sectionIndex, isCompleted }) => {
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
          <div ref={contentRef} className="bg-amber-900/20 p-4 rounded-lg border border-amber-600/30">
            <h4 className="text-lg font-semibold text-amber-400 mb-3">
              📝 Real Interview Question:
            </h4>
            <p className="text-neutral-300 mb-3">
              You have 10 unique ML models that need to be deployed in a specific order to 3 different 
              cloud servers. Each server runs one model. How many different deployment configurations 
              are possible if:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-neutral-300 ml-4">
              <li>You can reuse the same model on multiple servers?</li>
              <li>Each model can only be deployed once?</li>
            </ol>
            <div className="mt-4 bg-neutral-800 p-3 rounded">
              <p className="text-sm text-neutral-400">Think about:</p>
              <ul className="list-disc list-inside text-sm text-neutral-400 ml-4 mt-2">
                <li>Does the order of deployment matter?</li>
                <li>What changes when models can't be reused?</li>
                <li>How would you calculate each scenario?</li>
              </ul>
            </div>
          </div>
          <p className="mt-4 text-neutral-400">
            This is a classic ordered sampling (permutation) problem. Let's build the intuition 
            to solve it quickly and confidently.
          </p>
        </SectionContent>
      );
    }
  },
  {
    id: 'intuition',
    title: 'Building Intuition',
    content: ({ sectionIndex, isCompleted }) => {
      const [showComparison, setShowComparison] = useState(false);
      
      return (
        <SectionContent>
          <WorkedExample title="Understanding Ordered Sampling">
            <ExampleSection title="When Order Matters">
              <p className="mb-4 text-neutral-300">
                Ordered sampling (permutations) is about arranging items where position matters:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-900/20 p-4 rounded-lg">
                  <h5 className="font-semibold text-blue-400 mb-2">Real-world Examples:</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-neutral-300">
                    <li>Password combinations</li>
                    <li>Race finishing positions</li>
                    <li>Task scheduling order</li>
                    <li>DNA sequences</li>
                  </ul>
                </div>
                <div className="bg-green-900/20 p-4 rounded-lg">
                  <h5 className="font-semibold text-green-400 mb-2">In Tech/ML:</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-neutral-300">
                    <li>Model pipeline order</li>
                    <li>A/B test sequences</li>
                    <li>Server deployment order</li>
                    <li>Feature extraction steps</li>
                  </ul>
                </div>
              </div>
            </ExampleSection>
            
            <ExampleSection title="The Two Modes">
              <Button 
                onClick={() => setShowComparison(!showComparison)}
                variant="outline"
                className="mb-3"
              >
                {showComparison ? 'Hide' : 'Show'} Mode Comparison
              </Button>
              
              {showComparison && (
                <div className="space-y-3">
                  <div className="bg-neutral-800 p-4 rounded-lg">
                    <h5 className="font-semibold text-blue-400 mb-2">With Replacement</h5>
                    <p className="text-sm text-neutral-300">
                      Think: "Pick, use, put back, repeat"
                    </p>
                    <ul className="list-disc list-inside text-sm text-neutral-400 mt-2 ml-4">
                      <li>Same item can appear multiple times</li>
                      <li>Each position has ALL n choices</li>
                      <li>Example: PIN codes (1-1-1-1 is valid)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-neutral-800 p-4 rounded-lg">
                    <h5 className="font-semibold text-green-400 mb-2">Without Replacement</h5>
                    <p className="text-sm text-neutral-300">
                      Think: "Pick, use, remove from options"
                    </p>
                    <ul className="list-disc list-inside text-sm text-neutral-400 mt-2 ml-4">
                      <li>Each item used at most once</li>
                      <li>Choices decrease: n, n-1, n-2, ...</li>
                      <li>Example: Podium positions (can't be 1st AND 2nd)</li>
                    </ul>
                  </div>
                </div>
              )}
            </ExampleSection>
          </WorkedExample>
          
          <InsightBox variant="info">
            💡 Key Insight: "Replacement" is about whether items go back into the pool of choices. 
            With replacement = infinite copies. Without = limited supply.
          </InsightBox>
        </SectionContent>
      );
    }
  },
  {
    id: 'formal-definition',
    title: 'Formal Definition',
    content: ({ sectionIndex, isCompleted }) => {
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
            <WorkedExample title="Mathematical Framework">
              <ExampleSection title="Ordered Sampling With Replacement">
                <Formula>
                  <div dangerouslySetInnerHTML={{ 
                    __html: `\\[\\text{Number of ways} = n^r\\]` 
                  }} />
                </Formula>
                <p className="mt-2 text-neutral-300">
                  Where:
                </p>
                <ul className="list-disc list-inside text-sm text-neutral-400 ml-4">
                  <li><span dangerouslySetInnerHTML={{ __html: `\\(n\\)` }} /> = total number of items</li>
                  <li><span dangerouslySetInnerHTML={{ __html: `\\(r\\)` }} /> = positions to fill</li>
                </ul>
                <div className="mt-3 bg-blue-900/20 p-3 rounded">
                  <p className="text-sm text-neutral-300">
                    <strong>Logic:</strong> Each of the r positions has n choices
                  </p>
                  <p className="text-sm font-mono text-blue-400 mt-1">
                    n × n × n × ... (r times) = n^r
                  </p>
                </div>
              </ExampleSection>
              
              <ExampleSection title="Ordered Sampling Without Replacement (Permutations)">
                <Formula>
                  <div dangerouslySetInnerHTML={{ 
                    __html: `\\[P(n,r) = \\frac{n!}{(n-r)!}\\]` 
                  }} />
                </Formula>
                <p className="mt-2 text-neutral-300">
                  Alternative notation:
                </p>
                <Formula>
                  <div dangerouslySetInnerHTML={{ 
                    __html: `\\[{}_nP_r = n \\times (n-1) \\times (n-2) \\times \\cdots \\times (n-r+1)\\]` 
                  }} />
                </Formula>
                <div className="mt-3 bg-green-900/20 p-3 rounded">
                  <p className="text-sm text-neutral-300">
                    <strong>Logic:</strong> Choices decrease as items are used
                  </p>
                  <p className="text-sm font-mono text-green-400 mt-1">
                    n × (n-1) × (n-2) × ... × (n-r+1)
                  </p>
                </div>
              </ExampleSection>
              
              <ExampleSection title="Special Cases">
                <div className="space-y-3">
                  <div className="bg-neutral-800 p-3 rounded">
                    <p className="text-sm text-neutral-300">
                      When <span dangerouslySetInnerHTML={{ __html: `\\(r = n\\)` }} /> (use all items):
                    </p>
                    <div className="mt-2" dangerouslySetInnerHTML={{ 
                      __html: `\\[P(n,n) = n!\\]` 
                    }} />
                  </div>
                  <div className="bg-neutral-800 p-3 rounded">
                    <p className="text-sm text-neutral-300">
                      When <span dangerouslySetInnerHTML={{ __html: `\\(r > n\\)` }} /> without replacement:
                    </p>
                    <div className="mt-2" dangerouslySetInnerHTML={{ 
                      __html: `\\[P(n,r) = 0 \\text{ (impossible)}\\]` 
                    }} />
                  </div>
                </div>
              </ExampleSection>
            </WorkedExample>
          </div>
        </SectionContent>
      );
    }
  },
  {
    id: 'applications',
    title: 'Why This Matters',
    content: ({ sectionIndex, isCompleted }) => (
      <SectionContent>
        <WorkedExample title="Applications in Tech & ML">
          <ExampleSection title="Machine Learning Applications">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <VisualizationSection className="bg-purple-900/20 p-4">
                <h5 className="font-semibold text-purple-400 mb-2">Hyperparameter Tuning</h5>
                <p className="text-sm text-neutral-300">
                  Testing different orderings of preprocessing steps in a pipeline 
                  (normalization → PCA → feature selection vs other orders)
                </p>
              </VisualizationSection>
              
              <VisualizationSection className="bg-blue-900/20 p-4">
                <h5 className="font-semibold text-blue-400 mb-2">A/B Testing</h5>
                <p className="text-sm text-neutral-300">
                  Calculating possible test sequences when users can only see 
                  each variant once (without replacement)
                </p>
              </VisualizationSection>
              
              <VisualizationSection className="bg-green-900/20 p-4">
                <h5 className="font-semibold text-green-400 mb-2">Distributed Systems</h5>
                <p className="text-sm text-neutral-300">
                  Determining task scheduling possibilities across servers when 
                  order affects performance
                </p>
              </VisualizationSection>
              
              <VisualizationSection className="bg-amber-900/20 p-4">
                <h5 className="font-semibold text-amber-400 mb-2">Security</h5>
                <p className="text-sm text-neutral-300">
                  Password strength calculations, cryptographic key generation, 
                  and authentication sequences
                </p>
              </VisualizationSection>
            </div>
          </ExampleSection>
          
          <ExampleSection title="Interview & Exam Relevance">
            <InsightBox variant="success">
              🎯 This concept appears in:
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>System design interviews (load balancing strategies)</li>
                <li>Algorithm complexity analysis (permutation generation)</li>
                <li>ML interviews (cross-validation fold ordering)</li>
                <li>Statistics exams (fundamental counting principle)</li>
              </ul>
            </InsightBox>
          </ExampleSection>
        </WorkedExample>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-600/30">
          <h4 className="text-lg font-semibold text-white mb-2">🚀 Career Connection</h4>
          <p className="text-sm text-neutral-300">
            Understanding permutations is crucial for optimizing ML pipelines, designing 
            efficient algorithms, and solving complex scheduling problems in production systems. 
            Master this now to excel in technical interviews and real-world engineering challenges.
          </p>
        </div>
      </SectionContent>
    )
  }
];

export default function Tab1FoundationsTab({ onComplete }) {
  return (
    <SectionBasedContent
      title="Foundations of Ordered Sampling"
      description="From real problems to mathematical mastery"
      sections={SECTIONS}
      onComplete={onComplete}
      progressVariant="green"
    />
  );
}