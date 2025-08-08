"use client";
import TestForMeanKnownVarianceV2 from '@/components/06-hypothesis-testing/6-4-1-TestForMeanKnownVariance';
// import TestForMeanKnownVarianceV3 from '@/components/06-hypothesis-testing/6-4-1-TestForMeanKnownVariance-v3';
import Link from 'next/link';
import { useState } from 'react';
import { Chapter6ReferenceSheet } from '@/components/reference-sheets/Chapter6ReferenceSheet';

export default function ComparisonPage() {
  const [version, setVersion] = useState('v2');
  
  return (
    <div className="min-h-screen bg-[#0F0F10]">
      <Chapter6ReferenceSheet mode="floating" />
      <div className="p-4 bg-neutral-900 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Test for Mean (Known Variance) - Version Comparison</h1>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setVersion('v2')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  version === 'v2' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                }`}
              >
                V2 (New Improved)
              </button>
              <button
                onClick={() => setVersion('v3')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  version === 'v3' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                }`}
              >
                V3 (Old Version)
              </button>
            </div>
            <Link 
              href="/tutorials/chapter6/test-mean-known-variance"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Production Version
            </Link>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-yellow-900/20 border-b border-yellow-600/30">
        <div className="max-w-7xl mx-auto">
          <p className="text-yellow-400 text-sm">
            <strong>TEMPORARY:</strong> This comparison page is for evaluation only. 
            {version === 'v2' && ' V2 is the new improved version following the pattern of 6-3-1 and 6-9-1 with clear mathematical framework, worked examples, and professional UI.'}
            {version === 'v3' && ' V3 is the previous version with 6-step framework and story-driven approach.'}
          </p>
        </div>
      </div>
      
      <div className="space-y-8 p-4 max-w-7xl mx-auto">
        {version === 'v2' && <TestForMeanKnownVarianceV2 />}
        {version === 'v3' && <div className="text-white">V3 component not available</div>}
      </div>
    </div>
  );
}