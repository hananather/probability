"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  VisualizationContainer, 
  VisualizationSection 
} from '../ui/VisualizationContainer';
import { Button } from '../ui/button';
import { ProgressBar } from '../ui/ProgressBar';
import { cn } from '@/lib/design-system';
import { 
  BookOpen, Trophy, Calculator, ChevronRight, Star
} from 'lucide-react';
import styles from './ChapterHub.module.css';

// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Progress tracking hook with optimizations
function useProgress(storageKey) {
  const [completedComponents, setCompletedComponents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [devMode, setDevMode] = useState(false);
  
  // Load data asynchronously after mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [progressData, devModeData] = await Promise.all([
          localStorage.getItem(storageKey),
          localStorage.getItem(`${storageKey}_devMode`)
        ]);
        
        if (progressData) {
          setCompletedComponents(JSON.parse(progressData));
        }
        if (devModeData === 'true') {
          setDevMode(true);
        }
      } catch (error) {
        console.error('Error loading progress data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [storageKey]);
  
  // Debounced save to localStorage
  const debouncedSave = useMemo(
    () => debounce((data) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    }, 1000),
    [storageKey]
  );
  
  // Save progress when it changes
  useEffect(() => {
    if (!isLoading && completedComponents.length > 0) {
      debouncedSave(completedComponents);
    }
  }, [completedComponents, debouncedSave, isLoading]);
  
  // Keyboard shortcut for dev mode (Ctrl/Cmd + Shift + D)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        setDevMode(prev => {
          const newValue = !prev;
          localStorage.setItem(`${storageKey}_devMode`, newValue.toString());
          return newValue;
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [storageKey]);
  
  const markComplete = useCallback((componentId) => {
    setCompletedComponents(prev => {
      if (!prev.includes(componentId)) {
        return [...prev, componentId];
      }
      return prev;
    });
  }, []);
  
  const isUnlocked = useCallback(() => true, []); // All components are accessible
  
  const hasPrerequisites = useCallback((component, completedList) => {
    return component.prerequisites.length > 0 && 
           !component.prerequisites.every(prereq => completedList.includes(prereq));
  }, []);
  
  return { completedComponents, markComplete, isUnlocked, hasPrerequisites, devMode, isLoading };
}

