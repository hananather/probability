"use client";
import dynamic from 'next/dynamic';

const ContinuousDistributionsPDF = dynamic(
  () => import('./3-1-1-ContinuousDistributionsPDF').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[600px] bg-neutral-900/50 rounded-lg">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20">
            <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-gray-400">Loading continuous distributions...</p>
        </div>
      </div>
    )
  }
);

export default ContinuousDistributionsPDF;