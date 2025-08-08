import ConfidenceIntervalUnknownVariance from '@/components/05-estimation/5-4-ConfidenceIntervalUnknownVariance';
import { Chapter5ReferenceSheet } from '@/components/reference-sheets/Chapter5ReferenceSheet';

export default function Page() {
  return (
    <>
      <Chapter5ReferenceSheet mode="floating" />
      <ConfidenceIntervalUnknownVariance />
    </>
  );
}

export const metadata = {
  title: '5.4 Confidence Intervals: Unknown Variance | ProbLab',
  description: 'Explore t-distributions, degrees of freedom, and bootstrap methods for real-world inference when population variance is unknown.',
};