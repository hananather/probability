'use client';
import ChapterError from '../../components/ChapterError';

export default function Error({ error, reset }) {
  return <ChapterError error={error} reset={reset} chapter="5" />;
}
