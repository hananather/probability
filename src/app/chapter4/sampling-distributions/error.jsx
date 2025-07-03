'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <h2 className="text-2xl font-bold">Something went wrong!</h2>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          There was an error loading the sampling distributions module. 
          This might be due to a temporary issue with loading the visualization components.
        </p>
        
        <div className="flex gap-4">
          <Button onClick={() => reset()}>
            Try again
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/chapter4'}>
            Back to Chapter 4
          </Button>
        </div>
      </Card>
    </div>
  );
}