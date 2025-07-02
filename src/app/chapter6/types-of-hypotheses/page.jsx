"use client";
import { useState } from 'react';
import TypesOfHypotheses from '@/components/06-hypothesis-testing/6-2-1-TypesOfHypotheses';
import TypesOfHypothesesInteractive from '@/components/06-hypothesis-testing/6-2-2-TypesOfHypotheses-Interactive';
import { Button } from '@/components/ui/button';

export default function TypesOfHypothesesPage() {
  const [version, setVersion] = useState('rigorous');

  const handleSwitchToInteractive = () => {
    setVersion('interactive');
  };

  return (
    <div>
      <div className="flex justify-center gap-4 mb-6 mt-4">
        <Button
          onClick={() => setVersion('rigorous')}
          variant={version === 'rigorous' ? 'default' : 'outline'}
          size="sm"
        >
          6.2.1 Rigorous Learning
        </Button>
        <Button
          onClick={() => setVersion('interactive')}
          variant={version === 'interactive' ? 'default' : 'outline'}
          size="sm"
        >
          6.2.2 Interactive Exploration
        </Button>
      </div>
      
      {version === 'rigorous' && <TypesOfHypotheses onSwitchToInteractive={handleSwitchToInteractive} />}
      {version === 'interactive' && <TypesOfHypothesesInteractive />}
    </div>
  );
}