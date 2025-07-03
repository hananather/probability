'use client';

import ExpectationVariance from '@/components/02-discrete-random-variables/2-2-1-ExpectationVariance';
import ExpectationVarianceWorkedExample from '@/components/02-discrete-random-variables/2-2-2-ExpectationVarianceWorkedExample';
import BackToHub from '@/components/ui/BackToHub';

export default function ExpectationVariancePage() {
  return (
    <>
      <BackToHub chapter={2} />
      <div className="space-y-12">
        <ExpectationVariance />
        <ExpectationVarianceWorkedExample />
      </div>
    </>
  );
}