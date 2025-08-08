import DescriptiveStatisticsHub from '@/components/04-descriptive-statistics-sampling/4-0-DescriptiveStatisticsHub';
import { Chapter4ReferenceSheet } from '@/components/reference-sheets/Chapter4ReferenceSheet';

export const metadata = {
  title: 'Chapter 4: Descriptive Statistics & Sampling Distributions',
  description: 'Transform raw data into meaningful insights and discover the foundations of inference',
};

export default function Chapter4Page() {
  return (
    <>
      <Chapter4ReferenceSheet mode="floating" />
      <DescriptiveStatisticsHub />
    </>
  );
}