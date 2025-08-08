'use client';

import { EmpiricalRuleEnhanced } from '../../../../components/05-estimation/5-8-EmpiricalRuleEnhanced';
import { Chapter5ReferenceSheet } from '@/components/reference-sheets/Chapter5ReferenceSheet';

export default function EmpiricalRuleEnhancedPage() {
  return (
    <>
      <Chapter5ReferenceSheet mode="floating" />
      <EmpiricalRuleEnhanced />
    </>
  );
}