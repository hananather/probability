import { useEffect, useRef } from 'react';

/**
 * Custom hook for managing intervals and timeouts with automatic cleanup
 * Prevents memory leaks from animations
 */
export function useAnimationCleanup() {
  const intervalsRef = useRef(new Set());
  const timeoutsRef = useRef(new Set());
  const animationFramesRef = useRef(new Set());
  
  /**
   * Set interval with automatic cleanup
   */
  const setCleanInterval = (callback, delay) => {
    const id = setInterval(callback, delay);
    intervalsRef.current.add(id);
    return id;
  };
  
  /**
   * Set timeout with automatic cleanup
   */
  const setCleanTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.add(id);
    return id;
  };
  
  /**
   * Request animation frame with automatic cleanup
   */
  const setCleanAnimationFrame = (callback) => {
    const id = requestAnimationFrame(callback);
    animationFramesRef.current.add(id);
    return id;
  };
  
  /**
   * Clear specific interval
   */
  const clearCleanInterval = (id) => {
    clearInterval(id);
    intervalsRef.current.delete(id);
  };
  
  /**
   * Clear specific timeout
   */
  const clearCleanTimeout = (id) => {
    clearTimeout(id);
    timeoutsRef.current.delete(id);
  };
  
  /**
   * Cancel specific animation frame
   */
  const cancelCleanAnimationFrame = (id) => {
    cancelAnimationFrame(id);
    animationFramesRef.current.delete(id);
  };
  
  /**
   * Clear all animations
   */
  const clearAll = () => {
    // Clear all intervals
    intervalsRef.current.forEach(id => clearInterval(id));
    intervalsRef.current.clear();
    
    // Clear all timeouts
    timeoutsRef.current.forEach(id => clearTimeout(id));
    timeoutsRef.current.clear();
    
    // Cancel all animation frames
    animationFramesRef.current.forEach(id => cancelAnimationFrame(id));
    animationFramesRef.current.clear();
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return clearAll;
  }, []);
  
  return {
    setCleanInterval,
    setCleanTimeout,
    setCleanAnimationFrame,
    clearCleanInterval,
    clearCleanTimeout,
    cancelCleanAnimationFrame,
    clearAll
  };
}

/**
 * Hook for managing running/stopped animation state
 */
export function useAnimationState() {
  const isRunningRef = useRef(false);
  const animationCleanup = useAnimationCleanup();
  
  const startAnimation = (animationFn, duration) => {
    if (isRunningRef.current) return false;
    
    isRunningRef.current = true;
    
    // Run the animation
    animationFn();
    
    // Auto-stop after duration if provided
    if (duration) {
      animationCleanup.setCleanTimeout(() => {
        isRunningRef.current = false;
      }, duration);
    }
    
    return true;
  };
  
  const stopAnimation = () => {
    isRunningRef.current = false;
    animationCleanup.clearAll();
  };
  
  const isRunning = () => isRunningRef.current;
  
  // Cleanup on unmount
  useEffect(() => {
    return stopAnimation;
  }, []);
  
  return {
    startAnimation,
    stopAnimation,
    isRunning,
    animationCleanup
  };
}