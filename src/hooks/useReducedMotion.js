'use client';

import { createContext, useContext, useSyncExternalStore } from 'react';

const MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const subscribeToNothing = () => () => {};
const staticMotionPreference = () => true;

export const MotionPreferenceContext = createContext(null);

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

export function useSystemReducedMotion(active = true) {
  return useSyncExternalStore(
    active ? subscribeToMotionPreference : subscribeToNothing,
    active ? getMotionPreference : staticMotionPreference,
    staticMotionPreference
  );
}

export function useMotionPreferences() {
  return useContext(MotionPreferenceContext);
}

// Existing consumers also respect the site choice when a provider is present.
export function useReducedMotion() {
  const preferences = useMotionPreferences();
  const systemReducedMotion = useSystemReducedMotion(preferences === null);
  return preferences?.reducedMotion ?? systemReducedMotion;
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
