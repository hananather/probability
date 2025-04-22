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
    if (!ref.current) return;
    const { clientWidth: w } = ref.current.parentElement;
    const h = +ref.current.getAttribute("height") || 320;
    renderFn(d3.select(ref.current), { w, h });
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}
