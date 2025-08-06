'use client';

import React from 'react';
import TypesOfHypothesesInteractive from '@/components/06-hypothesis-testing/6-2-2-TypesOfHypotheses-Interactive';

export default function TypesHypothesesInteractivePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Interactive Hypothesis Types</h1>
          <p className="text-lg text-gray-400 mb-4">Compare one-tailed and two-tailed tests interactively</p>
          <div className="mt-4">
            <a href="/chapter6" className="text-gray-400 hover:text-gray-300 underline">
              Back to Chapter 6 Hub
            </a>
          </div>
        </div>
        
        <div className="space-y-12">
          <TypesOfHypothesesInteractive />
        </div>
      </div>
    </div>
  );
}