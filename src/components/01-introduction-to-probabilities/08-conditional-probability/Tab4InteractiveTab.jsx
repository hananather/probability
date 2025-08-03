"use client";

import dynamic from 'next/dynamic';

// Import the interactive conditional probability component
const ConditionalProbability = dynamic(() => 
  import('./ConditionalProbability'), 
  { ssr: false }
);

export default function Tab4InteractiveTab({ onComplete }) {
  return <ConditionalProbability onComplete={onComplete} />;
}