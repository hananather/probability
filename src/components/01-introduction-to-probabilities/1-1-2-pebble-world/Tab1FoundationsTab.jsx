"use client";

import React, { useEffect, useRef } from 'react';
import SectionBasedContent from '@/components/ui/SectionBasedContent';
import { SimpleInsightBox } from '@/components/ui/patterns/SimpleComponents';

const SECTIONS = [
    {
      id: 'physical-intuition',
      title: 'Physical Intuition',
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
          <div ref={contentRef} className="space-y-4">
            <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-700/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-300 mb-3">🪨 The Pebble World</h3>
              <p className="text-neutral-300 mb-4">
                Imagine a world where everything is made of tiny pebbles. Each pebble represents a possible outcome, 
                and probability is simply counting pebbles.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <h4 className="font-medium text-teal-300 mb-2">Sample Space</h4>
                  <p className="text-sm text-neutral-300">
                    All possible outcomes = All pebbles in the world
                  </p>
                  <div className="mt-2 text-xs text-neutral-400">
                    <span dangerouslySetInnerHTML={{ __html: `\\(S = \\{\\text{all pebbles}\\}\\)` }} />
                  </div>
                </div>
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <h4 className="font-medium text-teal-300 mb-2">Event</h4>
                  <p className="text-sm text-neutral-300">
                    A specific outcome = A subset of pebbles
                  </p>
                  <div className="mt-2 text-xs text-neutral-400">
                    <span dangerouslySetInnerHTML={{ __html: `\\(A \\subseteq S\\)` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
    },
    {
      id: 'counting-principle',
      title: 'The Counting Principle',
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
          <div ref={contentRef} className="space-y-4">
            <div className="bg-gradient-to-br from-green-900/20 to-teal-900/20 border border-green-700/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-300 mb-3">🔢 Probability as Counting</h3>
              <p className="text-neutral-300 mb-4">
                In the pebble world, probability is just counting ratios:
              </p>
              
              <div className="bg-neutral-800/50 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-teal-400 mb-2">
                    <span dangerouslySetInnerHTML={{ __html: `\\[P(A) = \\frac{\\text{Number of pebbles in event A}}{\\text{Total number of pebbles}}\\]` }} />
                  </div>
                  <div className="text-sm text-neutral-400">
                    <span dangerouslySetInnerHTML={{ __html: `\\[P(A) = \\frac{|A|}{|S|}\\]` }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-neutral-700/50 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">🎲</div>
                  <h4 className="font-medium text-blue-300 mb-1">Fair Die</h4>
                  <p className="text-xs text-neutral-300">6 equal pebbles</p>
                  <div className="mt-2 text-xs text-neutral-400">
                    <span dangerouslySetInnerHTML={{ __html: `\\(P(\\text{any face}) = \\frac{1}{6}\\)` }} />
                  </div>
                </div>
                <div className="bg-neutral-700/50 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">🪙</div>
                  <h4 className="font-medium text-blue-300 mb-1">Fair Coin</h4>
                  <p className="text-xs text-neutral-300">2 equal pebbles</p>
                  <div className="mt-2 text-xs text-neutral-400">
                    <span dangerouslySetInnerHTML={{ __html: `\\(P(\\text{heads}) = \\frac{1}{2}\\)` }} />
                  </div>
                </div>
                <div className="bg-neutral-700/50 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <h4 className="font-medium text-blue-300 mb-1">Dartboard</h4>
                  <p className="text-xs text-neutral-300">Area = pebbles</p>
                  <div className="mt-2 text-xs text-neutral-400">
                    <span dangerouslySetInnerHTML={{ __html: `\\(P(\\text{bullseye}) = \\frac{\\text{bullseye area}}{\\text{total area}}\\)` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
    },
    {
      id: 'key-properties',
      title: 'Why This Model Works',
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
          <div ref={contentRef} className="space-y-4">
            <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-700/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-orange-300 mb-3">⚖️ Properties of Probability</h3>
              <p className="text-neutral-300 mb-4">
                In the pebble world, these properties are intuitive:
              </p>
              
              <div className="space-y-4">
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <h4 className="font-medium text-cyan-300 mb-2">1. Non-negative</h4>
                  <p className="text-sm text-neutral-300 mb-2">
                    You can't have negative pebbles!
                  </p>
                  <div className="text-sm text-neutral-400">
                    <span dangerouslySetInnerHTML={{ __html: `\\(P(A) \\geq 0 \\text{ for all events } A\\)` }} />
                  </div>
                </div>
                
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <h4 className="font-medium text-cyan-300 mb-2">2. Normalization</h4>
                  <p className="text-sm text-neutral-300 mb-2">
                    The total probability of all outcomes is 1 (100% of all pebbles)
                  </p>
                  <div className="text-sm text-neutral-400">
                    <span dangerouslySetInnerHTML={{ __html: `\\(P(S) = 1\\)` }} />
                  </div>
                </div>
                
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <h4 className="font-medium text-cyan-300 mb-2">3. Additivity</h4>
                  <p className="text-sm text-neutral-300 mb-2">
                    For mutually exclusive events, probabilities add up
                  </p>
                  <div className="text-sm text-neutral-400">
                    <span dangerouslySetInnerHTML={{ __html: `\\(P(A \\cup B) = P(A) + P(B) \\text{ if } A \\cap B = \\emptyset\\)` }} />
                  </div>
                </div>
              </div>
            </div>
            
            <SimpleInsightBox title="Perfect Foundation" theme="teal">
              <p>
                The pebble world model gives us the perfect foundation for probability because it makes 
                abstract concepts concrete. Every probability rule has a simple physical interpretation!
              </p>
            </SimpleInsightBox>
          </div>
        );
      }
    }
  ];

export default function Tab1FoundationsTab({ onComplete }) {
  return (
    <SectionBasedContent
      title="Foundations"
      description="Build intuitive understanding of probability through physical analogies"
      sections={SECTIONS}
      onComplete={onComplete}
      chapter={1}
      progressVariant="purple"
      showHeader={false}
    />
  );
}