"use client";
import dynamic from 'next/dynamic';

const ZTableLookupRedesigned = dynamic(
  () => import('./3-3-4-ZTableLookup').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading enhanced visualization...</div>
      </div>
    )
  }
);

export default ZTableLookupRedesigned;