"use client";
import { useState, useEffect, useRef } from "react";
import CLTSimulation from "@/components/shared/CLTSimulation";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, Eye, Sparkles, TrendingUp, BarChart3, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WhatAreSamplingDistributionsVisualFirst() {
  const [animationStage, setAnimationStage] = useState(0);
  const [sampleCount, setSampleCount] = useState(0);
  const animationRef = useRef(null);

  // Monitor animation progress
  useEffect(() => {
    const checkProgress = setInterval(() => {
      if (animationRef.current) {
        const svgElement = animationRef.current.querySelector('svg');
        if (svgElement) {
          const bars = svgElement.querySelectorAll('.bar');
          setSampleCount(bars.length);
          
          // Update animation stage based on sample count
          if (bars.length === 0) setAnimationStage(0);
          else if (bars.length < 5) setAnimationStage(1);
          else if (bars.length < 15) setAnimationStage(2);
          else if (bars.length < 30) setAnimationStage(3);
          else setAnimationStage(4);
        }
      }
    }, 500);

    return () => clearInterval(checkProgress);
  }, []);

  return (
    <div className="w-full space-y-6">
      {/* Title with visual emphasis */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">What is a Sampling Distribution?</h1>
        <p className="text-lg text-neutral-300">Watch the pattern emerge, then we'll explain what you're seeing</p>
      </div>

      {/* Visual-First: CLT Animation takes center stage */}
      <div className="relative" ref={animationRef}>
        <CLTSimulation />
        
        {/* Contextual Annotations that appear as animation progresses */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Initial prompt */}
          {animationStage === 0 && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-neutral-900/95 p-4 rounded-lg border border-purple-500/50 max-w-sm animate-pulse">
              <div className="flex items-center gap-2 text-purple-400">
                <Eye className="w-5 h-5" />
                <span className="font-semibold">Click "Drop Samples" to begin!</span>
              </div>
              <p className="text-sm text-neutral-300 mt-1">
                Watch what happens when we repeatedly take samples...
              </p>
            </div>
          )}

          {/* First samples annotation */}
          {animationStage === 1 && (
            <div className="absolute top-1/3 right-10 bg-neutral-900/95 p-3 rounded-lg border border-yellow-500/50 max-w-xs">
              <div className="flex items-center gap-2 text-yellow-400 mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="font-semibold text-sm">First Pattern Emerging!</span>
              </div>
              <p className="text-xs text-neutral-300">
                Each bar represents how often we get a particular sample mean
              </p>
            </div>
          )}

          {/* Pattern recognition */}
          {animationStage === 2 && (
            <div className="absolute bottom-1/3 left-10 bg-neutral-900/95 p-3 rounded-lg border border-green-500/50 max-w-xs">
              <div className="flex items-center gap-2 text-green-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="font-semibold text-sm">See the Shape?</span>
              </div>
              <p className="text-xs text-neutral-300">
                Notice how the bars are forming a bell-shaped curve centered around the middle!
              </p>
            </div>
          )}

          {/* Near completion */}
          {animationStage === 3 && (
            <div className="absolute top-1/2 right-10 transform -translate-y-1/2 bg-neutral-900/95 p-3 rounded-lg border border-blue-500/50 max-w-xs">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <BarChart3 className="w-4 h-4" />
                <span className="font-semibold text-sm">Almost There!</span>
              </div>
              <p className="text-xs text-neutral-300">
                The more samples we take, the clearer the pattern becomes. This is the sampling distribution!
              </p>
            </div>
          )}

          {/* Completion celebration */}
          {animationStage === 4 && sampleCount >= 30 && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-900/95 to-blue-900/95 p-4 rounded-lg border border-purple-500/50 max-w-md">
              <div className="flex items-center gap-2 text-white mb-1">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                <span className="font-bold">The Magic of Sampling Distributions!</span>
              </div>
              <p className="text-sm text-neutral-200">
                You've just witnessed the Central Limit Theorem in action. The distribution of sample means forms a predictable pattern!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Educational content follows the visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* What You Just Saw */}
        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-400" />
              What You Just Witnessed
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-400 font-bold">1</span>
                </div>
                <div>
                  <p className="text-neutral-300">
                    <span className="font-semibold text-white">Original Distribution (Top):</span> We started with a Beta distribution - notice it's skewed, not bell-shaped.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-400 font-bold">2</span>
                </div>
                <div>
                  <p className="text-neutral-300">
                    <span className="font-semibold text-white">Sampling Process:</span> We repeatedly took samples of size n, calculated each sample's mean, and collected those means.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-400 font-bold">3</span>
                </div>
                <div>
                  <p className="text-neutral-300">
                    <span className="font-semibold text-white">The Pattern (Bottom):</span> The histogram of sample means formed a bell-shaped curve - this is the sampling distribution!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Why This Matters */}
        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Why This Matters
            </h3>
            <div className="space-y-3 text-sm text-neutral-300">
              <p>
                <span className="font-semibold text-white">Predictability from Randomness:</span> Even though individual samples vary randomly, the pattern of sample means is predictable!
              </p>
              
              <p>
                <span className="font-semibold text-white">Foundation of Inference:</span> This predictable pattern lets us make statements about populations based on samples.
              </p>
              
              <p>
                <span className="font-semibold text-white">Universal Truth:</span> This happens regardless of the original distribution's shape (as long as we take large enough samples).
              </p>
              
              <div className="mt-4 p-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-500/30">
                <p className="text-xs font-semibold text-purple-300 uppercase tracking-wide mb-1">Key Insight</p>
                <p className="text-sm text-white">
                  The sampling distribution of the mean is approximately normal, centered at the population mean, with a spread that decreases as sample size increases.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mathematical Foundation */}
      <Card className="bg-neutral-900 border-neutral-700">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">The Mathematical Foundation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Population */}
            <div className="bg-neutral-800 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-green-400 mb-2">Population</h4>
              <div className="space-y-2">
                <p className="text-sm text-neutral-300">Original distribution with:</p>
                <div className="font-mono text-sm space-y-1">
                  <div>Mean: <span className="text-green-400">μ</span></div>
                  <div>Std Dev: <span className="text-green-400">σ</span></div>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <ArrowDown className="w-6 h-6 text-neutral-500 rotate-[-90deg]" />
            </div>

            {/* Sampling Distribution */}
            <div className="bg-neutral-800 p-4 rounded-lg border border-purple-500/30">
              <h4 className="text-sm font-semibold text-purple-400 mb-2">Sampling Distribution of X̄</h4>
              <div className="space-y-2">
                <p className="text-sm text-neutral-300">Distribution of sample means:</p>
                <div className="font-mono text-sm space-y-1">
                  <div>Mean: <span className="text-purple-400">μx̄ = μ</span></div>
                  <div>Std Error: <span className="text-purple-400">σx̄ = σ/√n</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
            <h4 className="text-sm font-semibold text-blue-400 mb-2">Central Limit Theorem</h4>
            <p className="text-sm text-neutral-300">
              For large enough sample sizes (typically n ≥ 30), the sampling distribution of X̄ is approximately normal:
            </p>
            <div className="mt-2 text-center font-mono text-white">
              X̄ ~ N(μ, σ²/n)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Insights */}
      <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/50">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Try These Experiments!</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="font-semibold text-purple-300">🔬 Experiment 1: Sample Size</p>
              <p className="text-neutral-300">
                Increase n from 1 to 50. Watch how the sampling distribution becomes narrower and more bell-shaped.
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-blue-300">🔬 Experiment 2: Distribution Shape</p>
              <p className="text-neutral-300">
                Change α and β to create different Beta shapes. Notice the sampling distribution still becomes normal!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}