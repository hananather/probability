import { useEffect, useRef } from 'react';
import * as d3 from "@/utils/d3-utils";

/**
 * Custom hook for D3 visualizations with proper cleanup
 * @param {Function} renderFn - Function that creates the D3 visualization
 * @param {Array} dependencies - React dependencies array
 * @returns {React.RefObject} - Ref to attach to the SVG element
 */
export function useD3(renderFn, dependencies = []) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      // Clean up previous render
      d3.select(ref.current).selectAll('*').remove();
      
      // Create new visualization
      renderFn(d3.select(ref.current));
    }
    
    // Cleanup function
    return () => {
      const element = ref.current;
      if (element) {
        d3.select(element).selectAll('*').remove();
      }
    };
  }, [...dependencies, renderFn]);

  return ref;
}

/**
 * Hook for D3 transitions with cleanup
 * @param {number} duration - Transition duration in ms
 * @returns {Object} - Transition control object
 */
export function useD3Transition(duration = 300) {
  const transitionsRef = useRef(new Set());

  const addTransition = (transition) => {
    transitionsRef.current.add(transition);
    transition.on('end', () => {
      transitionsRef.current.delete(transition);
    });
  };

  const cancelAll = () => {
    transitionsRef.current.forEach(t => {
      if (t && typeof t.interrupt === 'function') {
        t.interrupt();
      }
    });
    transitionsRef.current.clear();
  };

  useEffect(() => {
    return () => cancelAll();
  }, []);

  return { addTransition, cancelAll, duration };
}

/**
 * Hook for D3 animations with proper cleanup
 * @returns {Object} - Animation control object
 */
export function useD3Animation() {
  const animationFrameRef = useRef(null);
  const animationsRef = useRef(new Set());

  const startAnimation = (animationFn) => {
    const animate = () => {
      if (animationFn()) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const stopAnimation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const addAnimatedElement = (element) => {
    animationsRef.current.add(element);
  };

  const removeAnimatedElement = (element) => {
    animationsRef.current.delete(element);
    if (element && element.remove) {
      element.remove();
    }
  };

  const clearAllAnimations = () => {
    stopAnimation();
    animationsRef.current.forEach(element => {
      if (element && element.remove) {
        element.remove();
      }
    });
    animationsRef.current.clear();
  };

  useEffect(() => {
    return () => clearAllAnimations();
  }, [clearAllAnimations]);

  return {
    startAnimation,
    stopAnimation,
    addAnimatedElement,
    removeAnimatedElement,
    clearAllAnimations
  };
}

/**
 * Hook for responsive D3 charts
 * @param {Function} renderFn - Render function that receives dimensions
 * @param {Array} dependencies - React dependencies
 * @returns {React.RefObject} - Ref to attach to container
 */
export function useResponsiveD3(renderFn, dependencies = []) {
  const containerRef = useRef(null);
  const resizeObserverRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      const { width, height } = containerRef.current.getBoundingClientRect();
      if (width > 0 && height > 0) {
        d3.select(containerRef.current).selectAll('*').remove();
        renderFn(d3.select(containerRef.current), { width, height });
      }
    };

    // Initial render
    updateDimensions();

    // Setup resize observer
    resizeObserverRef.current = new ResizeObserver(updateDimensions);
    resizeObserverRef.current.observe(containerRef.current);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [...dependencies, renderFn]);

  return containerRef;
}

/**
 * Hook for D3 scales with automatic domain updates
 * @param {string} scaleType - Type of scale (linear, band, etc.)
 * @param {Object} config - Scale configuration
 * @returns {Object} - Scale object with update methods
 */
export function useD3Scale(scaleType = 'linear', config = {}) {
  const scaleRef = useRef(null);

  useEffect(() => {
    switch (scaleType) {
      case 'linear':
        scaleRef.current = d3.scaleLinear();
        break;
      case 'band':
        scaleRef.current = d3.scaleBand();
        break;
      case 'ordinal':
        scaleRef.current = d3.scaleOrdinal();
        break;
      default:
        scaleRef.current = d3.scaleLinear();
    }

    if (config.domain) scaleRef.current.domain(config.domain);
    if (config.range) scaleRef.current.range(config.range);
    if (config.padding && scaleRef.current.padding) {
      scaleRef.current.padding(config.padding);
    }
  }, [scaleType, config.domain, config.range, config.padding]);

  const updateDomain = (domain) => {
    if (scaleRef.current) {
      scaleRef.current.domain(domain);
    }
  };

  const updateRange = (range) => {
    if (scaleRef.current) {
      scaleRef.current.range(range);
    }
  };

  return {
    scale: scaleRef.current,
    updateDomain,
    updateRange
  };
}