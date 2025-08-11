"use client";
import React, { useState, useEffect } from "react";
import { 
  VisualizationContainer, 
  VisualizationSection 
} from '../../ui/VisualizationContainer';
import { Button } from '../../ui/button';
import { ProgressBar } from '../../ui/ProgressBar';
import { cn } from '@/lib/design-system';
import { 
  BookOpen, Lightbulb, FlaskConical, 
  Calculator, ChevronRight, Star, Lock, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Component metadata
const LEARNING_COMPONENTS = [
  {
    id: 'intuitive-intro',
    title: '1. Numerical Summaries Introduction',
    subtitle: 'Start your journey here',
    description: 'Discover measures of centrality and spread through interactive exploration. Learn about sample median, sample mean, and their properties.',
    icon: Lightbulb,
    difficulty: 'Beginner',
    estimatedTime: '10 min',
    prerequisites: [],
    learningGoals: [
      'Understand numerical summaries',
      'Explore sample mean and its properties',
      'Discover sample median and robustness',
      'Learn when to use mean vs median'
    ],
    component: () => import('./4-1-1-CentralTendencyIntro'),
    color: '#10b981' // Green for beginner
  },
  {
    id: 'descriptive-stats-journey',
    title: '2. Descriptive Stats Journey',
    subtitle: 'Complete statistical analysis',
    description: 'Master statistical analysis through interactive exploration and computation. Progress through central tendency, dispersion, quartiles, and outlier detection.',
    icon: Calculator,
    difficulty: 'Intermediate',
    estimatedTime: '25 min',
    prerequisites: ['intuitive-intro'],
    learningGoals: [
      'Calculate quartiles and five-number summary',
      'Understand measures of spread',
      'Detect outliers using the IQR method',
      'Apply statistics to real datasets'
    ],
    component: () => import('./4-1-2-DescriptiveStatsJourney'),
    color: '#3b82f6' // Blue for intermediate
  },
  {
    id: 'descriptive-stats-foundations',
    title: '3. Descriptive Statistics Foundations',
    subtitle: 'Master statistical measures',
    description: 'Learn quartiles, variance, standard deviation, and outlier detection through real-world accident data analysis.',
    icon: Calculator,
    difficulty: 'Advanced',
    estimatedTime: '20 min',
    prerequisites: ['descriptive-stats-journey'],
    learningGoals: [
      'Formal mathematical definitions',
      'Minimization properties',
      'Other types of means',
      'Theoretical foundations'
    ],
    component: () => import('./4-1-3-DescriptiveStatisticsFoundations'),
    color: '#8b5cf6' // Purple for advanced
  },
  {
    id: 'mathematical-foundations',
    title: '4. Mathematical Foundations',
    subtitle: 'For the mathematically inclined',
    description: 'Dive deep into formulas, proofs, and mathematical properties of central tendency measures.',
    icon: FlaskConical,
    difficulty: 'Advanced',
    estimatedTime: '30 min',
    prerequisites: ['descriptive-stats-foundations'],
    learningGoals: [
      'Formal mathematical definitions',
      'Minimization properties',
      'Other types of means',
      'Theoretical foundations'
    ],
    component: () => import('./4-1-4-MathematicalFoundations'),
    color: '#f59e0b' // Amber for exploration
  }
];

// Progress tracking
function useProgress() {
  const [completedComponents, setCompletedComponents] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dataDescriptionsProgress');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [devMode, setDevMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('centralTendency_devMode');
      return saved === 'true';
    }
    return false;
  });
  
  useEffect(() => {
    localStorage.setItem('dataDescriptionsProgress', JSON.stringify(completedComponents));
  }, [completedComponents]);
  
  // Keyboard shortcut for dev mode (Ctrl/Cmd + Shift + D)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        setDevMode(prev => {
          const newValue = !prev;
          localStorage.setItem('centralTendency_devMode', newValue.toString());
          return newValue;
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  const markComplete = (componentId) => {
    if (!completedComponents.includes(componentId)) {
      setCompletedComponents(prev => [...prev, componentId]);
    }
  };
  
  const isUnlocked = (component) => {
    // Always return true - all components are now accessible
    return true;
  };
  
  const hasPrerequisites = (component) => {
    return component.prerequisites.length > 0 && 
           !component.prerequisites.every(prereq => completedComponents.includes(prereq));
  };
  
  return { completedComponents, markComplete, isUnlocked, hasPrerequisites, devMode };
}

