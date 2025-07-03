'use client';

import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Award, Sparkles, TrendingUp, CheckCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { VisualizationContainer } from '@/components/ui/VisualizationContainer';
import { cn } from '@/lib/utils';

// Lazy load components for better performance
const CLTGateway = lazy(() => import('@/components/04-descriptive-statistics-sampling/4-3-sampling-distributions-new/4-3-3-CLTGateway'));
const CLTPropertiesMerged = lazy(() => import('@/components/04-descriptive-statistics-sampling/4-3-sampling-distributions-new/4-3-2-CLTProperties-merged'));

// Back to Hub button component - matches Chapter 6 style
const BackToHub = ({ chapter = 4 }) => (
  <div className="text-center mb-8">
    <Link href={`/chapter${chapter}`} className="text-gray-400 hover:text-gray-300 underline">
      Back to Chapter {chapter} Hub
    </Link>
  </div>
);

// Stage Navigator Component
const StageNavigator = ({ stages, current, onNavigate, locked }) => {
  return (
    <div className="flex justify-center space-x-2 mb-6">
      {Object.entries(stages).map(([key, label], index) => {
        const isLocked = locked.includes(key);
        const isCurrent = current === key;
        const isCompleted = Object.keys(stages).indexOf(key) < Object.keys(stages).indexOf(current);
        
        return (
          <Button
            key={key}
            variant={isCurrent ? "default" : "outline"}
            size="sm"
            onClick={() => !isLocked && onNavigate(key)}
            disabled={isLocked}
            className={cn(
              "relative transition-all duration-300",
              isCurrent && "ring-2 ring-primary ring-offset-2",
              isCompleted && "border-green-500"
            )}
          >
            {isLocked && <Lock className="w-3 h-3 mr-1" />}
            {isCompleted && <CheckCircle className="w-3 h-3 mr-1 text-green-500" />}
            {label}
          </Button>
        );
      })}
    </div>
  );
};

