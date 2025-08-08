'use client';

import DiscreteRandomVariablesHub from '@/components/02-discrete-random-variables/2-0-DiscreteRandomVariablesHub';
import { Chapter2ReferenceSheet } from '@/components/reference-sheets/Chapter2ReferenceSheet';

/**
 * Chapter 2 Page Component
 * Renders the Discrete Random Variables hub
 * @returns {JSX.Element} The Chapter 2 page
 */
export default function Chapter2Page() {
  return (
    <>
      <Chapter2ReferenceSheet mode="floating" />
      <DiscreteRandomVariablesHub />
    </>
  );
}