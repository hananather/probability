'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Chapter6ReferenceSheet } from '@/components/reference-sheets/Chapter6ReferenceSheet';

const ZTableEducation = dynamic(
  () => import('@/components/03-continuous-random-variables/3-3-normal-distribution/3-3-4-ZTableEducation'),
  { 
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
  }
);

export default function ZTableEducationPage() {
  return (
    <>
      <Chapter6ReferenceSheet mode="floating" />
      
      <div className="mb-6">
        <Link href="/chapter6/test-mean-known-variance">
          <Button variant="secondary" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Z-Test (Known σ)
          </Button>
        </Link>
      </div>

      <ZTableEducation />
    </>
  );
}