import { useEffect, useRef, useCallback } from 'react';
import * as d3 from "@/utils/d3-utils";

/**
 * A reusable hook for smooth D3 dragging functionality
 * 
 * @param {Object} options Configuration options
 * @param {Function} options.onDrag - Callback fired during drag with (x, y, event)
 * @param {Function} options.onStart - Callback fired when drag starts
 * @param {Function} options.onEnd - Callback fired when drag ends
 * @param {Object} options.constraints - Optional constraints {minX, maxX, minY, maxY}
 * @param {boolean} options.updateDuringDrag - Whether to update React state during drag (default: true)
 * @returns {Object} { dragRef, position, setPosition }
 */
export function useD3Drag({
  onDrag,
  onStart,
  onEnd,
  constraints = {},
  updateDuringDrag = true
}) {
  const dragRef = useRef(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  // Initialize drag behavior
  useEffect(() => {
    if (!dragRef.current) return;

    const element = d3.select(dragRef.current);
    
    // Clear any existing drag behavior
    element.on('.drag', null);

    // Create drag behavior
    const drag = d3.drag()
      .on('start', function(event) {
        isDraggingRef.current = true;
        
        // Add dragging class for styling
        d3.select(this).classed('dragging', true);
        
        if (onStart) {
          onStart(event);
        }
      })
      .on('drag', function(event) {
        let { x, y } = event;
        
        // Apply constraints if provided
        if (constraints.minX !== undefined) x = Math.max(constraints.minX, x);
        if (constraints.maxX !== undefined) x = Math.min(constraints.maxX, x);
        if (constraints.minY !== undefined) y = Math.max(constraints.minY, y);
        if (constraints.maxY !== undefined) y = Math.min(constraints.maxY, y);
        
        // Store position for direct DOM updates
        positionRef.current = { x, y };
        
        // Direct DOM update for smooth dragging
        if (updateDuringDrag) {
          d3.select(this)
            .attr('transform', `translate(${x}, ${y})`)
            .attr('cx', x)
            .attr('cy', y)
            .attr('x', x)
            .attr('y', y);
        }
        
        if (onDrag) {
          onDrag(x, y, event);
        }
      })
      .on('end', function(event) {
        isDraggingRef.current = false;
        
        // Remove dragging class
        d3.select(this).classed('dragging', false);
        
        if (onEnd) {
          onEnd(positionRef.current.x, positionRef.current.y, event);
        }
      });

    // Apply drag behavior
    element.call(drag);

    // Cleanup
    return () => {
      element.on('.drag', null);
    };
  }, [onDrag, onStart, onEnd, constraints, updateDuringDrag]);

  return {
    dragRef,
    isDragging: isDraggingRef.current,
    position: positionRef.current
  };
}

/**
 * Hook for dragging with value mapping (e.g., dragging to change a numeric value)
 * 
 * @param {Object} options Configuration options
 * @param {number} options.value - Current value
 * @param {Function} options.onChange - Callback to update the value
 * @param {Object} options.scale - D3 scale for mapping position to value
 * @param {string} options.axis - 'x' or 'y' axis for dragging
 * @param {number[]} options.bounds - [min, max] value bounds
 */
export function useD3ValueDrag({
  value,
  onChange,
  scale,
  axis = 'x',
  bounds = [-Infinity, Infinity]
}) {
  const handleDrag = useCallback((x, y) => {
    const position = axis === 'x' ? x : y;
    const newValue = scale.invert(position);
    const clampedValue = Math.max(bounds[0], Math.min(bounds[1], newValue));
    
    if (onChange && clampedValue !== value) {
      onChange(clampedValue);
    }
  }, [value, onChange, scale, axis, bounds]);

  const { dragRef } = useD3Drag({
    onDrag: handleDrag,
    constraints: axis === 'x' ? {
      minX: scale(bounds[0]),
      maxX: scale(bounds[1])
    } : {
      minY: scale(bounds[1]), // Note: y scale is often inverted
      maxY: scale(bounds[0])
    }
  });

  return dragRef;
}

/**
 * Hook for dragging rectangular regions (like probability bars)
 * 
 * @param {Object} options Configuration options
 * @param {number[]} options.values - Array of values (e.g., probabilities)
 * @param {Function} options.onChange - Callback to update values
 * @param {Object} options.xScale - D3 scale for x positioning
 * @param {Object} options.yScale - D3 scale for y values
 * @param {Function} options.redistributeValues - Function to redistribute other values
 */
export function useD3BarDrag({
  values,
  onChange,
  xScale,
  yScale,
  redistributeValues
}) {
  const dragRefs = useRef([]);
  
  useEffect(() => {
    dragRefs.current.forEach((ref, index) => {
      if (!ref) return;
      
      const element = d3.select(ref);
      
      const drag = d3.drag()
        .on('drag', function(event) {
          const newValue = Math.max(0, Math.min(1, yScale.invert(event.y)));
          
          // Calculate redistributed values
          let updatedValues;
          if (redistributeValues) {
            updatedValues = redistributeValues(values, index, newValue);
          } else {
            // Default redistribution logic
            updatedValues = [...values];
            updatedValues[index] = newValue;
          }
          
          // Update bars directly for smooth animation
          dragRefs.current.forEach((barRef, i) => {
            if (barRef) {
              d3.select(barRef)
                .attr('y', yScale(updatedValues[i]))
                .attr('height', yScale(0) - yScale(updatedValues[i]));
            }
          });
          
          // Update React state
          if (onChange) {
            onChange(updatedValues);
          }
        });
      
      element.call(drag);
    });
    
    // Store refs in cleanup closure to avoid stale reference warning
    const currentRefs = dragRefs.current;
    return () => {
      currentRefs.forEach(ref => {
        if (ref) d3.select(ref).on('.drag', null);
      });
    };
  }, [values, onChange, xScale, yScale, redistributeValues]);
  
  return dragRefs;
}