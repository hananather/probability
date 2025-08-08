'use client';

import dynamic from 'next/dynamic';
import BackToHub from '@/components/ui/BackToHub';
import { Chapter3ReferenceSheet } from '@/components/reference-sheets/Chapter3ReferenceSheet';

const NormalZScoreExplorer = dynamic(
  () => import('@/components/03-continuous-random-variables/3-3-1-NormalZScoreExplorerClient'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);

const NormalZScoreWorkedExample = dynamic(
  () => import('@/components/03-continuous-random-variables/3-3-2-NormalZScoreWorkedExample'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);

const EmpiricalRule = dynamic(
  () => import('@/components/03-continuous-random-variables/3-3-3-EmpiricalRuleClient'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);

const ZTableLookup = dynamic(
  () => import('@/components/03-continuous-random-variables/3-3-4-ZTableLookupClient'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);

const ZScorePracticeProblems = dynamic(
  () => import('@/components/03-continuous-random-variables/3-3-5-ZScorePracticeProblemsClient'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);

export default function NormalDistributionsPage() {
  return (
    <>
      <Chapter3ReferenceSheet mode="floating" />
      <BackToHub chapter={3} />
      <div className="space-y-12">
        <NormalZScoreExplorer />
        <NormalZScoreWorkedExample />
        <EmpiricalRule />
        <ZTableLookup />
        <ZScorePracticeProblems />
      </div>
    </>
  );
}