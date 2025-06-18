'use client';

import React, { useRef, forwardRef } from 'react';
import ChapterCard from './ChapterCard';
import * as Visualizations from '../visualizations';

const chapters = [
  {
    title: "Introduction to Probabilities",
    description: "Master fundamental concepts including sample spaces, events, and probability rules through interactive Venn diagrams and simulations.",
    duration: "12 sections",
    visualization: Visualizations.Ch1Venn
  },
  {
    title: "Discrete Random Variables",
    description: "Explore probability mass functions, expected values, and variance. Work with binomial, geometric, and Poisson distributions.",
    duration: "15 sections",
    visualization: Visualizations.Ch2Binomial
  },
  {
    title: "Continuous Random Variables",
    description: "Understand probability density functions, cumulative distributions, and work with normal, exponential, and gamma distributions.",
    duration: "18 sections",
    visualization: Visualizations.Ch3Normal
  },
  {
    title: "Descriptive Statistics & Sampling",
    description: "Learn data summarization techniques and observe how sample statistics behave through interactive sampling experiments.",
    duration: "14 sections",
    visualization: Visualizations.Ch4Sampling
  },
  {
    title: "Estimation",
    description: "Master point estimation, construct confidence intervals, and understand the principles of maximum likelihood estimation.",
    duration: "16 sections",
    visualization: Visualizations.Ch5Confidence
  },
  {
    title: "Hypothesis Testing",
    description: "Build intuition for statistical tests, p-values, significance levels, and power through interactive simulations.",
    duration: "20 sections",
    visualization: Visualizations.Ch6Hypothesis
  },
  {
    title: "Linear Regression & Correlation",
    description: "Analyze relationships between variables, fit models, and understand residuals through dynamic visualizations.",
    duration: "17 sections",
    visualization: Visualizations.Ch7Regression
  },
  {
    title: "Advanced Topics",
    description: "Explore multivariate distributions, Bayesian inference, and modern statistical methods beyond the core curriculum.",
    duration: "10 sections",
    visualization: Visualizations.Ch8Network
  }
];

const ChapterGrid = forwardRef(({ onSectionRef }, ref) => {
  const sectionRefs = useRef([]);
  
  return (
    <section id="chapters" className="py-20 px-4 lg:pl-32">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Course Curriculum
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {chapters.map((chapter, index) => (
            <div
              key={index}
              ref={el => {
                sectionRefs.current[index] = el;
                if (onSectionRef) onSectionRef(index, el);
              }}
              data-index={index}
            >
              <ChapterCard
                chapter={chapter}
                index={index}
                visualization={chapter.visualization}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

ChapterGrid.displayName = 'ChapterGrid';

export default ChapterGrid;