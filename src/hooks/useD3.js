"use client";
import { useRef, useEffect } from "react";
import * as d3 from "d3";

/**
 * useD3 – bind an imperative D3 draw function to an SVG element.
 * @param {(svg: d3.Selection, dimensions: {w,h}) => void} renderFn
 * @param {Array<any>} deps react deps that should re-trigger renderFn
 */
export default function useD3(renderFn, deps = []) {
  const ref = useRef(null);
  
  useEffect(() => {
    if (!ref.current || !ref.current.parentElement) return;
    
    try {
      const svg = d3.select(ref.current);
      const { clientWidth: w } = ref.current.parentElement;
      const h = +ref.current.getAttribute("height") || 320;
      
      renderFn(svg, { w, h });
      
      return () => {
        // Clean up any event listeners and clear the SVG
        svg.on('.', null);
        svg.selectAll('*').remove();
      };
    } catch (error) {
      console.error('Error in D3 render function:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  
  return ref;
}
