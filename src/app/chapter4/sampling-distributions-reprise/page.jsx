'use client';

import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, CheckCircle, Lock, ChevronRight, 
  BarChart3, Calculator, Percent, Sparkles,
  BookOpen, Compass, Trophy, Beaker
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { VisualizationContainer, VisualizationSection } from '@/components/ui/VisualizationContainer';
import BackToHub from '@/components/ui/BackToHub';
import { cn } from '@/lib/utils';
import { typography, colors } from '@/lib/design-system';

// Lazy load all components
const TDistributionExplorer = lazy(() => import('@/components/04-descriptive-statistics-sampling/4-4-central-limit-theorem/4-4-1-TDistributionExplorer'));
const FDistributionIntuitiveIntro = lazy(() => import('@/components/04-descriptive-statistics-sampling/4-5-advanced-sampling/4-5-1-FDistributionIntuitiveIntro'));
const FDistributionExplorer = lazy(() => import('@/components/04-descriptive-statistics-sampling/4-5-advanced-sampling/4-5-1-FDistributionExplorer'));
const FDistributionInteractiveJourney = lazy(() => import('@/components/04-descriptive-statistics-sampling/4-5-advanced-sampling/4-5-2-FDistributionInteractiveJourney'));
const FDistributionWorkedExample = lazy(() => import('@/components/04-descriptive-statistics-sampling/4-5-advanced-sampling/4-5-2-FDistributionWorkedExample'));
const FDistributionMasterclass = lazy(() => import('@/components/04-descriptive-statistics-sampling/4-5-advanced-sampling/4-5-3-FDistributionMasterclass'));
const FDistributionMastery = lazy(() => import('@/components/04-descriptive-statistics-sampling/4-5-advanced-sampling/4-5-3-FDistributionMastery'));
const FDistributionJourney = lazy(() => import('@/components/04-descriptive-statistics-sampling/4-5-advanced-sampling/4-5-4-FDistributionJourney'));

// Topic Navigator Component
const TopicNavigator = ({ topics, current, onChange, progress }) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {Object.entries(topics).map(([key, label]) => {
        const isCurrent = current === key;
        const progressValue = progress[key] || 0;
        
        return (
          <Button
            key={key}
            variant={isCurrent ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(key)}
            className={cn(
              "relative transition-all duration-300",
              isCurrent && "ring-2 ring-primary ring-offset-2"
            )}
          >
            <div className="flex items-center gap-2">
              <span>{label}</span>
              {progressValue > 0 && (
                <div className="w-12 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ width: `${progressValue * 100}%` }}
                  />
                </div>
              )}
            </div>
          </Button>
        );
      })}
    </div>
  );
};

