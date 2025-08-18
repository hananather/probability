'use client';

import React, { useRef, forwardRef, useEffect, useState, useCallback } from 'react';
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
    description: "Explore multivariate distributions, Bayesian inference, and modern statistical methods.",
    duration: "10 sections",
    visualization: Visualizations.Ch8Network
  }
];

const ChapterGrid = forwardRef(({ onSectionRef }, ref) => {
  const sectionRefs = useRef([]);
  const containerRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!containerRef.current) return;
    
    const cards = sectionRefs.current.filter(Boolean);
    if (cards.length === 0) return;
    
    // Get number of columns for grid navigation
    const getColumns = () => {
      const width = window.innerWidth;
      if (width >= 1280) return 3; // xl:grid-cols-3
      if (width >= 1024) return 2; // lg:grid-cols-2
      if (width >= 768) return 2;  // md:grid-cols-2
      return 1;
    };
    
    const columns = getColumns();
    const currentIndex = focusedIndex === -1 ? 0 : focusedIndex;
    let newIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        newIndex = Math.min(currentIndex + 1, cards.length - 1);
        break;
        
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = Math.max(currentIndex - 1, 0);
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        newIndex = Math.min(currentIndex + columns, cards.length - 1);
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        newIndex = Math.max(currentIndex - columns, 0);
        break;
        
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
        
      case 'End':
        e.preventDefault();
        newIndex = cards.length - 1;
        break;
        
      case 'Enter':
      case ' ':
        e.preventDefault();
        // Click the button inside the focused card
        if (cards[currentIndex]) {
          const button = cards[currentIndex].querySelector('button');
          if (button) button.click();
        }
        break;
        
      case 'Tab':
        // Allow default tab behavior but track focus
        setTimeout(() => {
          const activeElement = document.activeElement;
          const cardIndex = cards.findIndex(card => 
            card.contains(activeElement) || card === activeElement
          );
          if (cardIndex !== -1) {
            setFocusedIndex(cardIndex);
          }
        }, 0);
        return; // Don't prevent default for Tab
        
      default:
        return;
    }
    
    // Update focus
    if (newIndex !== currentIndex && cards[newIndex]) {
      setFocusedIndex(newIndex);
      
      // Focus the card element
      const card = cards[newIndex];
      const focusableElement = card.querySelector('button, [tabindex="0"]') || card;
      focusableElement.focus();
      
      // Scroll into view if needed
      card.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center' 
      });
    }
  }, [focusedIndex]);
  
  // Add keyboard event listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  // Handle focus when clicking on a card
  const handleCardFocus = (index) => {
    setFocusedIndex(index);
  };
  
  return (
    <section 
      id="chapters" 
      className="py-20 px-4 lg:pl-32"
      ref={containerRef}
      role="region"
      aria-label="Course chapters"
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Course Curriculum
        </h2>
        
        {/* Screen reader instructions */}
        <div className="sr-only" role="status" aria-live="polite">
          Use arrow keys to navigate between chapters. Press Enter or Space to begin a chapter.
        </div>
        
        <div 
          className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8"
          role="grid"
          aria-label="Chapter grid"
        >
          {chapters.map((chapter, index) => (
            <div
              key={index}
              ref={el => {
                sectionRefs.current[index] = el;
                if (onSectionRef) onSectionRef(index, el);
              }}
              data-index={index}
              role="gridcell"
              tabIndex={index === 0 ? 0 : -1}
              onFocus={() => handleCardFocus(index)}
              className={`focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-neutral-900 rounded-xl ${
                focusedIndex === index ? 'ring-2 ring-teal-500 ring-offset-2 ring-offset-neutral-900' : ''
              }`}
              aria-label={`Chapter ${index + 1}: ${chapter.title}`}
            >
              <ChapterCard
                chapter={chapter}
                index={index}
                visualization={chapter.visualization}
                isLocked={false}
              />
            </div>
          ))}
        </div>
        
        {/* Keyboard navigation help text */}
        <div className="mt-8 text-center text-sm text-neutral-500">
          <p>
            <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">↑</kbd>{' '}
            <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">↓</kbd>{' '}
            <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">←</kbd>{' '}
            <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">→</kbd>{' '}
            to navigate • 
            <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs ml-2">Enter</kbd>{' '}
            to select
          </p>
        </div>
      </div>
    </section>
  );
});

ChapterGrid.displayName = 'ChapterGrid';

export default ChapterGrid;