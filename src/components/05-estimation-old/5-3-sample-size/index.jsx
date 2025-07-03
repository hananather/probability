"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Calculator, 
  FlaskConical, 
  TrendingUp, 
  AlertCircle, 
  Building2,
  Users,
  ChartBar,
  Microscope,
  Target,
  Brain,
  DollarSign,
  Scale
} from 'lucide-react';

const SampleSizeDeterminationHub = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header Section */}
      <div className="text-center py-16 px-8">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
          Right-Sizing Your Study
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Master the art and science of sample size determination. Learn to balance statistical power, 
          practical constraints, and budget limitations to design studies that deliver reliable results.
        </p>
        
        {/* Key Quote */}
        <div className="mt-8 p-6 bg-neutral-800 rounded-xl border border-neutral-700 max-w-2xl mx-auto">
          <p className="text-gray-300 italic text-lg">
            "The right sample size is not just about statistics—it's about finding the sweet spot 
            where precision meets practicality."
          </p>
        </div>
      </div>

      {/* Learning Paths */}
      <div className="max-w-7xl mx-auto px-8 pb-8">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          Choose Your Learning Path
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Sample Size Calculator Card */}
          <Link href="/chapter5/sample-size/1-SampleSizeCalculator">
            <div className="group relative overflow-hidden rounded-xl bg-neutral-800 border border-neutral-700 p-8 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-violet-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg mr-4 border border-purple-500/30">
                    <Calculator className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Sample Size Calculator</h3>
                </div>
                
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Start here to master the fundamentals. Use our interactive calculator to determine 
                  optimal sample sizes for means and proportions, visualize trade-offs, and understand 
                  the key formulas.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <ChartBar className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Visual Trade-off Analysis</h4>
                      <p className="text-sm text-gray-400">
                        See how margin of error, confidence level, and sample size interact
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Cost-Benefit Calculator</h4>
                      <p className="text-sm text-gray-400">
                        Balance statistical precision with budget constraints
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Practical Scenarios</h4>
                      <p className="text-sm text-gray-400">
                        Explore presets for polls, quality control, and medical studies
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 inline-flex items-center text-purple-400 font-medium group-hover:text-purple-300 transition-colors">
                  Start Calculating
                  <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Sample Size Laboratory Card */}
          <Link href="/chapter5/sample-size/2-SampleSizeLaboratory">
            <div className="group relative overflow-hidden rounded-xl bg-neutral-800 border border-neutral-700 p-8 hover:border-violet-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-purple-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-violet-500/20 rounded-lg mr-4 border border-violet-500/30">
                    <FlaskConical className="w-8 h-8 text-violet-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Sample Size Laboratory</h3>
                </div>
                
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Dive deeper into advanced concepts. Experiment with multiple scenarios, analyze 
                  cost-precision trade-offs, and unlock achievements as you master sample size 
                  determination.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Microscope className="w-5 h-5 text-violet-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Advanced Analysis Tools</h4>
                      <p className="text-sm text-gray-400">
                        Dual-axis visualization of cost vs. precision relationships
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Brain className="w-5 h-5 text-violet-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">The Square Root Law</h4>
                      <p className="text-sm text-gray-400">
                        Understand why halving error quadruples sample size
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-violet-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Achievement System</h4>
                      <p className="text-sm text-gray-400">
                        Unlock discoveries like finding the classic n=384
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 inline-flex items-center text-violet-400 font-medium group-hover:text-violet-300 transition-colors">
                  Enter Laboratory
                  <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Common Myths Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Common Sample Size Myths
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
              <div className="flex items-center mb-3">
                <AlertCircle className="w-6 h-6 text-red-400 mr-2" />
                <h3 className="text-lg font-bold text-white">Myth #1</h3>
              </div>
              <p className="text-gray-300 font-medium mb-2">
                "Bigger is always better"
              </p>
              <p className="text-gray-400 text-sm">
                <span className="font-semibold text-gray-300">Reality:</span> Beyond a certain point, 
                increasing sample size yields diminishing returns. The cost often 
                outweighs the marginal gain in precision.
              </p>
            </div>
            
            <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
              <div className="flex items-center mb-3">
                <AlertCircle className="w-6 h-6 text-yellow-400 mr-2" />
                <h3 className="text-lg font-bold text-white">Myth #2</h3>
              </div>
              <p className="text-gray-300 font-medium mb-2">
                "10% of population is enough"
              </p>
              <p className="text-gray-400 text-sm">
                <span className="font-semibold text-gray-300">Reality:</span> Sample size depends on 
                variability and desired precision, not population size. A city of 1M 
                needs similar sample size as a country of 300M.
              </p>
            </div>
            
            <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
              <div className="flex items-center mb-3">
                <AlertCircle className="w-6 h-6 text-orange-400 mr-2" />
                <h3 className="text-lg font-bold text-white">Myth #3</h3>
              </div>
              <p className="text-gray-300 font-medium mb-2">
                "Online calculators are enough"
              </p>
              <p className="text-gray-400 text-sm">
                <span className="font-semibold text-gray-300">Reality:</span> Generic calculators miss 
                crucial factors like clustering effects, dropout rates, and multiple 
                comparisons that affect real studies.
              </p>
            </div>
          </div>
        </div>

        {/* Real-World Applications */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Real-World Applications
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 hover:border-blue-500/50 transition-colors">
              <Building2 className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Clinical Trials</h3>
              <p className="text-gray-300 text-sm mb-3">
                Phase III trials typically need 300-3,000 participants to detect 
                meaningful treatment effects.
              </p>
              <div className="text-xs text-gray-400">
                <p className="font-mono">• Effect size: 0.2-0.5</p>
                <p className="font-mono">• Power: 80-90%</p>
                <p className="font-mono">• α = 0.05</p>
              </div>
            </div>
            
            <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 hover:border-green-500/50 transition-colors">
              <Users className="w-8 h-8 text-green-400 mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Market Research</h3>
              <p className="text-gray-300 text-sm mb-3">
                Consumer surveys need 400-1,200 respondents for ±3-5% margin at 
                95% confidence.
              </p>
              <div className="text-xs text-gray-400">
                <p className="font-mono">• Segmentation: 100+/group</p>
                <p className="font-mono">• Response rate: 10-30%</p>
                <p className="font-mono">• Oversampling: 20%</p>
              </div>
            </div>
            
            <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
              <ChartBar className="w-8 h-8 text-purple-400 mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Political Polls</h3>
              <p className="text-gray-300 text-sm mb-3">
                National polls use 1,000-1,500 likely voters for ±3% margin, 
                state polls 600-800.
              </p>
              <div className="text-xs text-gray-400">
                <p className="font-mono">• Weighting adjustments</p>
                <p className="font-mono">• Likely voter screens</p>
                <p className="font-mono">• Cell phone inclusion</p>
              </div>
            </div>
            
            <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 hover:border-cyan-500/50 transition-colors">
              <Scale className="w-8 h-8 text-cyan-400 mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Quality Control</h3>
              <p className="text-gray-300 text-sm mb-3">
                Manufacturing uses 5-50 samples per lot depending on process 
                capability and tolerance.
              </p>
              <div className="text-xs text-gray-400">
                <p className="font-mono">• AQL: 1-6.5%</p>
                <p className="font-mono">• Inspection level: II</p>
                <p className="font-mono">• ANSI/ASQ Z1.4</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cost vs. Precision Trade-off Visualizer */}
        <div className="mb-12 bg-neutral-800 border border-neutral-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            The Cost-Precision Balance
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Factors Affecting Sample Size</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-1.5" />
                  <div>
                    <p className="text-white font-medium">Population Variability (σ)</p>
                    <p className="text-sm text-neutral-400">
                      Higher variability → Larger sample needed
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-1.5" />
                  <div>
                    <p className="text-white font-medium">Desired Precision (E)</p>
                    <p className="text-sm text-neutral-400">
                      Smaller margin of error → Exponentially larger sample
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-1.5" />
                  <div>
                    <p className="text-white font-medium">Confidence Level (1-α)</p>
                    <p className="text-sm text-neutral-400">
                      Higher confidence → Moderately larger sample
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Cost Components</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-violet-400 rounded-full mt-1.5" />
                  <div>
                    <p className="text-white font-medium">Fixed Costs</p>
                    <p className="text-sm text-neutral-400">
                      Setup, training, infrastructure (one-time)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-violet-400 rounded-full mt-1.5" />
                  <div>
                    <p className="text-white font-medium">Variable Costs</p>
                    <p className="text-sm text-neutral-400">
                      Per-participant recruitment, data collection, incentives
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-violet-400 rounded-full mt-1.5" />
                  <div>
                    <p className="text-white font-medium">Opportunity Costs</p>
                    <p className="text-sm text-neutral-400">
                      Time delays, resource allocation, decision postponement
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pro Tips Section */}
        <div className="bg-neutral-800 rounded-xl p-8 border border-neutral-700">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Pro Tips for Sample Size Determination
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-purple-400 mb-2">Before You Start</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Clearly define your primary outcome and effect size of interest</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Consider pilot studies to estimate variability parameters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Account for dropout rates (typically add 10-20% buffer)</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-purple-400 mb-2">Common Adjustments</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Finite population correction for small populations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Design effect for cluster sampling (multiply by 1.5-3)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Multiple comparisons adjustment (Bonferroni correction)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-center text-gray-300 font-medium">
              <span className="text-purple-400">Remember:</span> Sample size calculation is both art and science. 
              Balance statistical rigor with practical constraints to design studies that are both 
              powerful and feasible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SampleSizeDeterminationHub;