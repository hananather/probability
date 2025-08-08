'use client';

import HypothesisTestingHub from '@/components/06-hypothesis-testing/6-0-HypothesisTestingHub';
import { Chapter6ReferenceSheet } from '@/components/reference-sheets/Chapter6ReferenceSheet';

/**
 * Chapter 6 page component - Hypothesis Testing.
 * 
 * This page serves as the entry point for Chapter 6, rendering the
 * HypothesisTestingHub component which provides the main navigation
 * and content structure for all hypothesis testing topics.
 * 
 * @returns {JSX.Element} Chapter 6 hypothesis testing page
 */
export default function Chapter6Page() {
  return (
    <>
      <Chapter6ReferenceSheet mode="floating" />
      <HypothesisTestingHub />
    </>
  );
}