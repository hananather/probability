"use client";
import dynamic from 'next/dynamic';

const NormalApproxBinomial = dynamic(
  () => import('./3-7-1-NormalApproxBinomial').then(mod => ({ default: mod.NormalApproxBinomial })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

export default NormalApproxBinomial;