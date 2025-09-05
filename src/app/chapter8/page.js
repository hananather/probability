import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Clock } from 'lucide-react';

export const metadata = {
  title: 'Chapter 8: Coming Soon | Probability Lab',
  description: 'Chapter 8 content is under construction. New interactive experiences are coming soon.'
};

export default function Chapter8ComingSoonPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-2xl">
        <Card className="bg-neutral-900/80 border-neutral-800">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-purple-500/15 border border-neutral-700 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Chapter 8 is Coming Soon</h1>
                <p className="text-neutral-300">
                  We’re crafting the next set of interactive tools, worked examples, and practice.
                  Thanks for your patience while we polish the experience.
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <Clock className="w-4 h-4" />
                <span>Expected release soon</span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link href="/">
                  <Button variant="primary">Course Overview</Button>
                </Link>
                <Link href="/chapter7">
                  <Button variant="secondary">Browse Other Chapters</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

