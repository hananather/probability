import { lazy } from 'react';

// Lazy load all visualizations for better performance
export const Ch1Venn = lazy(() => import('./Ch1Venn'));
export const Ch2Binomial = lazy(() => import('./Ch2Binomial'));
export const Ch3Normal = lazy(() => import('./Ch3Normal'));
export const Ch4Sampling = lazy(() => import('./Ch4Sampling'));
export const Ch5Confidence = lazy(() => import('./Ch5Confidence'));
export const Ch6Hypothesis = lazy(() => import('./Ch6Hypothesis'));
export const Ch7Regression = lazy(() => import('./Ch7Regression'));
export const Ch8Network = lazy(() => import('./Ch8Network'));