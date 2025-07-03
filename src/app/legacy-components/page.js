"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, FlaskConical } from 'lucide-react';

// Import legacy components
import { BayesianInference } from '@/components/05-estimation-old/5-1-statistical-inference/5-1-1-BayesianInference';
import PointEstimation from '@/components/05-estimation-old/5-1-statistical-inference/5-1-4-PointEstimation';
import ConfidenceIntervalSimulation from '@/components/05-estimation-old/5-2-ci-known-variance/5-2-4-ConfidenceIntervalSimulation';
import Bootstrapping from '@/components/05-estimation-old/5-4-ci-unknown-variance/5-4-3-Bootstrapping';
import CLTSimulation from '@/components/shared/CLTSimulation';

export default function LegacyComponentsPage() {
  const legacyComponents = [
    {
      title: "Bayesian Inference Simulation",
      description: "Interactive patient disease testing visualization using Bayes' theorem",
      component: BayesianInference,
      highlights: ["Beta distribution priors", "Real-time posterior updates", "Disease testing scenario"]
    },
    {
      title: "Point Estimation",
      description: "Monte Carlo method for estimating π using random sampling",
      component: PointEstimation,
      highlights: ["Visual estimation", "Real-time accuracy tracking", "Sampling demonstration"]
    },
    {
      title: "Confidence Interval Simulation",
      description: "Sampling distribution visualization with confidence interval coverage",
      component: ConfidenceIntervalSimulation,
      highlights: ["Multiple sample generation", "Coverage rate tracking", "Interactive parameters"]
    },
    {
      title: "Bootstrapping Simulation",
      description: "Resampling methodology for statistical inference",
      component: Bootstrapping,
      highlights: ["Bootstrap sampling", "Distribution visualization", "Confidence interval estimation"]
    },
    {
      title: "Central Limit Theorem",
      description: "Interactive demonstration of the CLT with various distributions",
      component: CLTSimulation,
      highlights: ["Beta distribution sampling", "Normal approximation", "Real-time convergence"]
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-4 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/overview">
            <Button variant="ghost" size="sm" className="group">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Overview
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-neutral-400">
            <FlaskConical className="h-5 w-5" />
            <span className="text-sm">Legacy Components Archive</span>
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-4">Legacy Component Showcase</h1>
        <p className="text-lg text-neutral-300 max-w-3xl">
          These are the original, standalone interactive components that laid the foundation 
          for our current integrated learning modules. Each component represents a focused 
          exploration of specific statistical concepts.
        </p>
      </div>

      {/* Components Grid */}
      <div className="max-w-7xl mx-auto space-y-12">
        {legacyComponents.map((item, index) => {
          const Component = item.component;
          return (
            <Card key={index} className="bg-neutral-800/50 border-neutral-700">
              <CardHeader>
                <CardTitle className="text-2xl text-white">{item.title}</CardTitle>
                <CardDescription className="text-neutral-300">
                  {item.description}
                </CardDescription>
                <div className="flex flex-wrap gap-2 mt-3">
                  {item.highlights.map((highlight, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1 bg-neutral-700/50 rounded-full text-xs text-neutral-200"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-700">
                  <Component />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-12 py-8 border-t border-neutral-800">
        <p className="text-center text-neutral-400">
          These components have been preserved for reference and historical context. 
          For the latest versions, please visit the respective chapter pages.
        </p>
      </div>
    </div>
  );
}