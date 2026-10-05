'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const SectionComplete = ({ chapter = 5, status = 'complete' }) => {
  const reducedMotion = useReducedMotion();
  const isNavigation = status === 'navigation';
  const Icon = isNavigation ? ArrowRight : CheckCircle;
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <motion.div
            className="shrink-0"
            initial={reducedMotion ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <Icon className="w-8 h-8 text-emerald-400" />
          </motion.div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-emerald-400">
              {isNavigation ? 'Continue learning' : 'Section Complete!'}
            </h3>
            <p className="text-sm text-neutral-300">
              {isNavigation ? 'Choose another lesson from this chapter.' : 'Great work! Ready to continue learning?'}
            </p>
          </div>
        </div>
        
        <Link
          href={`/chapter${chapter}`}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 sm:w-auto sm:shrink-0 sm:text-base"
        >
          <span>Back to Chapter {chapter}</span>
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        </Link>
      </div>
    </motion.div>
  );
};

export default SectionComplete;