// Understanding Tracker Component
const UnderstandingTracker = ({ concepts, onConceptMastered }) => {
  const totalConcepts = Object.keys(concepts).length;
  const masteredConcepts = Object.values(concepts).filter(Boolean).length;
  const progress = (masteredConcepts / totalConcepts) * 100;
  
  return (
    <Card className="mt-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Understanding Progress</span>
          <span className="text-sm text-muted-foreground">{masteredConcepts}/{totalConcepts} concepts</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <motion.div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full shadow-lg"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>
        <div className="mt-3 space-y-1">
          {Object.entries(concepts).map(([key, mastered]) => (
            <div key={key} className="flex items-center text-sm">
              <CheckCircle 
                className={cn(
                  "w-4 h-4 mr-2",
                  mastered ? "text-green-500" : "text-gray-400"
                )}
              />
              <span className={cn(mastered && "text-green-600 font-medium")}>
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Page Component
export default function CentralLimitTheoremPage() {
  const [stage, setStage] = useState('gateway');
  const [understanding, setUnderstanding] = useState({
    concept: false,
    mathematical: false,
    practical: false,
    conditions: false
  });
  
  const stages = {
    gateway: 'The Magic Revealed',
    properties: 'Deep Dive into CLT',
    applications: 'Real-World Power',
    mastery: 'Test Your Understanding'
  };
  
  // Determine locked stages based on understanding
  const getLockedStages = (understanding) => {
    const locked = [];
    if (!understanding.concept) {
      locked.push('properties', 'applications', 'mastery');
    } else if (!understanding.mathematical) {
      locked.push('applications', 'mastery');
    } else if (!understanding.practical) {
      locked.push('mastery');
    }
    return locked;
  };
  
  // Handle concept mastery
  const handleConceptMastery = (concept) => {
    setUnderstanding(prev => ({
      ...prev,
      [concept]: true
    }));
    
    // Auto-advance to next stage when appropriate
    if (concept === 'concept' && stage === 'gateway') {
      setTimeout(() => setStage('properties'), 1500);
    } else if (concept === 'mathematical' && stage === 'properties') {
      setTimeout(() => setStage('applications'), 1500);
    }
  };
  
  // Save progress to localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('clt-understanding');
    if (savedProgress) {
      setUnderstanding(JSON.parse(savedProgress));
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('clt-understanding', JSON.stringify(understanding));
  }, [understanding]);
  
  // Render current stage
  const renderStage = () => {
    const stageVariants = {
      enter: { opacity: 0, y: 30, scale: 0.95 },
      center: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -30, scale: 0.95 }
    };
    
    switch (stage) {
      case 'gateway':
        return (
          <motion.div
            key="gateway"
            variants={stageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Suspense fallback={<div className="flex justify-center p-8">Loading...</div>}>
              <StageOne onConceptGrasped={() => handleConceptMastery('concept')} />
            </Suspense>
          </motion.div>
        );
        
      case 'properties':
        return (
          <motion.div
            key="properties"
            variants={stageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Suspense fallback={<div className="flex justify-center p-8">Loading...</div>}>
              <StageTwo 
                onConceptGrasped={() => handleConceptMastery('mathematical')}
                onConditionsGrasped={() => handleConceptMastery('conditions')}
              />
            </Suspense>
          </motion.div>
        );
        
      case 'applications':
        return (
          <motion.div
            key="applications"
            variants={stageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <StageThree onConceptGrasped={() => handleConceptMastery('practical')} />
          </motion.div>
        );
        
      case 'mastery':
        return (
          <motion.div
            key="mastery"
            variants={stageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <StageFour understanding={understanding} />
          </motion.div>
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">The Central Limit Theorem</h1>
          <p className="text-lg text-gray-400">Statistics' Most Powerful Result</p>
          <BackToHub chapter={4} />
        </div>
      
      <StageNavigator 
        stages={stages}
        current={stage}
        onNavigate={setStage}
        locked={getLockedStages(understanding)}
      />
      
      <VisualizationContainer>
        <AnimatePresence mode="wait">
          {renderStage()}
        </AnimatePresence>
      </VisualizationContainer>
      
        <UnderstandingTracker 
          concepts={understanding}
          onConceptMastered={handleConceptMastery}
        />
      </div>
    </div>
  );
}

// Stage 1: Gateway to CLT
const StageOne = ({ onConceptGrasped }) => {
  const [revelation, setRevelation] = useState(false);
  const contentRef = useRef(null);
  
  // MathJax processing
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== 'undefined' && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [revelation]);
  
  return (
    <div className="gateway-container" ref={contentRef}>
      {!revelation ? (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-2xl font-bold mb-4">A Puzzle...</h2>
            <p className="text-lg mb-3">Why do so many things in nature follow a bell curve?</p>
            <p className="text-muted-foreground mb-6">
              Heights, test scores, measurement errors... they all seem to follow the same pattern.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg"
                onClick={() => setRevelation(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
              >
                Discover the Answer
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            duration: 1.2, 
            ease: [0.25, 0.46, 0.45, 0.94],
            staggerChildren: 0.2
          }}
        >
          {/* CLT Gateway Component */}
          <div className="mb-6">
            <CLTGateway />
          </div>
          
          {/* The theorem statement */}
          <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Award className="w-6 h-6 mr-2 text-yellow-500" />
                The Central Limit Theorem
              </h3>
              <p className="mb-3">For ANY population with mean μ and finite variance σ²:</p>
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-blue-200 dark:border-blue-800 my-4">
                <div dangerouslySetInnerHTML={{ 
                  __html: `\\[\\frac{\\bar{X} - \\mu}{\\sigma/\\sqrt{n}} \\xrightarrow{d} N(0,1) \\text{ as } n \\to \\infty\\]` 
                }} />
              </div>
              <p className="text-green-600 dark:text-green-400 font-semibold">
                In practice: For n ≥ 30, the sampling distribution is approximately normal!
              </p>
              
              <Button 
                className="mt-4"
                onClick={onConceptGrasped}
                variant="default"
              >
                I understand the magic!
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

// Stage 2: CLT Properties Deep Dive
const StageTwo = ({ onConceptGrasped, onConditionsGrasped }) => {
  const [focusProperty, setFocusProperty] = useState('convergence');
  
  const properties = {
    convergence: 'Speed of Convergence',
    conditions: 'When CLT Applies',
    standardization: 'Standardization Process',
    approximation: 'Quality of Approximation'
  };
  
  return (
    <div className="properties-container">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Deep Dive into CLT Properties</h2>
        <p className="text-muted-foreground">Explore different aspects of the Central Limit Theorem</p>
      </div>
      
      {/* Property selector */}
      <div className="flex justify-center space-x-2 mb-6">
        {Object.entries(properties).map(([key, label]) => (
          <Button
            key={key}
            variant={focusProperty === key ? "default" : "outline"}
            size="sm"
            onClick={() => setFocusProperty(key)}
          >
            {label}
          </Button>
        ))}
      </div>
      
      {/* Main CLT Properties Component */}
      <CLTPropertiesMerged />
      
      {/* Action buttons based on property */}
      <div className="mt-6 flex justify-center space-x-4">
        {focusProperty === 'convergence' && (
          <Button onClick={onConceptGrasped}>
            <TrendingUp className="w-4 h-4 mr-2" />
            I understand convergence!
          </Button>
        )}
        {focusProperty === 'conditions' && (
          <Button onClick={onConditionsGrasped}>
            <CheckCircle className="w-4 h-4 mr-2" />
            I understand the conditions!
          </Button>
        )}
      </div>
    </div>
  );
};

// Stage 3: Real-World Applications
const StageThree = ({ onConceptGrasped }) => {
  const [scenario, setScenario] = useState('polling');
  const contentRef = useRef(null);
  
  const scenarios = {
    polling: 'Political Polling',
    quality: 'Quality Control',
    finance: 'Portfolio Returns',
    medical: 'Clinical Trials'
  };
  
  // MathJax processing
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== 'undefined' && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [scenario]);
  
  return (
    <div className="applications-container" ref={contentRef}>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2">CLT in Action</h2>
        <p className="text-muted-foreground">See how the Central Limit Theorem powers real-world decisions</p>
      </div>
      
      {/* Scenario selector */}
      <div className="flex justify-center space-x-2 mb-6">
        {Object.entries(scenarios).map(([key, label]) => (
          <Button
            key={key}
            variant={scenario === key ? "default" : "outline"}
            size="sm"
            onClick={() => setScenario(key)}
          >
            {label}
          </Button>
        ))}
      </div>
      
      {/* Scenario content */}
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          {scenario === 'polling' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Political Polling</h3>
              <p className="mb-4">How can 1,000 people represent 330 million Americans?</p>
              
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mb-4">
                <p className="font-semibold mb-2">The CLT Answer:</p>
                <p className="mb-3">Sample proportions are approximately normal:</p>
                <div dangerouslySetInnerHTML={{ 
                  __html: `\\[\\hat{p} \\sim N\\left(p, \\frac{p(1-p)}{n}\\right)\\]` 
                }} />
                <p className="mt-3">With n=1,000 and p≈0.5:</p>
                <p className="font-mono">Margin of error = 1.96 × √(0.5×0.5/1000) ≈ 3.1%</p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <p className="text-green-700 dark:text-green-300">
                  <strong>Key Insight:</strong> CLT guarantees that our sample proportion will be within 
                  3.1% of the true population proportion 95% of the time!
                </p>
              </div>
            </div>
          )}
          
          {scenario === 'quality' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Manufacturing Quality Control</h3>
              <p className="mb-4">Detecting process changes using sample means</p>
              
              <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg mb-4">
                <p className="font-semibold mb-2">Control Chart Setup:</p>
                <p className="mb-2">Process: Mean = 100mm, SD = 2mm</p>
                <p className="mb-2">Sample size: n = 25 parts every hour</p>
                <p className="mb-3">By CLT:</p>
                <div dangerouslySetInnerHTML={{ 
                  __html: `\\[\\bar{X} \\sim N\\left(100, \\frac{2^2}{25}\\right) = N(100, 0.16)\\]` 
                }} />
                <p className="mt-3">Control limits (3σ): 100 ± 3(0.4) = [98.8, 101.2]</p>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
                <p className="text-orange-700 dark:text-orange-300">
                  <strong>Power of CLT:</strong> Any sample mean outside [98.8, 101.2] signals 
                  a process problem with 99.7% confidence!
                </p>
              </div>
            </div>
          )}
          
          {scenario === 'finance' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Portfolio Returns</h3>
              <p className="mb-4">Why diversification works: CLT in finance</p>
              
              <div className="bg-indigo-50 dark:bg-indigo-950 p-4 rounded-lg mb-4">
                <p className="font-semibold mb-2">Portfolio of n stocks:</p>
                <p className="mb-2">Each stock: Mean return = 8%, SD = 20%</p>
                <p className="mb-3">Portfolio average return:</p>
                <div dangerouslySetInnerHTML={{ 
                  __html: `\\[\\text{SE}(\\bar{R}) = \\frac{20\\%}{\\sqrt{n}}\\]` 
                }} />
                <ul className="mt-3 space-y-1">
                  <li>n = 1: SE = 20% (very risky!)</li>
                  <li>n = 25: SE = 4% (much safer)</li>
                  <li>n = 100: SE = 2% (institutional level)</li>
                </ul>
              </div>
              
              <div className="bg-teal-50 dark:bg-teal-950 p-4 rounded-lg">
                <p className="text-teal-700 dark:text-teal-300">
                  <strong>CLT Magic:</strong> Diversification reduces risk by √n, turning volatile 
                  individual stocks into stable portfolios!
                </p>
              </div>
            </div>
          )}
          
          {scenario === 'medical' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Clinical Trials</h3>
              <p className="mb-4">Testing drug effectiveness with limited samples</p>
              
              <div className="bg-pink-50 dark:bg-pink-950 p-4 rounded-lg mb-4">
                <p className="font-semibold mb-2">Drug trial scenario:</p>
                <p className="mb-2">Treatment group: n = 200 patients</p>
                <p className="mb-2">Measuring: Average reduction in symptoms</p>
                <p className="mb-3">Even if individual responses vary wildly, CLT ensures:</p>
                <div dangerouslySetInnerHTML={{ 
                  __html: `\\[\\bar{X}_{\\text{treatment}} - \\bar{X}_{\\text{control}} \\sim \\text{Normal}\\]` 
                }} />
              </div>
              
              <div className="bg-emerald-50 dark:bg-emerald-950 p-4 rounded-lg">
                <p className="text-emerald-700 dark:text-emerald-300">
                  <strong>Clinical Power:</strong> CLT allows us to detect treatment effects 
                  even with non-normal patient responses!
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-6 text-center">
        <Button size="lg" onClick={onConceptGrasped}>
          <Sparkles className="w-4 h-4 mr-2" />
          I see the real-world power!
        </Button>
      </div>
    </div>
  );
};

// Stage 4: Mastery Check
const StageFour = ({ understanding }) => {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [score, setScore] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);
  
  const challenges = [
    {
      title: "Conceptual Understanding",
      question: "A factory produces widgets with unknown distribution, mean=50g, SD=10g. What can you say about the average weight of 36 widgets?",
      options: [
        "Nothing - we need to know the distribution",
        "It's approximately Normal(50, 10/6)",
        "It's exactly Normal(50, 10)",
        "It follows the same distribution as individual widgets"
      ],
      correct: 1,
      explanation: "By CLT, the sample mean is approximately Normal with mean=50 and SE=10/√36=10/6≈1.67"
    },
    {
      title: "Application",
      question: "A call center receives calls with mean duration 5 min, SD 3 min. For a sample of 100 calls, what's P(average > 5.5 min)?",
      options: [
        "About 5%",
        "About 16%",
        "About 50%",
        "Can't determine without the distribution"
      ],
      correct: 0,
      explanation: "SE = 3/√100 = 0.3. Z = (5.5-5)/0.3 ≈ 1.67. P(Z > 1.67) ≈ 0.047 ≈ 5%"
    },
    {
      title: "Interpretation",
      question: "Why can insurance companies predict total claims so accurately?",
      options: [
        "They have perfect information about each customer",
        "CLT: averages become predictable even if individuals aren't",
        "Insurance claims always follow normal distribution",
        "They only insure low-risk customers"
      ],
      correct: 1,
      explanation: "CLT ensures that average claims converge to a normal distribution, making totals predictable despite individual randomness"
    }
  ];
  
  const handleAnswer = (optionIndex) => {
    if (optionIndex === challenges[currentChallenge].correct) {
      setScore(score + 1);
    }
    
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge(currentChallenge + 1);
    } else {
      setShowCertificate(true);
    }
  };
  
  if (showCertificate) {
    const percentage = Math.round((score / challenges.length) * 100);
    const isPassing = percentage >= 70;
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <Award className={cn(
            "w-16 h-16 mx-auto mb-4",
            isPassing ? "text-yellow-500" : "text-gray-400"
          )} />
          <h2 className="text-2xl font-bold mb-4">
            {isPassing ? "Congratulations!" : "Good Effort!"}
          </h2>
          <p className="text-lg mb-2">
            You scored {score} out of {challenges.length} ({percentage}%)
          </p>
          <p className="text-muted-foreground mb-6">
            {isPassing 
              ? "You've mastered the Central Limit Theorem! This powerful tool will serve you well in statistics and beyond."
              : "Review the concepts and try again. The CLT is worth mastering!"}
          </p>
          <Button onClick={() => window.location.reload()}>
            {isPassing ? "Complete" : "Try Again"}
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  const challenge = challenges[currentChallenge];
  
  return (
    <div className="mastery-container max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Test Your CLT Mastery</h2>
          <span className="text-sm text-muted-foreground">
            Question {currentChallenge + 1} of {challenges.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentChallenge + 1) / challenges.length) * 100}%` }}
          />
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">{challenge.title}</h3>
          <p className="mb-6">{challenge.question}</p>
          
          <div className="space-y-3">
            {challenge.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start text-left p-4 h-auto"
                onClick={() => handleAnswer(index)}
              >
                <span className="mr-3 font-semibold">{String.fromCharCode(65 + index)}.</span>
                {option}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};