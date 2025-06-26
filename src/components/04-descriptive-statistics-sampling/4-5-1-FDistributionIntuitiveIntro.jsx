"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { VisualizationContainer, GraphContainer, VisualizationSection } from '@/components/ui/VisualizationContainer';
import { createColorScheme, cn, typography, colors } from '@/lib/design-system';
import { Button } from '@/components/ui/button';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { Factory, TrendingUp, Award, ChevronRight, AlertCircle } from "lucide-react";
import { useAnimationCleanup } from "@/hooks/useAnimationCleanup";

// Achievement notification component
const AchievementNotification = ({ achievement, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className="fixed top-4 right-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in z-50">
      <Award className="w-6 h-6" />
      <div>
        <p className="font-semibold">Achievement Unlocked!</p>
        <p className="text-sm opacity-90">{achievement}</p>
      </div>
    </div>
  );
};

// Visual variance comparison component
const VarianceVisualizer = ({ group1Variance, group2Variance, isAnimating }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const dataPointsRef = useRef([]);
  const prevVarianceRef = useRef({ group1: group1Variance, group2: group2Variance });
  
  // Box-Muller transform for generating Gaussian random numbers
  const gaussian = () => {
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };
  
  // Generate new positions for data points based on variance
  const generatePositions = (variance, centerX, centerY) => {
    const stdDev = Math.sqrt(variance);
    const positions = [];
    
    for (let i = 0; i < 40; i++) {
      // Generate value from normal distribution
      const value = gaussian() * stdDev;
      
      // Convert to polar coordinates for radial display
      const angle = (i / 40) * 2 * Math.PI + (Math.random() - 0.5) * 0.3;
      const radius = Math.abs(value) * 30; // Scale for visibility
      
      positions.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        value: value,
        angle: angle
      });
    }
    
    return positions;
  };
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth * 2;
    const height = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    
    // Initialize data points if needed
    if (dataPointsRef.current.length === 0) {
      dataPointsRef.current = [
        {
          group: 1,
          centerX: width / 4 / 2,
          centerY: height / 2 / 2,
          points: generatePositions(group1Variance, width / 4 / 2, height / 2 / 2).map(p => ({
            ...p,
            currentX: p.x,
            currentY: p.y,
            targetX: p.x,
            targetY: p.y
          }))
        },
        {
          group: 2,
          centerX: (3 * width / 4) / 2,
          centerY: height / 2 / 2,
          points: generatePositions(group2Variance, (3 * width / 4) / 2, height / 2 / 2).map(p => ({
            ...p,
            currentX: p.x,
            currentY: p.y,
            targetX: p.x,
            targetY: p.y
          }))
        }
      ];
    }
    
    // Update target positions only for changed variance
    const updateTargetPositions = () => {
      // Check which variance changed
      if (prevVarianceRef.current.group1 !== group1Variance) {
        const group1Positions = generatePositions(group1Variance, width / 4 / 2, height / 2 / 2);
        dataPointsRef.current[0].points.forEach((point, i) => {
          point.targetX = group1Positions[i].x;
          point.targetY = group1Positions[i].y;
          point.value = group1Positions[i].value;
        });
        prevVarianceRef.current.group1 = group1Variance;
      }
      
      if (prevVarianceRef.current.group2 !== group2Variance) {
        const group2Positions = generatePositions(group2Variance, (3 * width / 4) / 2, height / 2 / 2);
        dataPointsRef.current[1].points.forEach((point, i) => {
          point.targetX = group2Positions[i].x;
          point.targetY = group2Positions[i].y;
          point.value = group2Positions[i].value;
        });
        prevVarianceRef.current.group2 = group2Variance;
      }
    };
    
    updateTargetPositions();
    
    const animate = () => {
      // Clear canvas
      ctx.fillStyle = 'rgba(10, 10, 30, 1)';
      ctx.fillRect(0, 0, width / 2, height / 2);
      
      // Draw standard deviation guides
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      
      // Factory A guides
      const stdDev1 = Math.sqrt(group1Variance) * 30;
      ctx.beginPath();
      ctx.arc(width / 4 / 2, height / 2 / 2, stdDev1, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(width / 4 / 2, height / 2 / 2, stdDev1 * 2, 0, Math.PI * 2);
      ctx.stroke();
      
      // Factory B guides
      const stdDev2 = Math.sqrt(group2Variance) * 30;
      ctx.beginPath();
      ctx.arc((3 * width / 4) / 2, height / 2 / 2, stdDev2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc((3 * width / 4) / 2, height / 2 / 2, stdDev2 * 2, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.setLineDash([]);
      
      // Draw center points (means)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(width / 4 / 2, height / 2 / 2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc((3 * width / 4) / 2, height / 2 / 2, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw "target" or "ideal" marker to show variance vs accuracy
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)'; // Gold color for target
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      
      // Draw crosshair for target
      const drawCrosshair = (x, y) => {
        ctx.beginPath();
        ctx.moveTo(x - 8, y);
        ctx.lineTo(x + 8, y);
        ctx.moveTo(x, y - 8);
        ctx.lineTo(x, y + 8);
        ctx.stroke();
      };
      
      drawCrosshair(width / 4 / 2, height / 2 / 2 - 5); // Slightly offset to show mean ≠ target
      drawCrosshair((3 * width / 4) / 2, height / 2 / 2 - 5);
      
      // Draw and update data points
      dataPointsRef.current.forEach((group, groupIndex) => {
        group.points.forEach(point => {
          // Smooth transition to target position
          const dx = point.targetX - point.currentX;
          const dy = point.targetY - point.currentY;
          point.currentX += dx * 0.1;
          point.currentY += dy * 0.1;
          
          // Draw data point
          const color = groupIndex === 0 ? '#22d3ee' : '#a78bfa';
          const opacity = 0.8 - (Math.abs(point.value) / 3) * 0.3; // Fade points further from mean
          
          ctx.fillStyle = color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
          ctx.beginPath();
          ctx.arc(point.currentX, point.currentY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });
      });
      
      // Draw labels
      ctx.fillStyle = '#fff';
      ctx.font = '14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Factory A', width / 4 / 2, height / 2 / 2 + 80);
      ctx.fillText('Factory B', (3 * width / 4) / 2, height / 2 / 2 + 80);
      
      // Draw variance values
      ctx.font = '12px system-ui';
      ctx.fillStyle = '#22d3ee';
      ctx.fillText(`σ² = ${group1Variance.toFixed(1)}`, width / 4 / 2, height / 2 / 2 + 95);
      ctx.fillStyle = '#a78bfa';
      ctx.fillText(`σ² = ${group2Variance.toFixed(1)}`, (3 * width / 4) / 2, height / 2 / 2 + 95);
      
      // Draw legend
      ctx.font = '10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillText('⬤ = Actual mean', 10, height / 2 - 20);
      ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
      ctx.fillText('+ = Target value', 10, height / 2 - 8);
      
      if (isAnimating) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [group1Variance, group2Variance, isAnimating]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-48 rounded-lg bg-gray-900/50"
    />
  );
};

const FDistributionIntuitiveIntro = () => {
  // Learning stages
  const stages = ['story', 'visual', 'measure', 'compare', 'formalize'];
  const [currentStage, setCurrentStage] = useState('story');
  const [stageIndex, setStageIndex] = useState(0);
  
  // Variance states
  const [factory1Variance, setFactory1Variance] = useState(1);
  const [factory2Variance, setFactory2Variance] = useState(2.5);
  const [isAnimating, setIsAnimating] = useState(true);
  
  // Sample generation
  const [samplesGenerated, setSamplesGenerated] = useState(0);
  const [fValues, setFValues] = useState([]);
  const [lastFValue, setLastFValue] = useState(null);
  
  // Achievements
  const [achievements, setAchievements] = useState([]);
  const [showAchievement, setShowAchievement] = useState(null);
  
  // Animation cleanup
  const { setCleanInterval, setCleanTimeout } = useAnimationCleanup();
  
  // Color scheme
  const colorScheme = createColorScheme('estimation');
  
  // Calculate F-value
  const currentF = useMemo(() => factory1Variance / factory2Variance, [factory1Variance, factory2Variance]);
  
  // Check for achievements
  const checkAchievements = useCallback(() => {
    const newAchievements = [];
    
    if (currentStage === 'visual' && !achievements.includes('visual-explorer')) {
      newAchievements.push({ id: 'visual-explorer', text: 'Visual Explorer - Started comparing spreads!' });
    }
    
    if (currentF > 0.9 && currentF < 1.1 && !achievements.includes('equal-variance')) {
      newAchievements.push({ id: 'equal-variance', text: 'Balance Master - Found equal variances!' });
    }
    
    if (samplesGenerated >= 10 && !achievements.includes('sample-collector')) {
      newAchievements.push({ id: 'sample-collector', text: 'Sample Collector - Generated 10 F-values!' });
    }
    
    if (currentStage === 'formalize' && !achievements.includes('statistics-scholar')) {
      newAchievements.push({ id: 'statistics-scholar', text: 'Statistics Scholar - Mastered F-distributions!' });
    }
    
    newAchievements.forEach(achievement => {
      if (!achievements.includes(achievement.id)) {
        setAchievements(prev => [...prev, achievement.id]);
        setShowAchievement(achievement.text);
      }
    });
  }, [currentStage, currentF, samplesGenerated, achievements]);
  
  useEffect(() => {
    checkAchievements();
  }, [checkAchievements]);
  
  // Generate F-statistic
  const generateFStatistic = useCallback(() => {
    // Simulate samples from populations with given variances
    const n1 = 20, n2 = 20;
    const sample1 = Array.from({ length: n1 }, () => 
      jStat.normal.sample(0, Math.sqrt(factory1Variance))
    );
    const sample2 = Array.from({ length: n2 }, () => 
      jStat.normal.sample(0, Math.sqrt(factory2Variance))
    );
    
    const s1_squared = jStat.variance(sample1, true);
    const s2_squared = jStat.variance(sample2, true);
    const f = s1_squared / s2_squared;
    
    setFValues(prev => [...prev, f]);
    setLastFValue(f);
    setSamplesGenerated(prev => prev + 1);
    
    return f;
  }, [factory1Variance, factory2Variance]);
  
  // Stage content
  const getStageContent = () => {
    switch (currentStage) {
      case 'story':
        return {
          title: "The Quality Control Challenge",
          content: (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-cyan-400">
                <Factory className="w-8 h-8" />
                <h3 className="text-xl font-semibold">Two Widget Factories</h3>
              </div>
              <p className={typography.description}>
                You're a quality control engineer overseeing two factories that produce widgets. 
                Both factories claim to produce widgets of the same average size, but you suspect 
                one might be more <span className="text-violet-400 font-semibold">consistent</span> than the other.
              </p>
              <div className="bg-gradient-to-r from-violet-900/20 to-purple-900/20 p-4 rounded-lg border border-violet-600/30">
                <p className="text-sm mb-2">
                  <strong className="text-violet-400">Why does consistency matter?</strong>
                </p>
                <ul className="text-sm space-y-1 text-gray-300">
                  <li>• More consistent = More reliable production</li>
                  <li>• Less variation = Fewer defects</li>
                  <li>• Better predictability = Easier planning</li>
                </ul>
              </div>
              <p className={cn(typography.caption, "italic")}>
                Your mission: Determine which factory has more consistent production by comparing 
                their <span className="text-cyan-400">variation</span> in widget sizes.
              </p>
            </div>
          ),
          action: "Let's See The Factories"
        };
        
      case 'visual':
        return {
          title: "Comparing Production Spread",
          content: (
            <div className="space-y-4">
              <p className={typography.description}>
                Watch how widgets from each factory spread around their target size. 
                <span className="text-violet-400 font-semibold"> More spread = Less consistent</span>
              </p>
              <VarianceVisualizer 
                group1Variance={factory1Variance}
                group2Variance={factory2Variance}
                isAnimating={isAnimating}
              />
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-cyan-400 font-semibold">
                    Factory A Consistency
                  </label>
                  <RangeSlider
                    value={3 - factory1Variance}
                    onChange={(value) => setFactory1Variance(3 - value)}
                    min={0}
                    max={2.9}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-violet-400 font-semibold">
                    Factory B Consistency
                  </label>
                  <RangeSlider
                    value={3 - factory2Variance}
                    onChange={(value) => setFactory2Variance(3 - value)}
                    min={0}
                    max={2.9}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <p className="text-sm mb-2">
                  <strong>Try this:</strong> Make both factories equally consistent. 
                  What do you notice about their spread?
                </p>
              </div>
              
              {/* Educational insights */}
              <div className="space-y-3 mt-4">
                <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 p-4 rounded-lg border border-amber-600/30">
                  <p className="text-sm mb-2">
                    <AlertCircle className="inline w-4 h-4 mr-1" />
                    <strong className="text-amber-400">Common Misconception:</strong>
                  </p>
                  <p className="text-sm text-gray-300">
                    Low variance ≠ Good quality! A factory could consistently produce widgets 
                    that are all 2mm too small. That's <span className="text-amber-400">low variance</span> but 
                    <span className="text-red-400"> poor quality</span>.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 p-4 rounded-lg border border-blue-600/30">
                  <p className="text-sm mb-2">
                    <strong className="text-blue-400">What the terms mean:</strong>
                  </p>
                  <ul className="text-sm space-y-1 text-gray-300">
                    <li>• <strong>Consistency:</strong> How similar items are to each other</li>
                    <li>• <strong>Variance (σ²):</strong> Average squared distance from the mean</li>
                    <li>• <strong>Spread:</strong> How far data points are from the center</li>
                  </ul>
                </div>
              </div>
            </div>
          ),
          action: "Measure The Spread"
        };
        
      case 'measure':
        return {
          title: "Measuring Spread with Variance",
          content: (
            <div className="space-y-4">
              <p className={typography.description}>
                To compare consistency scientifically, we measure <span className="text-violet-400 font-semibold">variance</span> - 
                the average squared distance from the center.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-cyan-900/20 p-4 rounded-lg border border-cyan-600/30">
                  <h4 className="text-cyan-400 font-semibold mb-2">Factory A</h4>
                  <p className="text-2xl font-mono font-bold">{factory1Variance.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">Variance (spread²)</p>
                </div>
                <div className="bg-violet-900/20 p-4 rounded-lg border border-violet-600/30">
                  <h4 className="text-violet-400 font-semibold mb-2">Factory B</h4>
                  <p className="text-2xl font-mono font-bold">{factory2Variance.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">Variance (spread²)</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 p-4 rounded-lg border border-blue-600/30">
                <p className="text-sm mb-2">
                  <AlertCircle className="inline w-4 h-4 mr-1" />
                  <strong>Key Insight:</strong>
                </p>
                <p className="text-sm">
                  Smaller variance = Tighter clustering = More consistent production
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-4 rounded-lg border border-purple-600/30">
                <p className="text-sm mb-2">
                  <strong className="text-purple-400">Why square the differences?</strong>
                </p>
                <p className="text-sm text-gray-300">
                  Variance squares the distances to:
                </p>
                <ul className="text-sm space-y-1 text-gray-300 mt-1">
                  <li>• Make all values positive (no cancellation)</li>
                  <li>• Penalize larger deviations more heavily</li>
                  <li>• Enable mathematical properties we need</li>
                </ul>
                <p className="text-xs text-gray-400 mt-2">
                  Note: Variance units are squared (e.g., mm²), which is why we often use 
                  standard deviation (σ = √variance) for interpretation.
                </p>
              </div>
            </div>
          ),
          action: "Compare The Variances"
        };
        
      case 'compare':
        return {
          title: "The F-Ratio: Comparing Variances",
          content: (
            <div className="space-y-4">
              <p className={typography.description}>
                To compare variances, we simply divide them. This ratio is called the 
                <span className="text-violet-400 font-semibold"> F-statistic</span>.
              </p>
              <div className="bg-gradient-to-r from-cyan-900/30 to-violet-900/30 p-6 rounded-lg border border-purple-600/30">
                <div className="flex items-center justify-center gap-4 text-2xl font-mono">
                  <div className="text-center">
                    <div className="text-cyan-400">{factory1Variance.toFixed(2)}</div>
                    <div className="text-xs text-gray-400">Factory A</div>
                  </div>
                  <div className="text-white">÷</div>
                  <div className="text-center">
                    <div className="text-violet-400">{factory2Variance.toFixed(2)}</div>
                    <div className="text-xs text-gray-400">Factory B</div>
                  </div>
                  <div className="text-white">=</div>
                  <div className="text-center">
                    <div className="text-emerald-400 text-3xl font-bold">{currentF.toFixed(2)}</div>
                    <div className="text-xs text-gray-400">F-ratio</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>What the F-ratio tells us:</strong>
                </p>
                <ul className="text-sm space-y-1 text-gray-300">
                  <li className={cn("transition-colors", currentF > 0.9 && currentF < 1.1 && "text-emerald-400 font-semibold")}>
                    • F ≈ 1: Similar consistency
                  </li>
                  <li className={cn("transition-colors", currentF > 2 && "text-orange-400 font-semibold")}>
                    • F {">"} 1: Factory A is less consistent
                  </li>
                  <li className={cn("transition-colors", currentF < 0.5 && "text-blue-400 font-semibold")}>
                    • F {"<"} 1: Factory B is less consistent
                  </li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 p-4 rounded-lg border border-green-600/30">
                <p className="text-sm mb-2">
                  <strong className="text-green-400">Real-world context:</strong>
                </p>
                <p className="text-sm text-gray-300 mb-2">
                  Whether you want high or low variance depends on the situation:
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-gray-800/50 p-2 rounded">
                    <p className="text-green-400 font-semibold mb-1">Low variance good for:</p>
                    <ul className="text-gray-300 space-y-0.5">
                      <li>• Manufacturing parts</li>
                      <li>• Drug dosages</li>
                      <li>• Flight schedules</li>
                    </ul>
                  </div>
                  <div className="bg-gray-800/50 p-2 rounded">
                    <p className="text-orange-400 font-semibold mb-1">High variance okay for:</p>
                    <ul className="text-gray-300 space-y-0.5">
                      <li>• Creative outputs</li>
                      <li>• Investment portfolios</li>
                      <li>• Natural processes</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Button 
                  onClick={generateFStatistic}
                  className="w-full"
                  variant="default"
                >
                  Generate Sample F-statistic
                </Button>
                {lastFValue && (
                  <p className="text-center text-sm mt-2 text-gray-400">
                    Last sample F-value: <span className="font-mono text-emerald-400">{lastFValue.toFixed(3)}</span>
                  </p>
                )}
              </div>
            </div>
          ),
          action: "See The Pattern"
        };
        
      case 'formalize':
        return {
          title: "The F-Distribution Pattern",
          content: (
            <div className="space-y-4">
              <p className={typography.description}>
                When we calculate many F-ratios from samples, they follow a predictable pattern 
                called the <span className="text-violet-400 font-semibold">F-distribution</span>.
              </p>
              <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 p-4 rounded-lg border border-emerald-600/30">
                <h4 className="text-emerald-400 font-semibold mb-2">🎉 Congratulations!</h4>
                <p className="text-sm">
                  You've discovered how statisticians compare variances! The F-distribution helps us 
                  determine if differences in consistency are real or just due to random chance.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold">Real-world applications:</p>
                <ul className="text-sm space-y-1 text-gray-300">
                  <li>• Quality control in manufacturing</li>
                  <li>• Comparing treatment effects in medicine</li>
                  <li>• A/B testing in product development</li>
                  <li>• Risk assessment in finance</li>
                </ul>
              </div>
              <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
                <p className="text-sm text-center">
                  <TrendingUp className="inline w-4 h-4 mr-2" />
                  Ready to explore the full F-distribution? Continue to the next component!
                </p>
              </div>
            </div>
          ),
          action: "Complete Introduction"
        };
    }
  };
  
  const content = getStageContent();
  const progress = ((stageIndex + 1) / stages.length) * 100;
  
  // Navigation
  const handleNext = () => {
    if (stageIndex < stages.length - 1) {
      setStageIndex(prev => prev + 1);
      setCurrentStage(stages[stageIndex + 1]);
    }
  };
  
  const handlePrevious = () => {
    if (stageIndex > 0) {
      setStageIndex(prev => prev - 1);
      setCurrentStage(stages[stageIndex - 1]);
    }
  };
  
  return (
    <VisualizationContainer
      title="4.5 F-Distribution Intuitive Intro"
      description="Discover how to compare consistency between groups"
    >
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-400">Learning Progress</span>
          <span className="text-gray-400">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Stage indicators */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {stages.map((stage, i) => (
          <div
            key={stage}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              i === stageIndex 
                ? "w-8 bg-violet-500" 
                : i < stageIndex 
                ? "bg-violet-700" 
                : "bg-gray-600"
            )}
          />
        ))}
      </div>
      
      {/* Main content */}
      <div className="max-w-3xl mx-auto">
        <VisualizationSection className="p-6">
          <h2 className={cn(typography.h3, "mb-4 bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent")}>
            {content.title}
          </h2>
          {content.content}
          
          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-6">
            <Button
              onClick={handlePrevious}
              disabled={stageIndex === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={stageIndex === stages.length - 1}
              variant="default"
              className="flex items-center gap-2"
            >
              {content.action}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </VisualizationSection>
        
        {/* Achievement stats */}
        {achievements.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">
              Achievements unlocked: {achievements.length}
            </p>
          </div>
        )}
      </div>
      
      {/* Achievement notification */}
      {showAchievement && (
        <AchievementNotification
          achievement={showAchievement}
          onClose={() => setShowAchievement(null)}
        />
      )}
    </VisualizationContainer>
  );
};

export { FDistributionIntuitiveIntro };