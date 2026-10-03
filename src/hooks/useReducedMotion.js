'use client';

import { useSyncExternalStore } from 'react';

const MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeToMotionPreference(onChange) {
  const media = window.matchMedia?.(MOTION_QUERY);
  if (!media) return () => {};

  if (media.addEventListener) {
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }

  media.addListener(onChange);
  return () => media.removeListener(onChange);
}

function getMotionPreference() {
  return window.matchMedia?.(MOTION_QUERY).matches ?? true;
}

// Start with static content during server rendering and hydration.
export function useReducedMotion() {
  return useSyncExternalStore(subscribeToMotionPreference, getMotionPreference, () => true);
}

function subscribeToPageVisibility(onChange) {
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
}

function getPageVisibility() {
  return document.visibilityState !== 'hidden';
}

export function usePageVisibility() {
  return useSyncExternalStore(subscribeToPageVisibility, getPageVisibility, () => false);
}