// Memoized Component Card
const ComponentCard = React.memo(({ 
  component, 
  isUnlocked, 
  isCompleted, 
  hasPrerequisites, 
  isNext, 
  onClick 
}) => {
  const handleClick = useCallback(() => {
    onClick(component);
  }, [onClick, component]);
  
  // Pre-calculate styles
  const gradientStyle = useMemo(() => ({
    background: `linear-gradient(135deg, ${component.color} 0%, transparent 100%)`
  }), [component.color]);
  
  const iconWrapperStyle = useMemo(() => ({
    backgroundColor: `${component.color}20`
  }), [component.color]);
  
  const iconStyle = useMemo(() => ({
    color: component.color
  }), [component.color]);
  
  const dotStyle = useMemo(() => ({
    backgroundColor: component.color
  }), [component.color]);
  
  return (
    <div
      className={cn(
        styles.componentCard,
        isNext && styles.componentCardNext
      )}
      onClick={handleClick}
    >
      {/* Background gradient */}
      <div className={styles.cardGradient} style={gradientStyle} />
      
      {/* Badges */}
      {hasPrerequisites && !isCompleted && (
        <div className={cn(styles.badge, styles.badgePrerequisite)}>
          Complete prerequisites first
        </div>
      )}
      
      {isNext && (
        <div className={cn(styles.badge, styles.badgeNext)}>
          <span>Start Here</span>
          <ChevronRight size={14} />
        </div>
      )}
      
      {isCompleted && (
        <div className={cn(styles.badge, styles.badgeCompleted)}>
          <Star size={16} fill="currentColor" />
        </div>
      )}
      
      <div className={styles.cardContent}>
        {/* Header */}
        <div className={styles.cardHeader}>
          <div className={styles.iconWrapper} style={iconWrapperStyle}>
            {React.createElement(component.icon, { 
              size: 24, 
              style: iconStyle
            })}
          </div>
          <div className="flex-1">
            <h3 className={styles.cardTitle}>
              {component.title}
            </h3>
            <p className={styles.cardSubtitle}>{component.subtitle}</p>
          </div>
        </div>
        
        {/* Description */}
        <p className={styles.cardDescription}>
          {component.description}
        </p>
        
        {/* Metadata */}
        <div className={styles.cardMetadata}>
          <span className={styles.difficultyIndicator}>
            <span className={styles.difficultyDot} style={dotStyle} />
            {component.difficulty}
          </span>
          <span>⏱️ {component.estimatedTime}</span>
        </div>
        
        {/* Learning goals - CSS hover instead of state */}
        <div className={styles.learningGoals}>
          <p className={styles.learningGoalsTitle}>
            You'll learn:
          </p>
          <ul className={styles.learningGoalsList}>
            {component.learningGoals.slice(0, 3).map((goal, index) => (
              <li key={index} className={styles.learningGoalItem}>
                <span className={styles.learningGoalBullet}>•</span>
                {goal}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Footer */}
        <div className={styles.cardFooter}>
          <span className={styles.cardFooterText}>
            {hasPrerequisites && !isCompleted && (
              <span className={styles.cardFooterTextWarning}>
                Recommended after prerequisites
              </span>
            )}
          </span>
          <ChevronRight size={20} className={styles.cardChevron} />
        </div>
      </div>
    </div>
  );
});

ComponentCard.displayName = 'ComponentCard';

// Main shared hub component
export default function ChapterHub({ 
  chapterNumber,
  chapterTitle,
  chapterSubtitle,
  sections = [],
  storageKey,
  progressVariant = 'purple',
  onSectionClick // Optional callback for when a section is clicked
}) {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const { completedComponents, markComplete, isUnlocked, hasPrerequisites, devMode, isLoading } = useProgress(storageKey);
  const [showComponent, setShowComponent] = useState(false);
  
  // Memoize calculations
  const totalProgress = useMemo(() => 
    Math.round((completedComponents.length / sections.length) * 100),
    [completedComponents.length, sections.length]
  );
  
  const handleComponentClick = useCallback((component) => {
    if (onSectionClick) {
      // If custom handler provided, use it
      onSectionClick(component);
    } else {
      // Default behavior - show placeholder
      setSelectedComponent(component);
      setShowComponent(true);
    }
  }, [onSectionClick]);
  
  const handleBackClick = useCallback(() => {
    setSelectedComponent(null);
    setShowComponent(false);
  }, []);
  
  // Placeholder component for clicked sections
  if (selectedComponent && showComponent && !onSectionClick) {
    return (
      <>
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackClick}
          >
            ← Back to Learning Hub
          </Button>
        </div>
        <VisualizationContainer title={selectedComponent.title}>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div 
              className="p-6 rounded-full mb-6"
              style={{ backgroundColor: `${selectedComponent.color}20` }}
            >
              {React.createElement(selectedComponent.icon, { 
                size: 48, 
                style: { color: selectedComponent.color }
              })}
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              {selectedComponent.title}
            </h2>
            <p className="text-neutral-400 mb-6 max-w-md">
              {selectedComponent.description}
            </p>
            <div className="bg-neutral-800 rounded-lg p-6 max-w-2xl">
              <h3 className="text-lg font-semibold text-white mb-4">
                This section is coming soon!
              </h3>
              <div className="text-left space-y-3">
                <p className="text-sm text-neutral-400 mb-4">
                  When completed, you'll learn:
                </p>
                <ul className="space-y-2">
                  {selectedComponent.learningGoals.map((goal, index) => (
                    <li key={index} className="text-sm text-neutral-300 flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 flex items-center justify-center gap-4 text-sm text-neutral-500">
                <span className="flex items-center gap-1">
                  <span 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: selectedComponent.color }}
                  />
                  {selectedComponent.difficulty}
                </span>
                <span>•</span>
                <span>⏱️ {selectedComponent.estimatedTime}</span>
              </div>
            </div>
          </div>
        </VisualizationContainer>
      </>
    );
  }
  
  return (
    <VisualizationContainer title={`Chapter ${chapterNumber}: ${chapterTitle} - Learning Hub`}>
      {/* Header with progress */}
      <div className={styles.progressContainer}>
        <div className={styles.progressHeader}>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Master {chapterTitle}
            </h2>
            <p className="text-neutral-400">
              {chapterSubtitle}
            </p>
            <p className="text-sm text-neutral-500 mt-2">
              All sections are accessible - follow the numbered sequence for the best learning experience
            </p>
          </div>
          <div className={styles.progressStats}>
            <p className={styles.progressLabel}>Overall Progress</p>
            <p className={styles.progressPercentage}>{totalProgress}%</p>
          </div>
        </div>
        
        <ProgressBar 
          current={completedComponents.length}
          total={sections.length}
          variant={progressVariant}
          showSteps
        />
      </div>
      
      {/* Learning paths */}
      <VisualizationSection title="Choose Your Learning Path">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((component, index) => {
            // Determine if this is the next recommended component
            const isCompleted = completedComponents.includes(component.id);
            const isNext = !isCompleted && 
              (index === 0 || completedComponents.includes(sections[index - 1].id));
            
            return (
              <ComponentCard
                key={component.id}
                component={component}
                isUnlocked={isUnlocked(component)}
                isCompleted={isCompleted}
                hasPrerequisites={hasPrerequisites(component, completedComponents)}
                isNext={isNext}
                onClick={handleComponentClick}
              />
            );
          })}
        </div>
      </VisualizationSection>
      
      {/* Learning tips */}
      <VisualizationSection title="Learning Tips" className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={styles.tipCard}>
            <BookOpen className={cn(styles.tipIcon, "text-blue-400")} size={24} />
            <h4 className={styles.tipTitle}>Build Intuition First</h4>
            <p className={styles.tipDescription}>
              Start with fundamentals to understand the core concepts
            </p>
          </div>
          <div className={styles.tipCard}>
            <Trophy className={cn(styles.tipIcon, "text-yellow-400")} size={24} />
            <h4 className={styles.tipTitle}>Practice Real Scenarios</h4>
            <p className={styles.tipDescription}>
              Apply concepts to real-world data to reinforce understanding
            </p>
          </div>
          <div className={styles.tipCard}>
            <Calculator className={cn(styles.tipIcon, "text-purple-400")} size={24} />
            <h4 className={styles.tipTitle}>Master the Concepts</h4>
            <p className={styles.tipDescription}>
              Learn when and how to apply each concept effectively
            </p>
          </div>
        </div>
      </VisualizationSection>
      
      {/* Quick stats */}
      {completedComponents.length > 0 && (
        <div className={styles.achievementsContainer}>
          <h3 className={styles.achievementsTitle}>Your Achievements</h3>
          <div className={styles.achievementBadges}>
            {completedComponents.map(id => {
              const component = sections.find(c => c.id === id);
              return component && (
                <div
                  key={id}
                  className={styles.achievementBadge}
                  style={{ 
                    backgroundColor: `${component.color}20`,
                    color: component.color
                  }}
                >
                  {component.title} ✓
                </div>
              );
            })}
          </div>
        </div>
      )}
    </VisualizationContainer>
  );
}