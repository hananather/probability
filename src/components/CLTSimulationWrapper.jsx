"use client";

import dynamic from 'next/dynamic';

const CLTSimulation = dynamic(
  () => import('./CLTSimulation'),
  { ssr: false }
);

export default CLTSimulation;
