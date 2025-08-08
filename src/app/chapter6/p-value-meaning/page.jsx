'use client';

import React from 'react';
import PValueMeaning from '@/components/06-hypothesis-testing/6-1-hypothesis-fundamentals/6-1-4-PValueMeaning';
import { Chapter6ReferenceSheet } from '@/components/reference-sheets/Chapter6ReferenceSheet';

export default function PValueMeaningPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <Chapter6ReferenceSheet mode="floating" />
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">P-Value Deep Dive</h1>
          <p className="text-lg text-gray-400 mb-4">Understand what p-values really mean and avoid common misconceptions</p>
          <div className="mt-4">
            <a href="/chapter6" className="text-gray-400 hover:text-gray-300 underline">
              Back to Chapter 6 Hub
            </a>
          </div>
        </div>
        
        <div className="space-y-12">
          <PValueMeaning />
        </div>
      </div>
    </div>
  );
}