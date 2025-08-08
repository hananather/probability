'use client';

import React from 'react';
import TypeErrorVisualizer from '@/components/06-hypothesis-testing/6-1-hypothesis-fundamentals/6-1-3-TypeErrorVisualizer';
import { Chapter6ReferenceSheet } from '@/components/reference-sheets/Chapter6ReferenceSheet';

export default function TypeErrorVisualizerPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <Chapter6ReferenceSheet mode="floating" />
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Type I/II Error Interactive</h1>
          <p className="text-lg text-gray-400 mb-4">Explore the trade-off between Type I and Type II errors</p>
          <div className="mt-4">
            <a href="/chapter6" className="text-gray-400 hover:text-gray-300 underline">
              Back to Chapter 6 Hub
            </a>
          </div>
        </div>
        
        <div className="space-y-12">
          <TypeErrorVisualizer />
        </div>
      </div>
    </div>
  );
}