// Component card
function ComponentCard({ component, isUnlocked, isCompleted, hasPrerequisites, isNext, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      whileHover={isUnlocked ? { scale: 1.02 } : {}}
      whileTap={isUnlocked ? { scale: 0.98 } : {}}
      className={cn(
        "relative overflow-hidden rounded-xl transition-all cursor-pointer",
        "bg-neutral-800 hover:bg-neutral-700",
        isNext && "ring-2 ring-green-500 ring-opacity-50"
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background gradient */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: `linear-gradient(135deg, ${component.color} 0%, transparent 100%)`
        }}
      />
      
      {/* Recommended badge for prerequisites */}
      {hasPrerequisites && !isCompleted && (
        <div className="absolute top-4 left-4 bg-amber-500/20 text-amber-400 px-2 py-1 rounded text-xs font-medium">
          Complete prerequisites first
        </div>
      )}
      
      {/* Next recommended indicator */}
      {isNext && (
        <div className="absolute top-4 left-4 bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
          <span>Start Here</span>
          <ChevronRight size={14} />
        </div>
      )}
      
      {/* Completed badge */}
      {isCompleted && (
        <div className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-full">
          <Star size={16} fill="currentColor" />
        </div>
      )}
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: `${component.color}20` }}
          >
            {React.createElement(component.icon, { 
              size: 24, 
              style: { color: component.color }
            })}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              {component.title}
            </h3>
            <p className="text-sm text-neutral-400">{component.subtitle}</p>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-sm text-neutral-300 mb-4">
          {component.description}
        </p>
        
        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-neutral-500 mb-4">
          <span className="flex items-center gap-1">
            <span 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: component.color }}
            />
            {component.difficulty}
          </span>
          <span>⏱️ {component.estimatedTime}</span>
        </div>
        
        {/* Learning goals preview */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-neutral-700 pt-4"
            >
              <p className="text-xs font-semibold text-neutral-400 mb-2">
                You'll learn:
              </p>
              <ul className="space-y-1">
                {component.learningGoals.slice(0, 3).map((goal, index) => (
                  <li key={index} className="text-xs text-neutral-500 flex items-start gap-1">
                    <span className="text-green-500 mt-0.5">•</span>
                    {goal}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Action button */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-neutral-400">
            {hasPrerequisites && !isCompleted && (
              <span className="text-amber-400">Recommended after prerequisites</span>
            )}
          </span>
          <ChevronRight 
            size={20} 
            className="text-neutral-400"
            style={{ color: isHovered ? component.color : undefined }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// Main hub component
export default function CentralTendencyHub() {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const { completedComponents, markComplete, isUnlocked, hasPrerequisites, devMode } = useProgress();
  const [showComponent, setShowComponent] = useState(false);
  
  // Calculate overall progress
  const totalProgress = Math.round(
    (completedComponents.length / LEARNING_COMPONENTS.length) * 100
  );
  
  // Load selected component
  useEffect(() => {
    if (selectedComponent) {
      setShowComponent(false);
      
      // Dynamic import
      selectedComponent.component().then(module => {
        const Component = module.default;
        setSelectedComponent({ ...selectedComponent, Component });
        setShowComponent(true);
      });
    }
  }, [selectedComponent?.id]);
  
  if (selectedComponent && showComponent) {
    const { Component } = selectedComponent;
    return (
      <>
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedComponent(null)}
          >
            ← Back to Learning Hub
          </Button>
        </div>
        <Component 
          onComplete={() => {
            markComplete(selectedComponent.id);
            // Optionally show a success message
          }}
        />
      </>
    );
  }
  
  return (
    <VisualizationContainer title="4.1 Data Descriptions - Learning Hub">
      {/* Header with progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Master Data Descriptions
            </h2>
            <p className="text-neutral-400">
              Explore numerical summaries and learn to describe data effectively
            </p>
            <p className="text-sm text-neutral-500 mt-2">
              All sections are accessible - follow the numbered sequence for the best learning experience
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-400 mb-1">Overall Progress</p>
            <p className="text-3xl font-bold text-white">{totalProgress}%</p>
          </div>
        </div>
        
        <ProgressBar 
          current={completedComponents.length}
          total={LEARNING_COMPONENTS.length}
          variant="purple"
          showSteps
        />
      </div>
      
      {/* Learning paths */}
      <VisualizationSection title="Choose Your Learning Path">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {LEARNING_COMPONENTS.map((component, index) => {
            // Determine if this is the next recommended component
            const isCompleted = completedComponents.includes(component.id);
            const isNext = !isCompleted && 
              (index === 0 || completedComponents.includes(LEARNING_COMPONENTS[index - 1].id));
            
            return (
              <ComponentCard
                key={component.id}
                component={component}
                isUnlocked={isUnlocked(component)}
                isCompleted={isCompleted}
                hasPrerequisites={hasPrerequisites(component)}
                isNext={isNext}
                onClick={() => setSelectedComponent(component)}
              />
            );
          })}
        </div>
      </VisualizationSection>
      
      {/* Learning tips */}
      <VisualizationSection title="Learning Tips" className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-neutral-800 rounded-lg p-4">
            <BookOpen className="text-blue-400 mb-2" size={24} />
            <h4 className="font-semibold mb-1">Start Simple</h4>
            <p className="text-sm text-neutral-400">
              Begin with numerical summaries to build a solid foundation
            </p>
          </div>
          <div className="bg-neutral-800 rounded-lg p-4">
            <Calculator className="text-yellow-400 mb-2" size={24} />
            <h4 className="font-semibold mb-1">Practice Makes Perfect</h4>
            <p className="text-sm text-neutral-400">
              Complete challenges in the journey to reinforce your learning
            </p>
          </div>
          <div className="bg-neutral-800 rounded-lg p-4">
            <Calculator className="text-purple-400 mb-2" size={24} />
            <h4 className="font-semibold mb-1">Go Deeper</h4>
            <p className="text-sm text-neutral-400">
              Explore mathematical foundations when you're ready for rigor
            </p>
          </div>
        </div>
      </VisualizationSection>
      
      {/* Quick stats */}
      {completedComponents.length > 0 && (
        <div className="mt-8 p-4 bg-neutral-900 rounded-lg">
          <h3 className="font-semibold mb-2">Your Progress</h3>
          <div className="flex flex-wrap gap-2">
            {completedComponents.map(id => {
              const component = LEARNING_COMPONENTS.find(c => c.id === id);
              return component && (
                <div
                  key={id}
                  className="px-3 py-1 rounded-full text-sm"
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