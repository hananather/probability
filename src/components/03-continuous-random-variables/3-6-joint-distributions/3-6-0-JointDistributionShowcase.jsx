'use client';

import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { VisualizationContainer } from '../../ui/VisualizationContainer';
import BackToHub from '../../ui/BackToHub';
import JointDistributions from './3-6-1-JointDistributions';
import MarginalDistributionVisualizer from './3-6-5-MarginalDistributionVisualizer';
import Link from 'next/link';
import { Calculator, Eye, Layers, Grid3x3, Sigma } from 'lucide-react';

const JointDistributionShowcase = () => {
  const [activeTab, setActiveTab] = useState('marginals');

  const visualizations = [
    {
      id: 'marginals',
      title: 'Marginal Distributions',
      icon: <Eye className="w-4 h-4" />,
      description: 'See how joint distributions project onto individual axes',
      component: <MarginalDistributionVisualizer />
    },
    {
      id: 'formulas',
      title: 'Distribution Formulas',
      icon: <Calculator className="w-4 h-4" />,
      description: 'Mathematical formulas for joint distributions',
      component: <JointDistributions />
    }
  ];

  return (
    <div className="space-y-6">
      <VisualizationContainer
        title="Joint Distribution Visualization Suite"
        description="Explore joint probability distributions through multiple interactive visualizations"
      >
        <BackToHub />
        
        {/* Navigation Header */}
        <Card className="p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-neutral-700">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Interactive Learning Tools</h3>
            <p className="text-sm text-neutral-300">
              Choose from different visualization approaches to build your intuition for joint probability distributions and double integrals.
            </p>
            
            {/* Quick Links to Formula Builders */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Link href="/chapter3/formula-builder">
                <Button variant="outline" size="sm" className="gap-2">
                  <Calculator className="w-3 h-3" />
                  Formula Builder
                </Button>
              </Link>
              <Link href="/learn">
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="w-3 h-3" />
                  Gold Standard Examples
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full bg-neutral-800/50">
            {visualizations.map(viz => (
              <TabsTrigger 
                key={viz.id} 
                value={viz.id}
                className="flex items-center gap-1 text-xs data-[state=active]:bg-blue-600/20"
              >
                {viz.icon}
                <span className="hidden md:inline">{viz.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-6">
            {visualizations.map(viz => (
              <TabsContent key={viz.id} value={viz.id} className="space-y-4">
                <Card className="p-4 bg-neutral-900/50 border-neutral-700">
                  <h4 className="text-sm font-semibold mb-2 text-blue-400">{viz.title}</h4>
                  <p className="text-xs text-neutral-400">{viz.description}</p>
                </Card>
                
                <div className="relative">
                  {viz.component}
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>

        {/* Educational Notes */}
        <Card className="p-6 bg-gradient-to-r from-green-900/20 to-teal-900/20 border-neutral-700 mt-8">
          <h3 className="text-lg font-semibold mb-3 text-green-400">Key Concepts</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-white mb-1">Joint Probability Density</h4>
              <p className="text-neutral-300">
                The joint PDF f(x,y) represents the probability density at each point in 2D space. 
                Higher values indicate regions where the variables are more likely to occur together.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">Double Integration</h4>
              <p className="text-neutral-300">
                To find probabilities, we integrate the joint PDF over a region: P(R) = ∬ᴿ f(x,y) dx dy.
                This calculates the volume under the surface.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">Marginal Distributions</h4>
              <p className="text-neutral-300">
                The marginal PDF of X is obtained by integrating out Y: fₓ(x) = ∫ f(x,y) dy.
                This "collapses" the joint distribution onto one axis.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">Independence</h4>
              <p className="text-neutral-300">
                Variables X and Y are independent if f(x,y) = fₓ(x) × fᵧ(y).
                For bivariate normal, this occurs when correlation ρ = 0.
              </p>
            </div>
          </div>
        </Card>

        {/* Practice Problems Link */}
        <Card className="p-6 bg-gradient-to-r from-orange-900/20 to-red-900/20 border-neutral-700">
          <h3 className="text-lg font-semibold mb-3 text-orange-400">Practice & Application</h3>
          <p className="text-sm text-neutral-300 mb-4">
            Ready to apply what you've learned? Try these resources:
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/chapter3/worked-examples">
              <Button variant="outline" size="sm">
                Worked Examples
              </Button>
            </Link>
            <Link href="/chapter3/practice-problems">
              <Button variant="outline" size="sm">
                Practice Problems
              </Button>
            </Link>
            <Link href="/chapter3/formula-builder">
              <Button variant="outline" size="sm">
                Build Your Own Formulas
              </Button>
            </Link>
          </div>
        </Card>
      </VisualizationContainer>
    </div>
  );
};

export default JointDistributionShowcase;