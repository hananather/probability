"use client";
import React, { useState, useRef, useEffect } from "react";
import * as d3 from "@/utils/d3-utils";
import { colors, typography, cn, createColorScheme } from '../../lib/design-system';
import { Button } from '../ui/button';
import { ArrowRight, Shuffle, RotateCcw } from 'lucide-react';

const colorScheme = createColorScheme('probability');

// Calculate nCr
function nCr(n, r) {
  if (r > n || r < 0) return 0;
  if (r === 0 || r === n) return 1;
  
  let result = 1;
  for (let i = 0; i < r; i++) {
    result = result * (n - i) / (i + 1);
  }
  return Math.round(result);
}

// Calculate nPr
function nPr(n, r) {
  if (r > n || r < 0) return 0;
  let result = 1;
  for (let i = 0; i < r; i++) {
    result *= (n - i);
  }
  return result;
}

// Generate all permutations of selected items
function generatePermutations(items) {
  if (items.length <= 1) return [items];
  
  const result = [];
  for (let i = 0; i < items.length; i++) {
    const current = items[i];
    const remaining = items.filter((_, idx) => idx !== i);
    const remainingPerms = generatePermutations(remaining);
    
    for (const perm of remainingPerms) {
      result.push([current, ...perm]);
    }
  }
  return result;
}

