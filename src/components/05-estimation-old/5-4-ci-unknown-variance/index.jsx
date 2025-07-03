'use client';

import React from 'react';
import Link from 'next/link';
import { Calculator, BarChart3, Shuffle, ArrowRight, AlertCircle, TrendingUp } from 'lucide-react';

const CIUnknownVarianceHub = () => {
  const learningPaths = [
    {
      id: 'path1',
      title: 'T-Confidence Intervals',
      description: 'Master confidence intervals when population variance is unknown',
      icon: Calculator,
      component: '5-4-1-TConfidenceIntervals',
      highlights: [
        'Small sample sizes',
        'Degrees of freedom',
        'Real data scenarios'
      ],
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'path2',
      title: 'T-Distribution Properties',
      description: 'Explore how t-distribution adapts to sample size',
      icon: BarChart3,
      component: '5-4-2-TDistributionShowcase',
      highlights: [
        'Shape evolution',
        'Heavier tails',
        'Convergence to normal'
      ],
      color: 'from-amber-500 to-orange-500'
    },
    {
      id: 'path3',
      title: 'Bootstrap Methods',
      description: 'Modern resampling techniques for complex scenarios',
      icon: Shuffle,
      component: '5-4-3-Bootstrapping',
      highlights: [
        'Distribution-free',
        'Complex statistics',
        'Computational approach'
      ],
      color: 'from-orange-600 to-amber-600'
    }
  ];

  const comparisonData = [
    { aspect: 'When to Use', t: 'Unknown population σ', z: 'Known population σ' },
    { aspect: 'Sample Size', t: 'Any size (especially small)', z: 'Large samples (n ≥ 30)' },
    { aspect: 'Distribution Shape', t: 'Heavier tails', z: 'Standard normal' },
    { aspect: 'Precision', t: 'More conservative', z: 'More precise' }
  ];

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 to-amber-900/20" />
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Confidence Intervals: Unknown σ
            </h1>
            <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
              Welcome to the real world where population variance is rarely known. 
              Learn how to construct reliable confidence intervals using sample data.
            </p>
          </div>
        </div>
      </div>

      {/* Why This Matters Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-neutral-800 rounded-2xl shadow-xl p-8 border border-orange-500/30">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-4">
                Real-World Uncertainty
              </h2>
              <p className="text-neutral-300 mb-4">
                In practice, we almost never know the true population standard deviation. 
                This is where the t-distribution becomes our trusted companion, accounting 
                for the additional uncertainty from estimating σ with s.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
                  <h3 className="font-semibold text-orange-400 mb-2">Small Samples</h3>
                  <p className="text-sm text-neutral-300">
                    T-distribution properly handles the extra variability in small samples
                  </p>
                </div>
                <div className="bg-amber-900/20 rounded-lg p-4 border border-amber-500/30">
                  <h3 className="font-semibold text-amber-400 mb-2">Wider Intervals</h3>
                  <p className="text-sm text-neutral-300">
                    More conservative estimates reflect our uncertainty about σ
                  </p>
                </div>
                <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
                  <h3 className="font-semibold text-orange-400 mb-2">Adaptive</h3>
                  <p className="text-sm text-neutral-300">
                    Automatically adjusts based on sample size through degrees of freedom
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Paths */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          Choose Your Learning Path
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {learningPaths.map((path) => {
            const Icon = path.icon;
            return (
              <Link
                key={path.id}
                href={`/chapter5/ci-unknown-variance/${path.component.replace('5-4-', '')}`}
                className="group relative bg-neutral-800 rounded-2xl shadow-lg hover:shadow-2xl 
                         transition-all duration-300 overflow-hidden border border-orange-500/30"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${path.color} opacity-0 
                               group-hover:opacity-10 transition-opacity duration-300`} />
                
                <div className="relative p-6 space-y-4">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${path.color}`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white group-hover:text-orange-400 
                               transition-colors">
                    {path.title}
                  </h3>
                  
                  <p className="text-neutral-400">
                    {path.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {path.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-neutral-300">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex items-center gap-2 text-orange-400 font-medium pt-2">
                    <span>Start Learning</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Degrees of Freedom Concept */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-br from-orange-900/20 to-amber-900/20 rounded-2xl p-8 border border-orange-500/30">
          <h2 className="text-2xl font-bold text-white mb-6">
            Understanding Degrees of Freedom
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-neutral-300 mb-4">
                Degrees of freedom (df = n - 1) represent the number of independent 
                pieces of information available to estimate variability.
              </p>
              <div className="bg-neutral-800/80 rounded-lg p-4 space-y-3 border border-neutral-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">n=5</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">df = 4</p>
                    <p className="text-sm text-neutral-400">Very wide intervals</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">n=30</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">df = 29</p>
                    <p className="text-sm text-neutral-400">Approaching normal</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">n=∞</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">df = ∞</p>
                    <p className="text-sm text-neutral-400">Becomes standard normal</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-sm">
                <svg viewBox="0 0 400 300" className="w-full h-auto">
                  {/* T-distribution curves for different df */}
                  <path d="M 50 250 Q 200 100 350 250" fill="none" stroke="rgb(249 115 22)" strokeWidth="3" />
                  <path d="M 50 250 Q 200 130 350 250" fill="none" stroke="rgb(251 146 60)" strokeWidth="3" />
                  <path d="M 50 250 Q 200 150 350 250" fill="none" stroke="rgb(251 191 36)" strokeWidth="3" />
                  
                  <text x="200" y="90" textAnchor="middle" className="fill-orange-600 text-sm font-semibold">
                    df = 5
                  </text>
                  <text x="200" y="120" textAnchor="middle" className="fill-orange-500 text-sm font-semibold">
                    df = 15
                  </text>
                  <text x="200" y="140" textAnchor="middle" className="fill-amber-500 text-sm font-semibold">
                    df = ∞
                  </text>
                  
                  <line x1="50" y1="250" x2="350" y2="250" stroke="rgb(107 114 128)" strokeWidth="2" />
                  <line x1="200" y1="250" x2="200" y2="150" stroke="rgb(107 114 128)" strokeWidth="1" strokeDasharray="4" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* T vs Z Comparison */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-center text-white mb-8">
          T-Distribution vs. Z-Distribution
        </h2>
        <div className="bg-neutral-800 rounded-2xl shadow-xl overflow-hidden border border-neutral-700">
          <div className="grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-neutral-600">
            {comparisonData.map((item, idx) => (
              <div key={idx} className="p-6">
                <h3 className="font-semibold text-neutral-300 mb-3">{item.aspect}</h3>
                <div className="space-y-2">
                  <div className="bg-orange-900/20 rounded-lg p-3 border border-orange-500/30">
                    <p className="text-sm font-medium text-orange-400">T-Distribution</p>
                    <p className="text-sm text-neutral-300">{item.t}</p>
                  </div>
                  <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-500/30">
                    <p className="text-sm font-medium text-blue-400">Z-Distribution</p>
                    <p className="text-sm text-neutral-300">{item.z}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pro Tip */}
      <div className="max-w-7xl mx-auto px-6 py-12 pb-20">
        <div className="bg-gradient-to-r from-orange-900/20 to-amber-900/20 rounded-2xl p-8 text-white border border-orange-500/30">
          <div className="flex items-start gap-4">
            <TrendingUp className="w-8 h-8 flex-shrink-0" />
            <div>
              <h3 className="text-2xl font-bold mb-3">Pro Tip: Choosing Your Method</h3>
              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
                  <h4 className="font-semibold mb-2">Use T-Distribution When:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Data is approximately normal</li>
                    <li>• Simple mean-based intervals needed</li>
                    <li>• Traditional statistical approach preferred</li>
                  </ul>
                </div>
                <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
                  <h4 className="font-semibold mb-2">Use Bootstrap When:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Data is non-normal or complex</li>
                    <li>• Intervals for medians, ratios, etc.</li>
                    <li>• Distribution assumptions are questionable</li>
                  </ul>
                </div>
              </div>
              <p className="mt-4 text-neutral-300">
                Both methods account for unknown σ, but bootstrapping offers more flexibility 
                for modern, complex data scenarios.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CIUnknownVarianceHub;