import TestForMeanUnknownVariance from '@/components/06-hypothesis-testing/6-5-TestForMeanUnknownVariance';
import { Chapter6ReferenceSheet } from '@/components/reference-sheets/Chapter6ReferenceSheet';

export const metadata = {
  title: 'Test for Mean with Unknown Variance | Chapter 6',
  description: 'Learn how to test hypotheses about population means when variance is unknown through interactive examples',
};

export default function TestMeanUnknownVariancePage() {
  return (
    <>
      <Chapter6ReferenceSheet mode="floating" />
      <TestForMeanUnknownVariance />
    </>
  );
}