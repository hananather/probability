"use client";
import React, { useState, useEffect, useRef } from "react";
import { X, StickyNote, ChevronRight, BookOpen } from 'lucide-react';

/**
 * QuickReferenceCard - A floating or inline formula/reference card component
 * 
 * @param {Array} sections - Array of sections with formulas/references
 * @param {string} title - Title for the reference card
 * @param {string} mode - 'floating' | 'inline' | 'embedded'
 * @param {boolean} defaultOpen - Whether card starts open (for inline/embedded modes)
 * @param {Object} colorScheme - Custom color scheme object
 */
export const QuickReferenceCard = ({ 
  sections = [], 
  title = "Quick Reference",
  mode = "floating",
  defaultOpen = false,
  colorScheme = {
    primary: 'purple',
    secondary: 'emerald',
    accent: 'blue',
    warning: 'yellow'
  }
}) => {
  const [isOpen, setIsOpen] = useState(mode === 'embedded' ? true : defaultOpen);
  const contentRef = useRef(null);

  // Process MathJax when content changes
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    if (isOpen || mode === 'embedded') {
      processMathJax();
      const timeoutId = setTimeout(processMathJax, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, sections, mode]);

  // Render the content
  const renderContent = () => (
    <div ref={contentRef} className="space-y-3 max-h-96 overflow-y-auto">
      {sections.map((section, idx) => (
        <div 
          key={idx} 
          className="bg-neutral-800/50 rounded p-3"
        >
          {/* Section Title */}
          {section.title && (
            <h4 className={`text-${section.color || colorScheme.primary}-400 text-sm font-semibold mb-2`}>
              {section.title}
            </h4>
          )}

          {/* Formula Display */}
          {section.formula && (
            <div className="text-center mb-2">
              <span dangerouslySetInnerHTML={{ __html: section.formula }} />
            </div>
          )}

          {/* Description */}
          {section.description && (
            <p className="text-xs text-neutral-400 mt-1">
              {section.description}
            </p>
          )}

          {/* Steps List */}
          {section.steps && (
            <ol className="text-xs text-neutral-300 space-y-1">
              {section.steps.map((step, stepIdx) => (
                <li key={stepIdx} className="flex items-start">
                  <span className="mr-1">{stepIdx + 1}.</span>
                  <span dangerouslySetInnerHTML={{ __html: step }} />
                </li>
              ))}
            </ol>
          )}

          {/* Key-Value Pairs */}
          {section.values && (
            <div className="grid grid-cols-2 gap-2 text-xs text-neutral-300">
              {section.values.map((item, valueIdx) => (
                <div key={valueIdx}>
                  <span className="text-neutral-400">{item.label}:</span> {item.value}
                </div>
              ))}
            </div>
          )}

          {/* Custom Content */}
          {section.content && (
            <div className="text-sm text-neutral-300">
              {section.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // Floating mode
  if (mode === 'floating') {
    return (
      <div className="fixed z-50 right-6 bottom-24">
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`absolute bottom-0 right-0 w-12 h-12 rounded-full shadow-lg flex items-center justify-center cursor-pointer 
            ${isOpen ? `bg-${colorScheme.primary}-600` : `bg-${colorScheme.primary}-500`} 
            hover:bg-${colorScheme.primary}-600 transition-colors`}
        >
          <StickyNote className="w-6 h-6 text-white" />
        </button>

        {/* Formula Card */}
        {isOpen && (
          <div
            className={`absolute bottom-16 right-0 w-80 bg-neutral-900 rounded-lg shadow-2xl 
              border border-${colorScheme.primary}-500/50 overflow-hidden`}
          >
            <div className={`bg-${colorScheme.primary}-900/30 p-3 flex items-center justify-between`}>
              <h3 className={`font-semibold text-${colorScheme.primary}-400 text-sm`}>
                {title}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4">
              {renderContent()}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Inline mode (collapsible)
  if (mode === 'inline') {
    return (
      <div className={`bg-neutral-900/50 rounded-lg border border-${colorScheme.primary}-500/30 overflow-hidden`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full p-4 bg-${colorScheme.primary}-900/20 flex items-center justify-between 
            hover:bg-${colorScheme.primary}-900/30 transition-colors`}
        >
          <div className="flex items-center gap-2">
            <StickyNote className={`w-5 h-5 text-${colorScheme.primary}-400`} />
            <h3 className={`font-semibold text-${colorScheme.primary}-400`}>
              {title}
            </h3>
          </div>
          <ChevronRight 
            className={`w-5 h-5 text-${colorScheme.primary}-400 transition-transform 
              ${isOpen ? 'rotate-90' : ''}`}
          />
        </button>

        {isOpen && (
          <div className="p-4">
            {renderContent()}
          </div>
        )}
      </div>
    );
  }

  // Embedded mode (always visible)
  if (mode === 'embedded') {
    return (
      <div className={`bg-neutral-900/50 rounded-lg border border-${colorScheme.primary}-500/30 p-4`}>
        <div className="flex items-center gap-2 mb-4">
          <StickyNote className={`w-5 h-5 text-${colorScheme.primary}-400`} />
          <h3 className={`font-semibold text-${colorScheme.primary}-400`}>
            {title}
          </h3>
        </div>
        {renderContent()}
      </div>
    );
  }

  return null;
};

// Pre-configured examples for common use cases
export const ConfidenceIntervalReference = ({ mode = "floating" }) => {
  const sections = [
    {
      title: "Known σ (Z-interval)",
      color: "blue",
      formula: `\\[\\bar{x} \\pm z_{\\alpha/2} \\cdot \\frac{\\sigma}{\\sqrt{n}}\\]`,
      description: "Use when σ is given"
    },
    {
      title: "Unknown σ (t-interval)",
      color: "purple",
      formula: `\\[\\bar{x} \\pm t_{\\alpha/2,df} \\cdot \\frac{s}{\\sqrt{n}}\\]`,
      description: "df = n - 1"
    },
    {
      title: "Quick Steps",
      color: "emerald",
      steps: [
        `Calculate \\(\\bar{x}\\) and s`,
        "Find df = n - 1",
        "Look up t-critical value",
        "Calculate SE = s/√n",
        "Find margin = t × SE",
        `CI = \\(\\bar{x}\\) ± margin`
      ]
    },
    {
      title: "Common Critical Values",
      color: "yellow",
      values: [
        { label: "95% CI", value: "z = 1.96" },
        { label: "99% CI", value: "z = 2.576" },
        { label: "90% CI", value: "z = 1.645" },
        { label: "t-value", value: "varies with df" }
      ]
    }
  ];

  return (
    <QuickReferenceCard
      sections={sections}
      title="Confidence Intervals Reference"
      mode={mode}
      colorScheme={{
        primary: 'purple',
        secondary: 'emerald',
        accent: 'blue',
        warning: 'yellow'
      }}
    />
  );
};

// Hypothesis Testing Reference
export const HypothesisTestingReference = ({ mode = "floating" }) => {
  const sections = [
    {
      title: "Test Statistic",
      color: "blue",
      formula: `\\[z = \\frac{\\bar{x} - \\mu_0}{\\sigma/\\sqrt{n}}\\]`,
      description: "For known σ"
    },
    {
      title: "P-value Approach",
      color: "emerald",
      steps: [
        "State H₀ and H₁",
        "Calculate test statistic",
        "Find p-value",
        "Compare p-value to α",
        "Make decision"
      ]
    },
    {
      title: "Decision Rules",
      color: "yellow",
      values: [
        { label: "Reject H₀ if", value: "p-value < α" },
        { label: "Fail to reject if", value: "p-value ≥ α" },
        { label: "Type I error", value: "α" },
        { label: "Type II error", value: "β" }
      ]
    }
  ];

  return (
    <QuickReferenceCard
      sections={sections}
      title="Hypothesis Testing Reference"
      mode={mode}
      colorScheme={{
        primary: 'emerald',
        secondary: 'blue',
        accent: 'purple',
        warning: 'yellow'
      }}
    />
  );
};

// Probability Distributions Reference
export const DistributionsReference = ({ mode = "floating" }) => {
  const sections = [
    {
      title: "Normal Distribution",
      color: "blue",
      formula: `\\[X \\sim N(\\mu, \\sigma^2)\\]`,
      description: "Mean μ, variance σ²"
    },
    {
      title: "Binomial Distribution",
      color: "emerald",
      formula: `\\[P(X = k) = \\binom{n}{k}p^k(1-p)^{n-k}\\]`,
      description: "n trials, probability p"
    },
    {
      title: "Poisson Distribution",
      color: "purple",
      formula: `\\[P(X = k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}\\]`,
      description: "Rate parameter λ"
    },
    {
      title: "Key Properties",
      color: "yellow",
      values: [
        { label: "E[X] Normal", value: "μ" },
        { label: "E[X] Binomial", value: "np" },
        { label: "E[X] Poisson", value: "λ" },
        { label: "Var[X] Normal", value: "σ²" }
      ]
    }
  ];

  return (
    <QuickReferenceCard
      sections={sections}
      title="Distributions Reference"
      mode={mode}
      colorScheme={{
        primary: 'blue',
        secondary: 'emerald',
        accent: 'purple',
        warning: 'yellow'
      }}
    />
  );
};

export default QuickReferenceCard;