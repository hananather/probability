'use client';

import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { MotionPreferenceContext, useSystemReducedMotion } from '@/hooks/useReducedMotion';

export const MOTION_STORAGE_KEY = 'probability:motion-preference:v1';

function readSitePreference() {
  try {
    return { userReducedMotion: window.localStorage.getItem(MOTION_STORAGE_KEY) === 'true', persistence: 'browser', ready: true };
  } catch {
    return { persistence: 'session', ready: true };
  }
}

export function MotionPreferenceProvider({ children }) {
  const systemReducedMotion = useSystemReducedMotion();
  const [sitePreference, setSitePreference] = useState({ userReducedMotion: false, persistence: 'loading', ready: false });
  const systemPreferenceAvailable = sitePreference.ready && typeof window.matchMedia === 'function';
  const reducedMotion = !sitePreference.ready || systemReducedMotion || sitePreference.userReducedMotion;

  useLayoutEffect(() => {
    setSitePreference(previous => ({ ...previous, ...readSitePreference() }));
    const onStorage = event => {
      if (event.key !== MOTION_STORAGE_KEY && event.key !== null) return;
      try {
        if (event.storageArea && event.storageArea !== window.localStorage) return;
        setSitePreference(previous => ({ ...previous, ...readSitePreference() }));
      } catch {
        setSitePreference(previous => ({ ...previous, persistence: 'session' }));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const previous = root.getAttribute('data-reduced-motion');
    return () => {
      if (previous === null) root.removeAttribute('data-reduced-motion');
      else root.setAttribute('data-reduced-motion', previous);
    };
  }, []);

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-reduced-motion', String(reducedMotion));
  }, [reducedMotion]);

  const setUserReducedMotion = useCallback(value => {
    if (typeof value !== 'boolean') throw new TypeError('Motion preference must be a boolean');
    let persistence = 'browser';
    try {
      const raw = String(value);
      window.localStorage.setItem(MOTION_STORAGE_KEY, raw);
      if (window.localStorage.getItem(MOTION_STORAGE_KEY) !== raw) throw new Error('Motion preference was not saved');
    } catch {
      persistence = 'session';
    }
    setSitePreference({ userReducedMotion: value, persistence, ready: true });
  }, []);

  const preferences = useMemo(() => ({ ...sitePreference, systemReducedMotion, systemPreferenceAvailable, reducedMotion, setUserReducedMotion }), [sitePreference, systemReducedMotion, systemPreferenceAvailable, reducedMotion, setUserReducedMotion]);
  return <MotionPreferenceContext.Provider value={preferences}>{children}</MotionPreferenceContext.Provider>;
}
