"use client";
import dynamic from 'next/dynamic';

const GammaDistribution = dynamic(
  () => import('./3-5-1-GammaDistribution').then(mod => ({ default: mod.GammaDistribution })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

export default GammaDistribution;