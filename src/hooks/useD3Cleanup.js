import { useEffect, useRef, useState } from 'react';
import * as d3 from "@/utils/d3-utils";

/**
 * Custom hook for D3 visualizations with proper cleanup and error handling
 * @param {Function} drawFunction - Function that draws the visualization
 * @param {Array} dependencies - Array of dependencies that should trigger redraw
 * @param {Object} options - Configuration options
 * @returns {Object} { ref, error, isReady } - SVG ref, error state, and ready state
 */
export function useD3Cleanup(drawFunction, dependencies = [], options = {}) {
  const svgRef = useRef(null);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const { onError = null } = options;
  
  useEffect(() => {
    const svgElement = svgRef.current;
    
    if (!svgElement) {
      setIsReady(false);
      return;
    }

    setError(null);
    setIsReady(false);
    
    try {
      // Clear any existing content and transitions
      const svg = d3.select(svgElement);
      svg.selectAll("*").interrupt();
      svg.selectAll("*").remove();
      
      // Get dimensions safely
      let width = 600; // Default width
      let height = 400; // Default height
      
      try {
        const rect = svgElement.getBoundingClientRect();
        if (rect && rect.width > 0) {
          width = rect.width;
          height = rect.height || height;
        }
      } catch (dimensionError) {
        const error = new Error(`Failed to get SVG dimensions: ${dimensionError.message}`);
        error.type = 'DIMENSION_ERROR';
        error.originalError = dimensionError;
        
        if (onError) {
          onError(error);
        }
        
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.warn(error.message);
        }
        
        // Continue with defaults - this is not a fatal error
      }
      
      // Call the draw function with svg selection and dimensions
      drawFunction(svg, { width, height });
      setIsReady(true);
      
    } catch (drawError) {
      const error = new Error(`D3 visualization error: ${drawError.message}`);
      error.type = 'DRAW_ERROR';
      error.originalError = drawError;
      
      setError(error);
      setIsReady(false);
      
      if (onError) {
        onError(error);
      }
      
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('D3 draw function error:', drawError);
      }
    }
    
    // Cleanup function
    return () => {
      if (svgElement) {
        try {
          const svg = d3.select(svgElement);
          svg.selectAll("*").interrupt();
          svg.selectAll("*").remove();
        } catch (cleanupError) {
          // Cleanup errors are not critical, just log in development
          if (process.env.NODE_ENV === 'development') {
            console.warn('D3 cleanup error:', cleanupError);
          }
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawFunction, ...dependencies]);
  
  return { ref: svgRef, error, isReady };
}

/**
 * Hook for managing D3 animations with proper cleanup
 * @returns {Object} Animation control methods
 */
export function useD3Animation() {
  const animationRefs = useRef(new Set());
  const transitionRefs = useRef(new Set());
  
  const registerAnimation = (selection) => {
    animationRefs.current.add(selection);
    return selection;
  };
  
  const registerTransition = (transition) => {
    transitionRefs.current.add(transition);
    return transition;
  };
  
  const cleanup = () => {
    // Interrupt all transitions
    transitionRefs.current.forEach(transition => {
      try {
        transition.interrupt();
      } catch (e) {
        // Transition may already be complete
      }
    });
    
    // Clear all animations
    animationRefs.current.forEach(selection => {
      try {
        selection.interrupt();
        selection.remove();
      } catch (e) {
        // Selection may already be removed
      }
    });
    
    animationRefs.current.clear();
    transitionRefs.current.clear();
  };
  
  useEffect(() => {
    return cleanup;
  }, []);
  
  return {
    registerAnimation,
    registerTransition,
    cleanup
  };
}