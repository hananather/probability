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
  Sparkles, Layers, BarChart3, TrendingUp,
  ChevronRight, Star, ChevronLeft, BookOpen,
  Trophy, Calculator, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Component metadata with enhanced learning paths
const LEARNING_COMPONENTS = [
  {
    id: 'interactive-intro',
    title: '1. Discover Sampling Distributions',
    subtitle: 'Start with hands-on exploration',
    description: 'Roll dice and watch the magic unfold! See how individual random values transform into predictable patterns when we take many samples.',
    icon: Sparkles,
    difficulty: 'Beginner',
    estimatedTime: '10 min',
    prerequisites: [],
    learningGoals: [
      'What happens when we take many samples?',
      'See patterns emerge from randomness',
      'Understand sample means intuitively',
      'Build foundation for theory'
    ],
    component: () => import('./4-3-0-SamplingDistributionsInteractive'),
    color: '#10b981', // Green for beginner
    concepts: ['Sampling', 'Sample means', 'Pattern emergence']
  },
  {
    id: 'theory-foundations',
    title: '2. Mathematical Foundations',
    subtitle: 'Formalize your discoveries',
    description: 'Now that you\'ve seen the patterns, let\'s understand why they occur. Learn the mathematical theory behind sampling distributions.',
    icon: Calculator,
    difficulty: 'Intermediate',
    estimatedTime: '15 min',
    prerequisites: ['interactive-intro'],
    learningGoals: [
      'Mathematical definitions and notation',
      'Why sample means cluster around μ',
      'Standard error formula and meaning',
      'Connection to probability theory'
    ],
    component: () => import('./4-3-2-SamplingDistributionsTheory'),
    color: '#3b82f6', // Blue for intermediate
    concepts: ['Population parameters', 'Standard error', 'Mathematical proofs']
  },
  {
    id: 'clt-gateway',
    title: '3. Gateway to Central Limit Theorem',
    subtitle: 'Bridge to the magic',
    description: 'See how sampling distributions connect to the Central Limit Theorem. Watch any distribution transform into a normal one!',
    icon: Layers,
    difficulty: 'Intermediate',
    estimatedTime: '10 min',
    prerequisites: ['theory-foundations'],
    learningGoals: [
      'Connection between sampling and CLT',
      'Visual transformation demonstrations',
      'Why the CLT works for any distribution',
      'Preparing for deep CLT exploration'
    ],
    component: () => import('./4-3-3-CLTGateway'),
    color: '#6366f1', // Indigo for intermediate-advanced
    concepts: ['CLT preview', 'Distribution transformation', 'Normal convergence']
  },
  {
    id: 'clt-properties',
    title: '4. CLT Properties & Sample Size Effects',
    subtitle: 'Visualize the transformation in action',
    description: 'Experience the Central Limit Theorem through beautiful animations. Watch distributions transform and see how sample size affects convergence to normality.',
    icon: Zap,
    difficulty: 'Intermediate-Advanced',
    estimatedTime: '15 min',
    prerequisites: ['clt-gateway'],
    learningGoals: [
      'Watch any distribution become normal through CLT',
      'See how sample size affects distribution shape',
      'Understand standard error and convergence rate',
      'Interactive controls for deep exploration'
    ],
    component: () => import('./4-3-2-CLTProperties-merged'),
    color: '#7c3aed', // Purple-violet for intermediate-advanced
    concepts: ['CLT visualization', 'Sample size effects', 'Standard error', 'Normal convergence']
  },
  {
    id: 'visual-exploration',
    title: '5. Master the Central Limit Theorem',
    subtitle: 'Experience the full power',
    description: 'Deep dive into the Central Limit Theorem with comprehensive interactive visualizations. Apply what you\'ve learned!',
    icon: TrendingUp,
    difficulty: 'Advanced',
    estimatedTime: '20 min',
    prerequisites: ['clt-properties'],
    learningGoals: [
      'Full CLT exploration with any distribution',
      'Interactive parameter controls',
      'Real-time visualization of convergence',
      'Mathematical insights and applications'
    ],
    component: () => import('./4-3-4-SamplingDistributionsVisual'),
    color: '#8b5cf6', // Purple for advanced
    concepts: ['CLT mastery', 'Statistical inference', 'Real applications']
  }
];

