'use client';

import { useId } from 'react';
import { Pause } from 'lucide-react';
import { useMotionPreferences } from '@/hooks/useReducedMotion';

export function MotionPreferenceControl({ compact = false }) {
  const preferences = useMotionPreferences();
  const descriptionId = useId();
  if (!preferences) return null;

  const sessionOnly = preferences.persistence === 'session';
  const messages = [];
  if (preferences.ready && preferences.systemReducedMotion) messages.push(preferences.systemPreferenceAvailable ? 'Your device requests reduced motion. This setting cannot turn it off.' : 'Motion stays reduced because the device preference is unavailable.');
  if (sessionOnly) messages.push('Your motion choice lasts until you reload. Browser storage is unavailable.');
  const description = messages.join(' ');

  return (
    <div className={compact ? 'relative' : 'mb-6 flex flex-col items-center gap-2'}>
      <button
        type="button"
        aria-pressed={preferences.userReducedMotion}
        aria-describedby={description ? descriptionId : undefined}
        title={description || 'Reduce decorative motion'}
        disabled={!preferences.ready}
        onClick={() => preferences.setUserReducedMotion(!preferences.userReducedMotion)}
        className={`inline-flex h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 disabled:opacity-50 ${preferences.userReducedMotion ? 'border-teal-400 bg-teal-950 text-teal-100' : 'border-neutral-600 bg-neutral-900 text-neutral-200 hover:bg-neutral-800'} ${compact ? 'w-10 px-0 sm:w-auto sm:px-3' : ''}`}
      >
        <Pause className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className={compact ? 'sr-only sm:not-sr-only' : undefined}>Reduce motion</span>
      </button>
      {description && (
        <p
          id={descriptionId}
          role="status"
          className={compact ? sessionOnly ? 'absolute right-0 top-full z-50 mt-2 w-64 rounded-md border border-neutral-600 bg-neutral-900 p-3 text-xs text-neutral-200' : 'sr-only' : 'max-w-md text-xs text-neutral-300'}
        >
          {description}
        </p>
      )}
    </div>
  );
}
