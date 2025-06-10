'use client';

import dynamic from 'next/dynamic';
import ChapterLoading from '../shared/ChapterLoading';

const BridgeToContinuous = dynamic(
  () => import('./3-0-1-BridgeToContinuous'),
  {
    ssr: false,
    loading: () => <ChapterLoading />
  }
);

export default BridgeToContinuous;