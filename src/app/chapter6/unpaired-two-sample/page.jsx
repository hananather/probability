import UnpairedTwoSampleTest from '@/components/06-hypothesis-testing/6-8-1-UnpairedTwoSampleTest';
import { Chapter6ReferenceSheet } from '@/components/reference-sheets/Chapter6ReferenceSheet';

export const metadata = {
  title: 'Unpaired Two-Sample Test | Chapter 6',
  description: 'Compare means from two independent groups with different variance assumptions through interactive examples',
};

export default function UnpairedTwoSamplePage() {
  return (
    <>
      <Chapter6ReferenceSheet mode="floating" />
      <UnpairedTwoSampleTest />
    </>
  );
}