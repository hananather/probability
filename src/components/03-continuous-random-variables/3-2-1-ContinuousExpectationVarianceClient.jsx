"use client";
import dynamic from 'next/dynamic';

const ContinuousExpectationVariance = dynamic(
  () => import('./3-2-1-ContinuousExpectationVariance').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-400">Loading visualization...</p>
        </div>
      </div>
    )
  }
);

export default ContinuousExpectationVariance;