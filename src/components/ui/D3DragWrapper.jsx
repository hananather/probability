import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useD3Drag, useD3ValueDrag } from '../../hooks/useD3Drag';

/**
 * Wrapper component for smooth D3 dragging
 * Prevents SVG re-rendering issues by managing draggable elements separately
 */
export function D3DragWrapper({
  children,
  onDrag,
  onStart,
  onEnd,
  constraints,
  className,
  initialPosition = { x: 0, y: 0 }
}) {
  const { dragRef } = useD3Drag({
    onDrag,
    onStart,
    onEnd,
    constraints
  });

  return (
    <g ref={dragRef} className={className} transform={`translate(${initialPosition.x}, ${initialPosition.y})`}>
      {children}
    </g>
  );
}

/**
 * Draggable handle component for value-based dragging
 * Commonly used for sliders, threshold adjusters, etc.
 */
export function DraggableHandle({
  value,
  onChange,
  scale,
  axis = 'x',
  bounds,
  renderHandle,
  className = '',
  style = {}
}) {
  const dragRef = useD3ValueDrag({
    value,
    onChange,
    scale,
    axis,
    bounds
  });

  const position = scale(value);
  const transform = axis === 'x' 
    ? `translate(${position}, 0)` 
    : `translate(0, ${position})`;

  // Default handle if none provided
  const defaultHandle = (
    <g>
      <circle r="8" fill="currentColor" stroke="#fff" strokeWidth="2" />
      <line 
        x1={axis === 'x' ? 0 : -15} 
        y1={axis === 'x' ? -15 : 0} 
        x2={axis === 'x' ? 0 : 15} 
        y2={axis === 'x' ? 15 : 0} 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeDasharray="5,5" 
      />
    </g>
  );

  return (
    <g 
      ref={dragRef} 
      className={`draggable-handle ${className}`}
      style={{ cursor: axis === 'x' ? 'ew-resize' : 'ns-resize', ...style }}
      transform={transform}
    >
      {renderHandle ? renderHandle(value) : defaultHandle}
    </g>
  );
}

/**
 * Component for managing multiple draggable bars (like probability distributions)
 * Handles redistribution logic and smooth updates
 */
export function DraggableBars({
  data,
  xScale,
  yScale,
  onChange,
  barWidth,
  redistributeLogic = 'proportional',
  className = '',
  barStyle = {},
  labelFormat = (d) => `${(d * 100).toFixed(0)}%`
}) {
  const barsRef = useRef([]);
  const labelsRef = useRef([]);

  useEffect(() => {
    // Apply drag behavior to each bar
    barsRef.current.forEach((bar, index) => {
      if (!bar) return;

      const drag = d3.drag()
        .on('start', function() {
          d3.select(this)
            .style('cursor', 'grabbing')
            .attr('opacity', 1);
        })
        .on('drag', function(event) {
          const newValue = Math.max(0, Math.min(1, yScale.invert(event.y)));
          const oldValue = data[index].value;
          
          // Calculate redistributed values based on strategy
          let updatedData;
          if (redistributeLogic === 'proportional') {
            // Redistribute proportionally among other bars
            updatedData = data.map((d, i) => {
              if (i === index) {
                return { ...d, value: newValue };
              }
              const scale = oldValue === 1 
                ? (1 - newValue) / (data.length - 1)
                : d.value * (1 - newValue) / (1 - oldValue);
              return { ...d, value: Math.max(0, scale) };
            });
            
            // Normalize to ensure sum = 1
            const sum = updatedData.reduce((acc, d) => acc + d.value, 0);
            if (sum > 0) {
              updatedData = updatedData.map(d => ({ ...d, value: d.value / sum }));
            }
          }
          
          // Update bars and labels directly for smooth animation
          barsRef.current.forEach((barEl, i) => {
            if (barEl) {
              d3.select(barEl)
                .attr('y', yScale(updatedData[i].value))
                .attr('height', yScale(0) - yScale(updatedData[i].value));
            }
          });
          
          labelsRef.current.forEach((label, i) => {
            if (label) {
              d3.select(label)
                .attr('y', yScale(updatedData[i].value) - 5)
                .text(labelFormat(updatedData[i].value));
            }
          });
          
          // Notify parent component
          if (onChange) {
            onChange(updatedData);
          }
        })
        .on('end', function() {
          d3.select(this)
            .style('cursor', 'ns-resize')
            .attr('opacity', 0.8);
        });

      d3.select(bar).call(drag);
    });

    // Cleanup
    return () => {
      barsRef.current.forEach(bar => {
        if (bar) d3.select(bar).on('.drag', null);
      });
    };
  }, [data, xScale, yScale, onChange, redistributeLogic, labelFormat]);

  return (
    <g className={`draggable-bars ${className}`}>
      {data.map((d, i) => (
        <g key={d.id || i}>
          <rect
            ref={el => barsRef.current[i] = el}
            x={xScale(d.label || i)}
            y={yScale(d.value)}
            width={barWidth || xScale.bandwidth()}
            height={yScale(0) - yScale(d.value)}
            fill={d.color || '#60a5fa'}
            opacity={0.8}
            style={{ cursor: 'ns-resize', ...barStyle }}
            rx={4}
          />
          <text
            ref={el => labelsRef.current[i] = el}
            x={xScale(d.label || i) + (barWidth || xScale.bandwidth()) / 2}
            y={yScale(d.value) - 5}
            textAnchor="middle"
            fill="#e5e7eb"
            fontSize="12px"
            pointerEvents="none"
          >
            {labelFormat(d.value)}
          </text>
        </g>
      ))}
    </g>
  );
}

/**
 * Higher-order component to prevent SVG re-rendering during drag operations
 * Wraps your visualization component and manages drag state separately
 */
export function withSmoothDragging(VisualizationComponent) {
  return function SmoothDraggingWrapper(props) {
    const svgRef = useRef(null);
    const isInitialized = useRef(false);

    useEffect(() => {
      // Only initialize once
      if (!isInitialized.current && svgRef.current) {
        isInitialized.current = true;
      }
    }, []);

    return (
      <VisualizationComponent
        {...props}
        svgRef={svgRef}
        isInitialized={isInitialized.current}
      />
    );
  };
}