function CombinationBuilder() {
  const [n, setN] = useState(6);
  const [r, setR] = useState(3);
  const [selectedItems, setSelectedItems] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [showPermutations, setShowPermutations] = useState(true);
  const availableRef = useRef(null);
  const selectedRef = useRef(null);
  const permutationsRef = useRef(null);

  // Get available items (not selected)
  const availableItems = Array.from({ length: n }, (_, i) => i + 1)
    .filter(item => !selectedItems.includes(item));

  // Get all permutations of selected items
  const permutations = selectedItems.length > 0 ? generatePermutations(selectedItems) : [];

  // Handle drag and drop
  const handleDragStart = (item, source) => {
    setDraggedItem({ item, source });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    if (!draggedItem) return;

    const { item, source } = draggedItem;

    if (source === 'available' && target === 'selected' && selectedItems.length < r) {
      setSelectedItems([...selectedItems, item]);
    } else if (source === 'selected' && target === 'available') {
      setSelectedItems(selectedItems.filter(i => i !== item));
    }

    setDraggedItem(null);
  };

  // Click handlers for touch/mobile
  const handleItemClick = (item, source) => {
    if (source === 'available' && selectedItems.length < r) {
      setSelectedItems([...selectedItems, item]);
    } else if (source === 'selected') {
      setSelectedItems(selectedItems.filter(i => i !== item));
    }
  };

  const resetSelection = () => {
    setSelectedItems([]);
  };

  const randomSelection = () => {
    const shuffled = Array.from({ length: n }, (_, i) => i + 1)
      .sort(() => Math.random() - 0.5);
    setSelectedItems(shuffled.slice(0, r));
  };

  // Draw items in each column
  useEffect(() => {
    // Draw available items
    if (availableRef.current) {
      const svg = d3.select(availableRef.current);
      svg.selectAll("*").remove();
      
      const width = availableRef.current.clientWidth;
      const height = 340;
      svg.attr("viewBox", `0 0 ${width} ${height}`);
      
      const itemSize = Math.min(45, (height - 20) / Math.max(6, n));
      const spacing = itemSize * 0.3;
      
      availableItems.forEach((item, i) => {
        const y = 10 + i * (itemSize + spacing);
        const group = svg.append("g")
          .attr("transform", `translate(${width/2}, ${y + itemSize/2})`);
        
        // Item circle
        const circle = group.append("circle")
          .attr("r", itemSize/2)
          .attr("fill", "#1a1a1a")
          .attr("stroke", colorScheme.chart.secondary)
          .attr("stroke-width", 2)
          .attr("cursor", "pointer")
          .style("transition", "all 200ms ease");
        
        // Item number
        group.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .attr("fill", colors.chart.text)
          .style("font-size", "16px")
          .style("font-weight", "600")
          .style("font-family", "monospace")
          .style("pointer-events", "none")
          .text(item);
        
        // Hover effect
        group.on("mouseenter", function() {
          circle.attr("fill", "#2a2a2a")
                .attr("stroke", colorScheme.chart.primary);
        })
        .on("mouseleave", function() {
          circle.attr("fill", "#1a1a1a")
                .attr("stroke", colorScheme.chart.secondary);
        })
        .on("click", () => handleItemClick(item, 'available'))
        .attr("draggable", true)
        .on("dragstart", () => handleDragStart(item, 'available'));
      });
    }

    // Draw selected items
    if (selectedRef.current) {
      const svg = d3.select(selectedRef.current);
      svg.selectAll("*").remove();
      
      const width = selectedRef.current.clientWidth;
      const height = 340;
      svg.attr("viewBox", `0 0 ${width} ${height}`);
      
      const itemSize = Math.min(50, (height - 40) / r);
      const spacing = itemSize * 0.3;
      
      // Draw combination notation
      svg.append("text")
        .attr("x", width/2)
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.primary)
        .style("font-size", "18px")
        .style("font-weight", "600")
        .style("font-family", "monospace")
        .text(selectedItems.length === r ? `{${selectedItems.sort((a,b) => a-b).join(', ')}}` : '{ }');
      
      selectedItems.forEach((item, i) => {
        const y = 50 + i * (itemSize + spacing);
        const group = svg.append("g")
          .attr("transform", `translate(${width/2}, ${y + itemSize/2})`);
        
        // Item circle
        const circle = group.append("circle")
          .attr("r", itemSize/2)
          .attr("fill", colorScheme.chart.primary + "20")
          .attr("stroke", colorScheme.chart.primary)
          .attr("stroke-width", 2)
          .attr("cursor", "pointer")
          .style("transition", "all 200ms ease");
        
        // Item number
        group.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .attr("fill", "white")
          .style("font-size", "18px")
          .style("font-weight", "600")
          .style("font-family", "monospace")
          .style("pointer-events", "none")
          .text(item);
        
        // Hover effect
        group.on("mouseenter", function() {
          circle.attr("fill", colorScheme.chart.primary + "40");
        })
        .on("mouseleave", function() {
          circle.attr("fill", colorScheme.chart.primary + "20");
        })
        .on("click", () => handleItemClick(item, 'selected'))
        .attr("draggable", true)
        .on("dragstart", () => handleDragStart(item, 'selected'));
      });
      
      // Drop zone indicator
      if (selectedItems.length < r) {
        svg.append("rect")
          .attr("x", width/2 - 60)
          .attr("y", 50 + selectedItems.length * (itemSize + spacing))
          .attr("width", 120)
          .attr("height", itemSize)
          .attr("fill", "none")
          .attr("stroke", colors.chart.grid)
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "4,4")
          .attr("rx", itemSize/2);
      }
    }

    // Draw permutations
    if (permutationsRef.current && showPermutations) {
      const svg = d3.select(permutationsRef.current);
      svg.selectAll("*").remove();
      
      const width = permutationsRef.current.clientWidth;
      const height = 340;
      svg.attr("viewBox", `0 0 ${width} ${height}`);
      
      if (permutations.length > 0) {
        const maxPerms = Math.min(24, permutations.length); // Show max 24 permutations
        const cols = Math.min(3, Math.ceil(Math.sqrt(maxPerms)));
        const rows = Math.ceil(maxPerms / cols);
        const cellWidth = (width - 20) / cols;
        const cellHeight = Math.min(40, (height - 40) / rows);
        
        svg.append("text")
          .attr("x", width/2)
          .attr("y", 20)
          .attr("text-anchor", "middle")
          .attr("fill", colorScheme.chart.tertiary)
          .style("font-size", "14px")
          .style("font-weight", "600")
          .text(`${permutations.length} Permutations`);
        
        permutations.slice(0, maxPerms).forEach((perm, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = 10 + col * cellWidth + cellWidth/2;
          const y = 35 + row * cellHeight + cellHeight/2;
          
          const group = svg.append("g")
            .attr("transform", `translate(${x}, ${y})`);
          
          group.append("rect")
            .attr("x", -cellWidth/2 + 5)
            .attr("y", -cellHeight/2 + 2)
            .attr("width", cellWidth - 10)
            .attr("height", cellHeight - 4)
            .attr("fill", "#1a1a1a")
            .attr("stroke", colorScheme.chart.tertiary + "60")
            .attr("stroke-width", 1)
            .attr("rx", 4);
          
          group.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("fill", colorScheme.chart.tertiary)
            .style("font-size", "14px")
            .style("font-family", "monospace")
            .text(`[${perm.join(',')}]`);
        });
        
        if (permutations.length > maxPerms) {
          svg.append("text")
            .attr("x", width/2)
            .attr("y", height - 10)
            .attr("text-anchor", "middle")
            .attr("fill", colors.chart.text)
            .style("font-size", "12px")
            .text(`... and ${permutations.length - maxPerms} more`);
        }
      }
    }
  }, [availableItems, selectedItems, permutations, showPermutations, n, r]);

  return (
    <div className="w-full" style={{ height: '450px' }}>
      {/* Item Selector Bar - 60px */}
      <div className="h-[60px] bg-neutral-800/50 rounded-t-lg border-b border-neutral-700 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold text-white">Combination Builder</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-neutral-400">n =</label>
              <input
                type="range"
                min="3"
                max="8"
                value={n}
                onChange={(e) => {
                  const newN = Number(e.target.value);
                  setN(newN);
                  setR(Math.min(r, newN));
                  setSelectedItems([]);
                }}
                className="w-20"
              />
              <span className="text-sm font-mono text-yellow-400 w-4">{n}</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-neutral-400">r =</label>
              <input
                type="range"
                min="1"
                max={n}
                value={r}
                onChange={(e) => {
                  setR(Number(e.target.value));
                  setSelectedItems([]);
                }}
                className="w-20"
              />
              <span className="text-sm font-mono text-purple-400 w-4">{r}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-sm font-mono text-neutral-300">
            C({n},{r}) = <span className="text-yellow-400 font-semibold">{nCr(n, r)}</span>
          </div>
          <div className="text-xs text-neutral-500">|</div>
          <div className="text-sm font-mono text-neutral-300">
            P({n},{r}) = <span className="text-purple-400 font-semibold">{nPr(n, r)}</span>
          </div>
        </div>
      </div>
      
      {/* Main Area - 340px (3 columns) */}
      <div 
        className="h-[340px] bg-neutral-900/30 flex"
        onDragOver={handleDragOver}
      >
        {/* Available Items Column */}
        <div 
          className="flex-1 border-r border-neutral-700 relative"
          onDrop={(e) => handleDrop(e, 'available')}
        >
          <div className="absolute top-2 left-2 right-2 text-center">
            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
              Available Items
            </h4>
            <p className="text-xs text-neutral-500 mt-1">Click or drag →</p>
          </div>
          <svg ref={availableRef} className="w-full h-full pt-12" />
        </div>
        
        {/* Selected Items Column */}
        <div 
          className="flex-1 border-r border-neutral-700 relative bg-neutral-800/20"
          onDrop={(e) => handleDrop(e, 'selected')}
        >
          <div className="absolute top-2 left-2 right-2 text-center">
            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
              Combination (Order Doesn't Matter)
            </h4>
            <p className="text-xs text-neutral-500 mt-1">
              {selectedItems.length}/{r} selected
            </p>
          </div>
          <svg ref={selectedRef} className="w-full h-full pt-12" />
        </div>
        
        {/* Permutations Column */}
        <div className="flex-1 relative">
          <div className="absolute top-2 left-2 right-2 text-center">
            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
              All Permutations (Order Matters)
            </h4>
            <p className="text-xs text-neutral-500 mt-1">
              {selectedItems.length === r ? `${r}! = ${permutations.length} arrangements` : 'Select items to see'}
            </p>
          </div>
          {showPermutations && (
            <svg ref={permutationsRef} className="w-full h-full pt-12" />
          )}
        </div>
      </div>
      
      {/* Action Bar - 50px */}
      <div className="h-[50px] bg-neutral-800/30 rounded-b-lg border-t border-neutral-700 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="neutral"
            size="xs"
            onClick={resetSelection}
            disabled={selectedItems.length === 0}
            className="flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
          <Button
            variant="primary"
            size="xs"
            onClick={randomSelection}
            className="flex items-center gap-1"
          >
            <Shuffle className="w-3 h-3" />
            Random
          </Button>
        </div>
        
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="text-neutral-300">
              <span className="font-mono">{nCr(n, r)}</span> ways to choose
            </span>
          </div>
          <div className="text-neutral-600">×</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-400" />
            <span className="text-neutral-300">
              <span className="font-mono">{r}!</span> ways to arrange = <span className="font-mono">{nPr(n, r)}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CombinationBuilder;