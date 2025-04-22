"use client";

import dynamic from 'next/dynamic';

const DistributionSimulation = dynamic(
  () => import('./DistributionSimulation'),
  { ssr: false }
);

export default DistributionSimulation;
