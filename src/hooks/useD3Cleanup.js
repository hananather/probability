import { useEffect, useRef } from 'react';
import * as d3 from "@/utils/d3-utils";

/**
 * Custom hook for D3 visualizations with proper cleanup
 * @param {Function} drawFunction - Function that draws the visualization
 * @param {Array} dependencies - Array of dependencies that should trigger redraw
 * @returns {Object} ref - SVG ref to attach to the element
 */
export function useD3Cleanup(drawFunction, dependencies = []) {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    // Clear any existing content and transitions
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").interrupt();
    svg.selectAll("*").remove();
    
    // Get dimensions safely
    let width = 600; // Default width
    let height = 400; // Default height
    
    try {
      const rect = svgRef.current.getBoundingClientRect();
      if (rect && rect.width > 0) {
        width = rect.width;
        height = rect.height || height;
      }
    } catch (error) {
      console.warn('Failed to get SVG dimensions, using defaults:', error);
    }
    
    // Call the draw function with svg selection and dimensions
    drawFunction(svg, { width, height });
    
    // Cleanup function
    return () => {
      const svgElement = svgRef.current;
      if (svgElement) {
        const svg = d3.select(svgElement);
        svg.selectAll("*").interrupt();
        svg.selectAll("*").remove();
      }
    };
  }, [...dependencies, drawFunction]);
  
  return svgRef;
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