// Progress tracking hook
function useProgress() {
  const [completedComponents, setCompletedComponents] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('samplingDistributionsProgress');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  useEffect(() => {
    localStorage.setItem('samplingDistributionsProgress', JSON.stringify(completedComponents));
  }, [completedComponents]);
  
  const markComplete = (componentId) => {
    if (!completedComponents.includes(componentId)) {
      setCompletedComponents(prev => [...prev, componentId]);
    }
  };
  
  const isUnlocked = (component) => {
    return true; // All components are accessible
  };
  
  const hasPrerequisites = (component) => {
    return component.prerequisites.length > 0 && 
           !component.prerequisites.every(prereq => completedComponents.includes(prereq));
  };
  
  return { completedComponents, markComplete, isUnlocked, hasPrerequisites };
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
        "bg-neutral-800 hover:bg-neutral-700 border border-gray-700",
        isNext && "ring-2 ring-green-500 ring-opacity-50"
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background gradient */}
      <div 
        className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
        style={{
          background: `linear-gradient(135deg, ${component.color} 0%, transparent 100%)`
        }}
      />
      
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
        
        {/* Key concepts */}
        <div className="space-y-2 mb-4">
          <p className="text-xs font-semibold text-neutral-400">Key Concepts:</p>
          <div className="flex flex-wrap gap-2">
            {component.concepts.map((concept, i) => (
              <span 
                key={i}
                className="text-xs px-2 py-1 rounded-full bg-neutral-700 text-neutral-300"
              >
                {concept}
              </span>
            ))}
          </div>
        </div>
        
        {/* Learning goals preview on hover */}
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
        
        {/* Action indicator */}
        <div className="flex items-center justify-between mt-4">
          <Button
            size="sm"
            className="px-4"
          >
            Start Learning
          </Button>
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
const SamplingDistributionsHub = () => {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const { completedComponents, markComplete, isUnlocked, hasPrerequisites } = useProgress();
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
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Learning Hub
          </Button>
        </div>
        <Component 
          onComplete={() => {
            markComplete(selectedComponent.id);
          }}
        />
      </>
    );
  }
  
  return (
    <VisualizationContainer 
      title="4.3 Sampling Distributions Hub"
      description="Discover the patterns that emerge when we repeatedly sample from populations"
    >
      {/* Welcome section with key concepts */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-600/30">
        <h2 className="text-xl font-semibold mb-3 text-blue-400">Welcome to Sampling Distributions!</h2>
        <p className="text-gray-300 mb-4">
          Sampling distributions are the foundation of statistical inference. When we repeatedly take samples 
          and calculate statistics, those statistics form their own distribution with predictable properties. 
          This journey will transform how you think about data and uncertainty.
        </p>
        
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-400">Overall Progress</p>
            <p className="text-2xl font-bold text-white">{totalProgress}%</p>
          </div>
          <ProgressBar 
            current={completedComponents.length}
            total={LEARNING_COMPONENTS.length}
            variant="purple"
            showSteps
          />
        </div>
        
        {/* Key concepts preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-green-400">🎯</span>
            <div>
              <strong className="text-green-300">Start Simple:</strong> Build intuition with interactive sampling
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-400">📊</span>
            <div>
              <strong className="text-blue-300">See Patterns:</strong> Watch distributions transform and normalize
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">✨</span>
            <div>
              <strong className="text-purple-300">Master CLT:</strong> The theorem that powers all inference
            </div>
          </div>
        </div>
      </div>
      
      {/* Central visual anchor */}
      <motion.div 
        className="mb-8 relative h-64 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <SamplingAnimation />
        </div>
      </motion.div>
      
      {/* Learning paths */}
      <VisualizationSection title="Choose Your Learning Path">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {LEARNING_COMPONENTS.map((component, index) => {
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
      
      {/* Learning objectives summary */}
      <VisualizationSection title="Complete Learning Objectives" className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-cyan-400">Core Concepts</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 mt-1">•</span>
                <span>Understanding sampling distributions and their formation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 mt-1">•</span>
                <span>How sample size affects distribution shape and spread</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 mt-1">•</span>
                <span>Standard error and its relationship to sample size</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 mt-1">•</span>
                <span>Central Limit Theorem and its magical properties</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-violet-400">Practical Skills</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-1">•</span>
                <span>Predicting sampling distribution behavior</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-1">•</span>
                <span>Calculating standard errors for sample means</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-1">•</span>
                <span>Applying CLT to real-world problems</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-1">•</span>
                <span>Building foundation for hypothesis testing</span>
              </li>
            </ul>
          </div>
        </div>
      </VisualizationSection>
      
      {/* Learning tips */}
      <VisualizationSection title="Learning Tips" className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-neutral-800 rounded-lg p-4">
            <BookOpen className="text-blue-400 mb-2" size={24} />
            <h4 className="font-semibold mb-1">Start with Intuition</h4>
            <p className="text-sm text-neutral-400">
              Begin with the basics to build a solid conceptual foundation
            </p>
          </div>
          <div className="bg-neutral-800 rounded-lg p-4">
            <Trophy className="text-yellow-400 mb-2" size={24} />
            <h4 className="font-semibold mb-1">Practice Actively</h4>
            <p className="text-sm text-neutral-400">
              Interact with simulations to reinforce your understanding
            </p>
          </div>
          <div className="bg-neutral-800 rounded-lg p-4">
            <Calculator className="text-purple-400 mb-2" size={24} />
            <h4 className="font-semibold mb-1">Connect to Applications</h4>
            <p className="text-sm text-neutral-400">
              See how these concepts power real statistical inference
            </p>
          </div>
        </div>
      </VisualizationSection>
      
      {/* Pro tip */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
        <p className="text-sm text-blue-300">
          <strong className="text-blue-400">💡 Pro Tip:</strong> The Central Limit Theorem is arguably the most 
          important theorem in statistics. It tells us that no matter what shape our original population has, 
          the distribution of sample means will become approximately normal as sample size increases. This is 
          why the normal distribution appears everywhere in statistics!
        </p>
      </div>
      
      {/* Achievements */}
      {completedComponents.length > 0 && (
        <div className="mt-8 p-4 bg-neutral-900 rounded-lg">
          <h3 className="font-semibold mb-2">Your Achievements</h3>
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
};

const SamplingAnimation = () => {
  const [sampleIndex, setSampleIndex] = useState(0);
  const [histogramData, setHistogramData] = useState(Array(11).fill(2)); // Start with some data
  
  // Faster animation cycle - 2.5 seconds total
  const CYCLE_DURATION = 2500;
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSampleIndex(prev => (prev + 1) % 3); // Cycle through 3 different samples
      
      // Build histogram gradually
      setHistogramData(prev => {
        const newData = [...prev];
        // Generate sample mean (centered around 5-6)
        const sampleMean = 5 + (Math.random() - 0.5) * 2;
        const binIndex = Math.round(sampleMean);
        
        // Add to histogram with smooth growth
        if (binIndex >= 0 && binIndex < 11) {
          newData[binIndex] = Math.min(newData[binIndex] + 0.5, 15);
        }
        
        // Gentle decay to keep it dynamic
        return newData.map((h, i) => {
          const decay = i === binIndex ? 1 : 0.98;
          return h * decay;
        });
      });
    }, CYCLE_DURATION);
    
    return () => clearInterval(interval);
  }, []);
  
  // Pre-defined sample patterns for consistency
  const samplePatterns = [
    [0, 45, 90, 180, 270],
    [36, 108, 180, 252, 324],
    [60, 150, 240, 330, 30]
  ];
  
  // Sample size
  const sampleSize = 5;
  const angles = samplePatterns[sampleIndex % 3];
  const samplePoints = angles.map((angle, i) => {
    const rad = (angle * Math.PI) / 180;
    const radius = 40 + (i % 2) * 20; // Vary radius
    return {
      x: Math.cos(rad) * radius,
      y: Math.sin(rad) * radius,
      value: 55 + Math.sin(rad * 2) * 10 // Deterministic values
    };
  });
  
  // Calculate mean
  const sampleMean = samplePoints.reduce((sum, p) => sum + p.value, 0) / sampleSize;
  
  // Normal curve always visible
  const normalCurve = (() => {
    const points = [];
    const width = 200;
    const height = 60;
    const steps = 40;
    
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * width - width/2;
      const z = x / (width / 6);
      const y = height * Math.exp(-0.5 * z * z);
      points.push(`${x},${-y}`);
    }
    
    return `M ${points.join(' L ')}`;
  })();
  
  return (
    <svg viewBox="0 0 900 280" className="w-full h-full max-w-3xl">
      {/* Population Circle */}
      <g transform="translate(150, 140)">
        <motion.circle 
          cx="0" cy="0" r="70" 
          fill="#3B82F6" 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 0.3 }}
          strokeWidth="2" 
          stroke="#3B82F6" 
        />
        <text x="0" y="-90" textAnchor="middle" className="fill-gray-600 dark:fill-gray-400 font-medium text-sm">
          Population
        </text>
        
        {/* Population points - subtle pulse animation */}
        {[...Array(25)].map((_, i) => {
          const angle = (i / 25) * 2 * Math.PI;
          const baseRadius = 25 + (i % 3) * 15;
          const x = Math.cos(angle) * baseRadius;
          const y = Math.sin(angle) * baseRadius;
          
          return (
            <motion.circle
              key={`pop-${i}`}
              cx={x}
              cy={y}
              r="2.5"
              fill="#3B82F6"
              initial={{ opacity: 0.2 }}
              animate={{ 
                opacity: [0.2, 0.4, 0.2],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 3,
                delay: i * 0.1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          );
        })}
        
        {/* Animated sample points - faster, smoother */}
        {samplePoints.map((point, i) => (
          <motion.g key={`sample-${sampleIndex}-${i}`}>
            {/* Selection highlight */}
            <motion.circle
              cx={point.x}
              cy={point.y}
              r="12"
              fill="#3B82F6"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1], opacity: [0, 0.3, 0] }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
            />
            
            {/* Sample point */}
            <motion.circle
              r="4"
              fill="#60A5FA"
              stroke="#3B82F6"
              strokeWidth="2"
              initial={{ 
                cx: point.x, 
                cy: point.y,
                opacity: 0,
                scale: 0
              }}
              animate={{
                cx: [point.x, point.x, 0, 300],
                cy: [point.y, point.y, 0, 0],
                opacity: [0, 1, 1, 0],
                scale: [0, 1.2, 1, 0]
              }}
              transition={{
                times: [0, 0.15, 0.5, 1],
                duration: 2,
                delay: i * 0.05,
                ease: "easeInOut"
              }}
            />
          </motion.g>
        ))}
      </g>
      
      {/* Arrow showing flow */}
      <motion.g transform="translate(300, 140)">
        <motion.path
          d="M 0 0 L 40 0"
          stroke="#6B7280"
          strokeWidth="2"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ 
            duration: 0.5,
            delay: 0.8,
            repeat: Infinity,
            repeatDelay: 2
          }}
        />
        <motion.text
          x="20"
          y="-10"
          textAnchor="middle"
          className="fill-gray-500 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          x̄ = {sampleMean.toFixed(1)}
        </motion.text>
      </motion.g>
      
      {/* Histogram */}
      <g transform="translate(600, 140)">
        <text x="0" y="-90" textAnchor="middle" className="fill-gray-600 dark:fill-gray-400 font-medium text-sm">
          Sampling Distribution
        </text>
        
        {/* X-axis */}
        <line x1="-100" y1="0" x2="100" y2="0" stroke="#4B5563" strokeWidth="1" />
        
        {/* Histogram bars with smooth animation */}
        {histogramData.map((height, i) => {
          const barWidth = 18;
          const x = (i - 5) * barWidth;
          const normalizedHeight = height * 4;
          
          return (
            <motion.rect
              key={`bar-${i}`}
              x={x}
              width={barWidth - 2}
              fill="#8B5CF6"
              animate={{
                y: -normalizedHeight,
                height: normalizedHeight,
                opacity: height > 0.5 ? 0.8 : 0.3
              }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              style={{ transformOrigin: 'bottom' }}
            />
          );
        })}
        
        {/* Normal curve overlay - always visible but fades in */}
        <motion.path
          d={normalCurve}
          fill="none"
          stroke="#10B981"
          strokeWidth="2.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 1, delay: 1 }}
        />
        
        {/* Subtle grid lines */}
        {[-60, 0, 60].map(x => (
          <line
            key={x}
            x1={x}
            y1="0"
            x2={x}
            y2="5"
            stroke="#6B7280"
            strokeWidth="1"
            opacity="0.5"
          />
        ))}
        
        {/* Labels */}
        <text x="-60" y="15" className="fill-gray-500 text-xs" textAnchor="middle">45</text>
        <text x="0" y="15" className="fill-gray-500 text-xs" textAnchor="middle">60</text>
        <text x="60" y="15" className="fill-gray-500 text-xs" textAnchor="middle">75</text>
      </g>
      
      {/* Connecting lines to show flow */}
      <motion.g>
        <motion.line
          x1="220"
          y1="140"
          x2="280"
          y2="140"
          stroke="#4B5563"
          strokeWidth="1"
          strokeDasharray="3 3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.3 }}
        />
        <motion.line
          x1="340"
          y1="140"
          x2="500"
          y2="140"
          stroke="#4B5563"
          strokeWidth="1"
          strokeDasharray="3 3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.6 }}
        />
      </motion.g>
    </svg>
  );
};

export default SamplingDistributionsHub;