// Path Selector for F-Distribution
const PathSelector = ({ paths, current, onChange }) => {
  const pathIcons = {
    intuitive: <Compass className="w-5 h-5" />,
    journey: <BookOpen className="w-5 h-5" />,
    mastery: <Trophy className="w-5 h-5" />
  };

  return (
    <div className="mb-8">
      <h3 className={cn(typography.h3, "text-center mb-4")}>Choose Your Learning Path</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(paths).map(([key, path]) => (
          <Card 
            key={key}
            className={cn(
              "cursor-pointer transition-all duration-300",
              current === key ? "ring-2 ring-primary" : "hover:shadow-lg"
            )}
            onClick={() => onChange(key)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                {pathIcons[key]}
                <h4 className="font-semibold">{path.name}</h4>
              </div>
              <p className="text-sm text-gray-400 mb-3">{path.description}</p>
              <div className="text-xs text-gray-500">
                {path.components.length} components • ~{path.duration} min
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Mastery Dashboard Component
const MasteryDashboard = ({ progress, onViewDetails }) => {
  const totalProgress = Object.values(progress).reduce((sum, val) => sum + val, 0) / Object.keys(progress).length;
  
  return (
    <Card className="mt-8">
      <CardContent className="p-6">
        <h3 className={cn(typography.h3, "mb-4")}>Your Progress</h3>
        <div className="space-y-3">
          {Object.entries(progress).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                    style={{ width: `${value * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{Math.round(value * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Overall Mastery</span>
            <span className="text-lg font-bold text-green-400">{Math.round(totalProgress * 100)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Page Component
export default function SamplingDistributionsReprisePage() {
  const contentRef = useRef(null);
  const [currentTopic, setCurrentTopic] = useState('overview');
  const [distributionFocus, setDistributionFocus] = useState(null);
  const [fDistributionPath, setFDistributionPath] = useState('intuitive');
  const [currentFComponent, setCurrentFComponent] = useState(0);
  const [masteryProgress, setMasteryProgress] = useState({
    variance: 0,
    tDistribution: 0,
    fDistribution: 0,
    comparison: 0,
    applications: 0
  });

  const topics = {
    overview: 'When σ is Unknown',
    variance: 'Sample Variance S²',
    tDistribution: 't-Distribution',
    fDistribution: 'F-Distribution',
    comparison: 'Comparing Distributions',
    applications: 'Real-World Applications'
  };

  const fDistributionPaths = {
    intuitive: {
      name: 'Intuitive Path',
      description: 'Visual introduction to F-distribution concepts',
      duration: 15,
      components: [
        { component: FDistributionIntuitiveIntro, duration: 5 },
        { component: FDistributionExplorer, duration: 10 }
      ]
    },
    journey: {
      name: 'Guided Journey',
      description: 'Step-by-step exploration with worked examples',
      duration: 25,
      components: [
        { component: FDistributionInteractiveJourney, duration: 10 },
        { component: FDistributionJourney, duration: 10 },
        { component: FDistributionWorkedExample, duration: 5 }
      ]
    },
    mastery: {
      name: 'Mastery Path',
      description: 'Advanced concepts and comprehensive practice',
      duration: 25,
      components: [
        { component: FDistributionMasterclass, duration: 15 },
        { component: FDistributionMastery, duration: 10 }
      ]
    }
  };

  // Update progress when topic changes
  useEffect(() => {
    if (currentTopic !== 'overview' && masteryProgress[currentTopic] < 0.1) {
      setMasteryProgress(prev => ({
        ...prev,
        [currentTopic]: 0.1
      }));
    }
  }, [currentTopic]);

  // LaTeX rendering effect
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
  }, [currentTopic, currentFComponent]);

  const renderOverviewSection = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-8">
          <h2 className={cn(typography.h2, "mb-6")}>The Real-World Challenge</h2>
          <p className={cn(typography.body, "mb-6")}>
            In practice, we rarely know the population standard deviation σ. This changes everything about how we make inferences.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-blue-900/20 border-blue-600/30">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">What We Learned (σ known)</h3>
                <div 
                  className="text-center p-4 bg-gray-900/50 rounded"
                  dangerouslySetInnerHTML={{ 
                    __html: `\\[Z = \\frac{\\bar{X} - \\mu}{\\sigma/\\sqrt{n}} \\sim N(0,1)\\]` 
                  }}
                />
                <p className="text-sm text-gray-400 mt-3">
                  When σ is known, the standardized sample mean follows a standard normal distribution
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-900/20 border-purple-600/30">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">What We Need (σ unknown)</h3>
                <div 
                  className="text-center p-4 bg-gray-900/50 rounded"
                  dangerouslySetInnerHTML={{ 
                    __html: `\\[T = \\frac{\\bar{X} - \\mu}{S/\\sqrt{n}} \\sim t(n-1)\\]` 
                  }}
                />
                <p className="text-sm text-gray-400 mt-3">
                  When we use the sample standard deviation S, we get a t-distribution
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-8">
          <h3 className={cn(typography.h3, "mb-6")}>New Distributions for Unknown Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-gradient-to-br from-teal-900/20 to-teal-800/10 rounded-lg border border-teal-600/30"
            >
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="w-6 h-6 text-teal-400" />
                <h4 className="text-lg font-semibold">t-Distribution</h4>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                For one sample with unknown σ
              </p>
              <ul className="text-sm space-y-1 text-gray-300">
                <li>• Heavier tails than normal</li>
                <li>• Approaches normal as n → ∞</li>
                <li>• Degrees of freedom: n - 1</li>
              </ul>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-gradient-to-br from-orange-900/20 to-orange-800/10 rounded-lg border border-orange-600/30"
            >
              <div className="flex items-center gap-3 mb-3">
                <Percent className="w-6 h-6 text-orange-400" />
                <h4 className="text-lg font-semibold">F-Distribution</h4>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                For comparing two variances
              </p>
              <ul className="text-sm space-y-1 text-gray-300">
                <li>• Ratio of two chi-squared variables</li>
                <li>• Always positive and right-skewed</li>
                <li>• Two degrees of freedom parameters</li>
              </ul>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderVarianceSection = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-8">
          <h2 className={cn(typography.h2, "mb-6")}>Understanding Sample Variance</h2>
          
          <div className="mb-8">
            <h3 className={cn(typography.h3, "mb-4")}>The Formula</h3>
            <div 
              className="text-center p-6 bg-gray-900/50 rounded-lg"
              dangerouslySetInnerHTML={{ 
                __html: `\\[S^2 = \\frac{1}{n-1}\\sum_{i=1}^{n}(X_i - \\bar{X})^2\\]` 
              }}
            />
          </div>

          <VisualizationSection title="Interactive Variance Calculator">
            <SampleVarianceCalculator />
          </VisualizationSection>

          <Card className="mt-6 bg-yellow-900/20 border-yellow-600/30">
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold mb-3">Why divide by n-1?</h4>
              <p className={typography.body}>
                This is called Bessel's correction. When we use the sample mean \(\\bar{X}\) instead of the true population mean μ, 
                we "use up" one degree of freedom, making our estimate of variance slightly biased if we divide by n.
              </p>
              <div className="mt-4 p-4 bg-gray-900/50 rounded">
                <p className="text-sm">
                  <strong>Intuition:</strong> The sample values are "closer" to their own mean than to the population mean, 
                  so dividing by n would underestimate the true variance.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold mb-3">Connection to χ² Distribution</h4>
              <div 
                className="text-center p-4 bg-gray-900/50 rounded"
                dangerouslySetInnerHTML={{ 
                  __html: `\\[\\frac{(n-1)S^2}{\\sigma^2} \\sim \\chi^2(n-1)\\]` 
                }}
              />
              <p className="text-sm text-gray-400 mt-3">
                This relationship is crucial for understanding both t and F distributions!
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );

  const renderTDistributionSection = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-8">
          <h2 className={cn(typography.h2, "mb-6")}>The t-Distribution</h2>
          
          <div className="mb-6">
            <p className={typography.body}>
              When the population standard deviation is unknown, we use the t-distribution for inference about the mean.
              It accounts for the extra uncertainty from estimating σ with the sample standard deviation S.
            </p>
          </div>

          <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading t-Distribution Explorer...</div>}>
            <TDistributionExplorer />
          </Suspense>

          <VisualizationSection title="Key Properties" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Mathematical Definition</h4>
                  <p className="text-sm text-gray-400 mb-3">
                    If Z ~ N(0,1) and V ~ χ²(ν) are independent:
                  </p>
                  <div 
                    className="text-center p-3 bg-gray-900/50 rounded"
                    dangerouslySetInnerHTML={{ 
                      __html: `\\[T = \\frac{Z}{\\sqrt{V/\\nu}} \\sim t(\\nu)\\]` 
                    }}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Statistical Properties</h4>
                  <ul className="text-sm space-y-2">
                    <li>• <strong>Mean:</strong> E[T] = 0 (for ν &gt; 1)</li>
                    <li>• <strong>Variance:</strong> Var[T] = ν/(ν-2) (for ν &gt; 2)</li>
                    <li>• <strong>Symmetry:</strong> Symmetric around 0</li>
                    <li>• <strong>Tails:</strong> Heavier than normal</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </VisualizationSection>
        </CardContent>
      </Card>
    </div>
  );

  const renderFDistributionSection = () => {
    const currentPath = fDistributionPaths[fDistributionPath];
    const CurrentComponent = currentPath.components[currentFComponent].component;

    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8">
            <h2 className={cn(typography.h2, "mb-6")}>The F-Distribution</h2>
            <p className={typography.body}>
              The F-distribution is used to compare two variances and is fundamental in ANOVA and regression analysis.
            </p>
          </CardContent>
        </Card>

        <PathSelector 
          paths={fDistributionPaths}
          current={fDistributionPath}
          onChange={(path) => {
            setFDistributionPath(path);
            setCurrentFComponent(0);
          }}
        />

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              Component {currentFComponent + 1} of {currentPath.components.length}
            </span>
            <div className="w-32 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${((currentFComponent + 1) / currentPath.components.length) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentFComponent(Math.max(0, currentFComponent - 1))}
              disabled={currentFComponent === 0}
            >
              Previous
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (currentFComponent < currentPath.components.length - 1) {
                  setCurrentFComponent(currentFComponent + 1);
                } else {
                  // Mark path as complete
                  setMasteryProgress(prev => ({
                    ...prev,
                    fDistribution: Math.max(prev.fDistribution, 
                      (Object.keys(fDistributionPaths).indexOf(fDistributionPath) + 1) / 3)
                  }));
                }
              }}
            >
              {currentFComponent < currentPath.components.length - 1 ? 'Next' : 'Complete Path'}
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${fDistributionPath}-${currentFComponent}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading F-Distribution Component...</div>}>
              <CurrentComponent />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };

  const renderComparisonSection = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-8">
          <h2 className={cn(typography.h2, "mb-6")}>Choosing the Right Distribution</h2>
          
          <VisualizationSection title="Decision Tree">
            <DistributionDecisionTree />
          </VisualizationSection>

          <VisualizationSection title="Distribution Comparison" className="mt-8">
            <DistributionComparisonTool />
          </VisualizationSection>
        </CardContent>
      </Card>
    </div>
  );

  const renderApplicationsSection = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-8">
          <h2 className={cn(typography.h2, "mb-6")}>Real-World Applications</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ApplicationCard 
              title="Quality Control"
              description="Testing if machine variance has increased"
              distribution="F-Distribution"
              icon={<Beaker className="w-6 h-6" />}
            />
            <ApplicationCard 
              title="Clinical Trial"
              description="Comparing treatment means with small samples"
              distribution="t-Distribution"
              icon={<TrendingUp className="w-6 h-6" />}
            />
            <ApplicationCard 
              title="Educational Testing"
              description="Comparing variances between teaching methods"
              distribution="F-Distribution"
              icon={<BookOpen className="w-6 h-6" />}
            />
          </div>

          <VisualizationSection title="Interactive Problem Solver" className="mt-8">
            <ProblemSolver />
          </VisualizationSection>
        </CardContent>
      </Card>
    </div>
  );

  const renderCurrentTopic = () => {
    switch (currentTopic) {
      case 'overview':
        return renderOverviewSection();
      case 'variance':
        return renderVarianceSection();
      case 'tDistribution':
        return renderTDistributionSection();
      case 'fDistribution':
        return renderFDistributionSection();
      case 'comparison':
        return renderComparisonSection();
      case 'applications':
        return renderApplicationsSection();
      default:
        return renderOverviewSection();
    }
  };

  return (
    <VisualizationContainer className="max-w-6xl mx-auto">
      <BackToHub chapter={4} />
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Advanced Sampling Distributions</h1>
        <p className="text-lg text-gray-400">When population parameters are unknown</p>
      </div>
      
      <TopicNavigator 
        topics={topics}
        current={currentTopic}
        onChange={setCurrentTopic}
        progress={masteryProgress}
      />
      
      <div ref={contentRef}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTopic}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {renderCurrentTopic()}
          </motion.div>
        </AnimatePresence>
      </div>
      
      <MasteryDashboard 
        progress={masteryProgress}
        onViewDetails={() => console.log('View details')}
      />
    </VisualizationContainer>
  );
}

// Helper Components (to be implemented)
const SampleVarianceCalculator = () => {
  const [data, setData] = useState([5, 7, 9, 11, 13]);
  const mean = data.reduce((sum, x) => sum + x, 0) / data.length;
  const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (data.length - 1);
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">Sample Data</h4>
            <div className="space-y-2">
              {data.map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">X{index + 1}:</span>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => {
                      const newData = [...data];
                      newData[index] = parseFloat(e.target.value) || 0;
                      setData(newData);
                    }}
                    className="w-20 px-2 py-1 bg-gray-800 rounded border border-gray-700"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Calculations</h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-400">Sample Mean:</span>
                <div className="text-lg font-mono">{mean.toFixed(3)}</div>
              </div>
              <div>
                <span className="text-sm text-gray-400">Sample Variance (S²):</span>
                <div className="text-lg font-mono">{variance.toFixed(3)}</div>
              </div>
              <div>
                <span className="text-sm text-gray-400">Sample Std Dev (S):</span>
                <div className="text-lg font-mono">{Math.sqrt(variance).toFixed(3)}</div>
              </div>
              <div>
                <span className="text-sm text-gray-400">Degrees of Freedom:</span>
                <div className="text-lg font-mono">{data.length - 1}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const DistributionDecisionTree = () => {
  const [path, setPath] = useState([]);
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h4 className="font-semibold mb-2">What are you testing?</h4>
            <div className="flex justify-center gap-4 mt-4">
              <Button
                variant={path[0] === 'mean' ? 'default' : 'outline'}
                onClick={() => setPath(['mean'])}
              >
                Sample Mean
              </Button>
              <Button
                variant={path[0] === 'variance' ? 'default' : 'outline'}
                onClick={() => setPath(['variance'])}
              >
                Variance(s)
              </Button>
            </div>
          </div>
          
          {path[0] === 'mean' && (
            <div className="text-center mt-6">
              <h4 className="font-semibold mb-2">Is σ known?</h4>
              <div className="flex justify-center gap-4 mt-4">
                <Button
                  variant={path[1] === 'known' ? 'default' : 'outline'}
                  onClick={() => setPath(['mean', 'known'])}
                >
                  Yes, σ is known
                </Button>
                <Button
                  variant={path[1] === 'unknown' ? 'default' : 'outline'}
                  onClick={() => setPath(['mean', 'unknown'])}
                >
                  No, σ is unknown
                </Button>
              </div>
            </div>
          )}
          
          {path.length > 1 && (
            <Card className="mt-6 bg-green-900/20 border-green-600/30">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Recommendation:</h4>
                {path[0] === 'mean' && path[1] === 'known' && (
                  <div>Use Z ~ N(0,1) distribution</div>
                )}
                {path[0] === 'mean' && path[1] === 'unknown' && (
                  <div>Use t ~ t(n-1) distribution</div>
                )}
                {path[0] === 'variance' && (
                  <div>Use F ~ F(ν₁, ν₂) distribution for comparing two variances</div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const DistributionComparisonTool = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-center text-gray-400">
          Interactive distribution comparison tool - visualizes Z, t, and F distributions side by side
        </p>
      </CardContent>
    </Card>
  );
};

const ApplicationCard = ({ title, description, distribution, icon }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-3">
          {icon}
          <h4 className="font-semibold">{title}</h4>
        </div>
        <p className="text-sm text-gray-400 mb-3">{description}</p>
        <div className="text-xs bg-blue-900/20 text-blue-300 px-2 py-1 rounded inline-block">
          {distribution}
        </div>
      </CardContent>
    </Card>
  );
};

const ProblemSolver = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-center text-gray-400">
          Interactive problem solver - step-by-step solutions for real-world scenarios
        </p>
      </CardContent>
    </Card>
  );
};