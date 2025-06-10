"use client";
import dynamic from 'next/dynamic';

const ZTableLookupRedesigned = dynamic(
  () => import('./ZTableLookupRedesigned'),
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