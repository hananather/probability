import ProportionConfidenceInterval from '@/components/05-estimation/5-5-ProportionConfidenceInterval';
import { Chapter5ReferenceSheet } from '@/components/reference-sheets/Chapter5ReferenceSheet';

export default function Page() {
  return (
    <>
      <Chapter5ReferenceSheet mode="floating" />
      <ProportionConfidenceInterval />
    </>
  );
}

export const metadata = {
  title: 'Confidence Intervals for Proportions | Chapter 5',
  description: 'Master confidence intervals for proportions with interactive visualizations. Explore election polling, quality control, and A/B testing applications.',
};