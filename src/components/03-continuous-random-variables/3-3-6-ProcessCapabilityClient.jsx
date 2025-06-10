"use client";
import dynamic from 'next/dynamic';

const ProcessCapability = dynamic(
  () => import('./3-3-6-ProcessCapability'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading visualization...</div>
      </div>
    )
  }
);

export default ProcessCapability;