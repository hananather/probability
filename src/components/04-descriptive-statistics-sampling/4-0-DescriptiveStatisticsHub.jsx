"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import ChapterHub from "../shared/ChapterHub";
import { motion } from "framer-motion";
import { Card } from "../ui/card";
import { createColorScheme } from "@/lib/design-system";
import { 
  BarChart, TrendingUp, Activity, PieChart,
  Calculator, Sigma, LineChart, GitBranch
} from 'lucide-react';

// Get consistent color scheme
const colors = createColorScheme('probability');

// Population to Distribution Animation (from existing SamplingDistributionsHub)
const SamplingAnimation = () => {
  const [sampleIndex, setSampleIndex] = useState(0);
  const [histogramData, setHistogramData] = useState(Array(11).fill(2));
  
  const CYCLE_DURATION = 2500;
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSampleIndex(prev => (prev + 1) % 3);
      
      setHistogramData(prev => {
        const newData = [...prev];
        const sampleMean = 5 + (Math.random() - 0.5) * 2;
        const binIndex = Math.round(sampleMean);
        
        if (binIndex >= 0 && binIndex < 11) {
          newData[binIndex] = Math.min(newData[binIndex] + 0.5, 15);
        }
        
        return newData.map((h, i) => {
          const decay = i === binIndex ? 1 : 0.98;
          return h * decay;
        });
      });
    }, CYCLE_DURATION);
    
    return () => clearInterval(interval);
  }, []);
  
  const samplePatterns = [
    [0, 45, 90, 180, 270],
    [36, 108, 180, 252, 324],
    [60, 150, 240, 330, 30]
  ];
  
  const sampleSize = 5;
  const angles = samplePatterns[sampleIndex % 3];
  const samplePoints = angles.map((angle, i) => {
    const rad = (angle * Math.PI) / 180;
    const radius = 40 + (i % 2) * 20;
    return {
      x: Math.cos(rad) * radius,
      y: Math.sin(rad) * radius,
      value: 55 + Math.sin(rad * 2) * 10
    };
  });
  
  const sampleMean = samplePoints.reduce((sum, p) => sum + p.value, 0) / sampleSize;
  
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
        
        {/* Population points */}
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
        
        {/* Animated sample points */}
        {samplePoints.map((point, i) => (
          <motion.g key={`sample-${sampleIndex}-${i}`}>
            <motion.circle
              cx={point.x}
              cy={point.y}
              r="12"
              fill="#3B82F6"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1], opacity: [0, 0.3, 0] }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
            />
            
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
      
      {/* Arrow */}
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
        
        <line x1="-100" y1="0" x2="100" y2="0" stroke="#4B5563" strokeWidth="1" />
        
        {/* Histogram bars */}
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
        
        {/* Normal curve overlay */}
        <motion.path
          d={normalCurve}
          fill="none"
          stroke="#10B981"
          strokeWidth="2.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 1, delay: 1 }}
        />
        
        {/* Grid lines */}
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
        
        <text x="-60" y="15" className="fill-gray-500 text-xs" textAnchor="middle">45</text>
        <text x="0" y="15" className="fill-gray-500 text-xs" textAnchor="middle">60</text>
        <text x="60" y="15" className="fill-gray-500 text-xs" textAnchor="middle">75</text>
      </g>
      
      {/* Connecting lines */}
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

// Key Concepts Card
const KeyConceptsCard = React.memo(() => {
  const contentRef = useRef(null);
  const concepts = [
    { term: "Central Tendency", definition: "Mean, median, and mode", latex: "\\bar{x}, \\tilde{x}" },
    { term: "Variability", definition: "Spread and dispersion", latex: "s^2, s" },
    { term: "Distributions", definition: "Shape of your data", latex: "f(x)" },
    { term: "CLT", definition: "The magic of sampling", latex: "\\bar{X} \\sim N" },
  ];

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
    <Card ref={contentRef} className="mb-8 p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/50">
      <h3 className="text-xl font-bold text-white mb-4">Key Concepts You'll Master</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {concepts.map((concept, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-white">{concept.term}</h4>
                <p className="text-sm text-gray-400 mt-1">{concept.definition}</p>
              </div>
              <div className="text-2xl font-mono text-purple-400">
                <span dangerouslySetInnerHTML={{ __html: `\\(${concept.latex}\\)` }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
});

// Chapter 4 section configuration
const CHAPTER_4_SECTIONS = [
  {
    id: 'data-descriptions',
    title: '4.1 Data Descriptions',
    subtitle: 'Measures of center and spread',
    description: 'Master the fundamental tools for summarizing data: mean, median, mode, variance, and standard deviation.',
    icon: Calculator,
    difficulty: 'Beginner',
    estimatedTime: '45 min',
    prerequisites: [],
    learningGoals: [
      'Calculate measures of central tendency',
      'Understand quartiles and outliers',
      'Apply measures of spread',
      'Work with real datasets'
    ],
    route: '/chapter4/data-descriptions',
    color: '#8b5cf6',
    question: "What single number best represents your data?",
    preview: "Interactive statistics calculator"
  },
  {
    id: 'visual-summaries',
    title: '4.2 Visual Summaries',
    subtitle: 'Histograms and boxplots',
    description: 'Learn to create and interpret visual representations of data distributions using histograms and boxplots.',
    icon: BarChart,
    difficulty: 'Beginner',
    estimatedTime: '40 min',
    prerequisites: ['data-descriptions'],
    learningGoals: [
      'Create effective histograms',
      'Interpret boxplots and quartiles',
      'Identify distribution shapes',
      'Compare datasets visually'
    ],
    route: '/chapter4/visual-summaries',
    color: '#8b5cf6',
    question: "How can we visualize an entire dataset at once?",
    preview: "Interactive histogram and boxplot builder"
  },
  {
    id: 'sampling-distributions',
    title: '4.3 Sampling Distributions',
    subtitle: 'Distribution of sample statistics',
    description: 'Discover how sample statistics behave when we repeatedly sample from a population.',
    icon: TrendingUp,
    difficulty: 'Intermediate',
    estimatedTime: '35 min',
    prerequisites: ['visual-summaries'],
    learningGoals: [
      'Understand sampling variability',
      'Explore the distribution of sample means',
      'Calculate standard error',
      'Build intuition for inference'
    ],
    route: '/chapter4/sampling-distributions',
    color: '#3b82f6',
    question: "What happens when we take many samples?",
    preview: "Sampling distribution simulator"
  },
  {
    id: 'central-limit-theorem',
    title: '4.4 Central Limit Theorem',
    subtitle: "Statistics' most important result",
    description: 'Experience the magic of the CLT: how sample means become normally distributed regardless of the population.',
    icon: Activity,
    difficulty: 'Intermediate',
    estimatedTime: '30 min',
    prerequisites: ['sampling-distributions'],
    learningGoals: [
      'Understand the CLT statement',
      'See CLT in action with simulations',
      'Apply CLT to real problems',
      'Grasp its fundamental importance'
    ],
    route: '/chapter4/central-limit-theorem',
    color: '#3b82f6',
    question: "Why is the normal distribution everywhere?",
    preview: "CLT interactive demonstration"
  },
  {
    id: 'sampling-distributions-reprise',
    title: '4.5 Advanced Sampling Distributions',
    subtitle: 't and F distributions',
    description: 'When population parameters are unknown, meet the t-distribution and F-distribution for real-world inference.',
    icon: GitBranch,
    difficulty: 'Advanced',
    estimatedTime: '50 min',
    prerequisites: ['central-limit-theorem'],
    learningGoals: [
      'Master the t-distribution',
      'Understand the F-distribution',
      'Apply to hypothesis testing',
      'Compare different distributions'
    ],
    route: '/chapter4/sampling-distributions-reprise',
    color: '#dc2626',
    question: "What if we don't know the population variance?",
    preview: "t and F distribution explorers"
  }
];

export default function DescriptiveStatisticsHub() {
  const router = useRouter();

  const handleSectionClick = (section) => {
    if (section?.route) {
      router.push(section.route);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Chapter 4: Descriptive Statistics & Sampling Distributions
          </h1>
          <p className="text-xl text-gray-400">
            Transform raw data into meaningful insights and discover the foundations of inference
          </p>
        </motion.div>

        {/* Key Concepts Card */}
        <KeyConceptsCard />

        {/* Population to Distribution Animation */}
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

        {/* Introduction Card */}
        <Card className="mb-8 p-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-700/50">
          <h2 className="text-2xl font-bold text-white mb-3">From Data to Understanding</h2>
          <p className="text-gray-300">
            Descriptive statistics are the foundation of all data analysis. In this chapter, 
            you'll master the tools to summarize, visualize, and understand data. Then discover 
            how sampling distributions bridge the gap between samples and populations, 
            culminating in the profound Central Limit Theorem.
          </p>
        </Card>

        {/* Chapter Hub */}
        <ChapterHub
          chapterNumber={4}
          chapterTitle="Descriptive Statistics"
          chapterSubtitle="Master data analysis fundamentals"
          sections={CHAPTER_4_SECTIONS}
          storageKey="descriptiveStatsProgress"
          progressVariant="purple"
          onSectionClick={handleSectionClick}
          hideHeader={true}
        />
      </div>
    </div>
  );
}