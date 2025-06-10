'use client';

import dynamic from 'next/dynamic';
import ChapterLoading from '../ChapterLoading';

const BridgeToContinuous = dynamic(
  () => import('./BridgeToContinuous'),
  {
    ssr: false,
    loading: () => <ChapterLoading />
  }
);

export default BridgeToContinuous;