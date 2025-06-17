"use client";
import React, { useState, useEffect } from 'react';
import { layout, spacing, typography, colors, cn } from '../../lib/design-system';
import { TutorialButton } from './TutorialButton';
import { Tutorial } from './Tutorial';

/**
 * Unified container for all visualization components
 * Provides consistent styling based on ContinuousDistributionsPDF
 */
export const VisualizationContainer = ({ 
  title, 
  children, 
  className = '',
  tutorialSteps = null,
  tutorialKey = null,
  showTutorialOnMount = true
}) => {
  const [tutorialResetKey, setTutorialResetKey] = useState(0);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleTutorialRestart = () => {
    if (tutorialKey && typeof window !== 'undefined') {
      localStorage.removeItem(`tutorial-${tutorialKey}-completed`);
      // Force re-render by updating a key
      setTutorialResetKey(prev => prev + 1);
    }
  };
  return (
    <div className={cn(layout.container, 'relative', className)}>
      {/* Tutorial Modal - Only render on client */}
      {isClient && tutorialSteps && (
        <Tutorial
          key={tutorialResetKey}
          steps={tutorialSteps}
          onComplete={() => {}}
          onSkip={() => {}}
          showOnMount={showTutorialOnMount}
          persistKey={tutorialKey}
          mode="modal"
        />
      )}
      
      {/* Title Bar with Tutorial Button */}
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className={typography.h2}>{title}</h2>
          {isClient && tutorialSteps && (
            <TutorialButton 
              onClick={handleTutorialRestart}
              position="inline"
            />
          )}
        </div>
      )}
      
      <div className={spacing.section}>
        {children}
      </div>
    </div>
  );
};

/**
 * Section within a visualization container
 */
export const VisualizationSection = ({ 
  title,
  children,
  className = '',
  divider = false 
}) => {
  return (
    <div className={cn(
      divider && layout.sectionDivider,
      className
    )}>
      {title && (
        <h3 className={typography.h3}>{title}</h3>
      )}
      {children}
    </div>
  );
};

/**
 * Control panel for inputs and settings
 */
export const ControlPanel = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={cn(
      layout.innerContainer,
      spacing.section,
      className
    )}>
      {children}
    </div>
  );
};

/**
 * Graph/Chart container
 */
export const GraphContainer = ({ 
  children, 
  className = '',
  height = '400px' 
}) => {
  return (
    <div 
      className={cn(
        layout.innerContainer,
        'relative',
        className
      )}
      style={{ minHeight: height }}
    >
      {children}
    </div>
  );
};

/**
 * Stats display component
 */
export const StatsDisplay = ({ stats = [] }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <div key={index}>
          <span className={typography.label}>{stat.label}: </span>
          <span className={stat.highlight ? typography.valueAlt : typography.value}>
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
};

/**
 * Control group for related inputs
 */
export const ControlGroup = ({ 
  label, 
  children, 
  className = '' 
}) => {
  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label className={typography.label}>{label}</label>
      )}
      {children}
    </div>
  );
};