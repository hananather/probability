"use client";
import dynamic from 'next/dynamic';

const ExponentialDistribution = dynamic(
  () => import('./3-4-1-ExponentialDistribution'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

export default ExponentialDistribution;