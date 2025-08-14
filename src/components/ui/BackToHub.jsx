'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from './button';
import { ArrowLeft } from 'lucide-react';

/**
 * BackToHub Component
 * Provides consistent navigation back to chapter hub pages
 * @param {number} chapter - Chapter number for the hub link
 * @param {boolean} bottom - If true, adds margin at bottom for placement at end of content
 */
export default function BackToHub({ chapter = 3, bottom = false }) {
  return (
    <div className={`flex justify-start ${bottom ? 'mt-8 mb-4' : 'mb-6'}`}>
      <Link href={`/chapter${chapter}`}>
        <Button variant="secondary" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Chapter {chapter} Hub
        </Button>
      </Link>
    </div>
  );
}