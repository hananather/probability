'use client';

import dynamic from 'next/dynamic';
import ChapterLoading from '../shared/ChapterLoading';

const JointDistributions = dynamic(
  () => import('./3-6-1-JointDistributions').then(mod => mod.default),
  {
    ssr: false,
    loading: () => <ChapterLoading />
  }
);

export default JointDistributions;