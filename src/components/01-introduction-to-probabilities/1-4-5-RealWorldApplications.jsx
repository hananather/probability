"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "@/utils/d3-utils";
import { colors, typography, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { Button } from '../ui/button';
import { 
  Dices, Users, Pizza, CreditCard, Trophy, Coffee,
  RefreshCw, Check, X
} from 'lucide-react';

const colorScheme = createColorScheme('probability');

// Helper function to calculate combinations
const combination = (n, r) => {
  if (r > n || r < 0) return 0;
  if (r === 0 || r === n) return 1;
  let result = 1;
  for (let i = 0; i < r; i++) {
    result = result * (n - i) / (i + 1);
  }
  return Math.round(result);
};

// Individual application components
function LotteryApp() {
  const [selected, setSelected] = useState(new Set());
  const n = 10, r = 3;
  
  const handleClick = (num) => {
    const newSelected = new Set(selected);
    if (newSelected.has(num)) {
      newSelected.delete(num);
    } else if (newSelected.size < r) {
      newSelected.add(num);
    }
    setSelected(newSelected);
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Mini Lottery: Pick 3 from 10</h4>
        
        <div className="grid grid-cols-5 gap-2 mb-4">
          {[...Array(n)].map((_, i) => {
            const num = i + 1;
            const isSelected = selected.has(num);
            return (
              <button
                key={num}
                onClick={() => handleClick(num)}
                className={cn(
                  "w-10 h-10 rounded-full font-mono font-bold text-sm transition-all",
                  isSelected ? 
                    "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg scale-110" :
                    "bg-gray-700 hover:bg-gray-600 text-gray-300"
                )}
              >
                {num}
              </button>
            );
          })}
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Selected: {selected.size}/{r}</p>
          {selected.size === r && (
            <p className="text-sm font-mono text-yellow-400">
              C(10,3) = {combination(n, r)} ways
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function TeamSelectionApp() {
  const [selected, setSelected] = useState(new Set());
  const players = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];
  const n = players.length, r = 5;
  
  const togglePlayer = (index) => {
    const newSelected = new Set(selected);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else if (newSelected.size < r) {
      newSelected.add(index);
    }
    setSelected(newSelected);
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Soccer Team: Pick 5 from 8 players</h4>
        
        <div className="grid grid-cols-4 gap-2 mb-4">
          {players.map((player, i) => {
            const isSelected = selected.has(i);
            return (
              <button
                key={i}
                onClick={() => togglePlayer(i)}
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-medium transition-all",
                  isSelected ? 
                    "bg-gradient-to-r from-green-500 to-emerald-500 text-white" :
                    "bg-gray-700 hover:bg-gray-600 text-gray-300"
                )}
              >
                {player}
              </button>
            );
          })}
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Team size: {selected.size}/{r}</p>
          {selected.size === r && (
            <div>
              <p className="text-sm font-mono text-yellow-400">
                C(8,5) = {combination(n, r)} teams
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Order doesn't matter - just the group!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MenuChoicesApp() {
  const [selected, setSelected] = useState(new Set());
  const dishes = ['Pasta', 'Pizza', 'Salad', 'Soup', 'Burger', 'Tacos'];
  const n = dishes.length, r = 3;
  
  const toggleDish = (index) => {
    const newSelected = new Set(selected);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else if (newSelected.size < r) {
      newSelected.add(index);
    }
    setSelected(newSelected);
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Menu Combo: Choose 3 dishes</h4>
        
        <div className="grid grid-cols-3 gap-3 mb-4">
          {dishes.map((dish, i) => {
            const isSelected = selected.has(i);
            return (
              <button
                key={i}
                onClick={() => toggleDish(i)}
                className={cn(
                  "px-4 py-3 rounded-lg text-sm font-medium transition-all flex flex-col items-center gap-1",
                  isSelected ? 
                    "bg-gradient-to-r from-orange-500 to-red-500 text-white scale-105" :
                    "bg-gray-700 hover:bg-gray-600 text-gray-300"
                )}
              >
                <Coffee className="w-5 h-5" />
                {dish}
              </button>
            );
          })}
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Selected: {selected.size}/{r}</p>
          {selected.size === r && (
            <p className="text-sm font-mono text-yellow-400">
              C(6,3) = {combination(n, r)} combos
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function CommitteeApp() {
  const [selected, setSelected] = useState(new Set());
  const members = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const n = members.length, r = 4;
  
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 240;
    const height = 200;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 70;
    
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Draw members in a circle
    members.forEach((member, i) => {
      const angle = (i / members.length) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      const g = svg.append("g")
        .attr("transform", `translate(${x}, ${y})`)
        .style("cursor", "pointer")
        .on("click", () => {
          const newSelected = new Set(selected);
          if (newSelected.has(i)) {
            newSelected.delete(i);
          } else if (newSelected.size < r) {
            newSelected.add(i);
          }
          setSelected(newSelected);
        });
      
      const isSelected = selected.has(i);
      
      g.append("circle")
        .attr("r", 20)
        .attr("fill", isSelected ? colorScheme.chart.primary : "#374151")
        .attr("stroke", isSelected ? colorScheme.chart.secondary : "#4b5563")
        .attr("stroke-width", 2)
        .style("transition", "all 200ms");
      
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", isSelected ? "white" : "#e5e7eb")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("pointer-events", "none")
        .text(member);
    });
    
    // Draw connections between selected members
    const selectedArray = Array.from(selected);
    for (let i = 0; i < selectedArray.length; i++) {
      for (let j = i + 1; j < selectedArray.length; j++) {
        const angle1 = (selectedArray[i] / members.length) * 2 * Math.PI - Math.PI / 2;
        const angle2 = (selectedArray[j] / members.length) * 2 * Math.PI - Math.PI / 2;
        const x1 = centerX + radius * Math.cos(angle1);
        const y1 = centerY + radius * Math.sin(angle1);
        const x2 = centerX + radius * Math.cos(angle2);
        const y2 = centerY + radius * Math.sin(angle2);
        
        svg.append("line")
          .attr("x1", x1)
          .attr("y1", y1)
          .attr("x2", x2)
          .attr("y2", y2)
          .attr("stroke", colorScheme.chart.tertiary)
          .attr("stroke-width", 1)
          .attr("opacity", 0.5);
      }
    }
  }, [selected]);
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Committee: Select 4 from 7</h4>
        
        <svg ref={svgRef} className="w-full max-w-xs" />
        
        <div className="text-center mt-3">
          <p className="text-xs text-gray-400 mb-1">Members: {selected.size}/{r}</p>
          {selected.size === r && (
            <p className="text-sm font-mono text-yellow-400">
              C(7,4) = {combination(n, r)} committees
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function PizzaToppingsApp() {
  const [selected, setSelected] = useState(new Set());
  const toppings = ['🍄', '🌶️', '🧀', '🥓', '🍅', '🫒', '🧅', '🌽'];
  const n = toppings.length, r = 4;
  
  const toggleTopping = (index) => {
    const newSelected = new Set(selected);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else if (newSelected.size < r) {
      newSelected.add(index);
    }
    setSelected(newSelected);
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Pizza Builder: Pick 4 toppings</h4>
        
        {/* Pizza visualization */}
        <div className="relative w-32 h-32 mb-4">
          <div className="absolute inset-0 bg-yellow-600 rounded-full shadow-lg" />
          <div className="absolute inset-2 bg-red-600 rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-1">
              {Array.from(selected).map(i => (
                <span key={i} className="text-2xl">
                  {toppings[i]}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-2 mb-3">
          {toppings.map((topping, i) => {
            const isSelected = selected.has(i);
            return (
              <button
                key={i}
                onClick={() => toggleTopping(i)}
                className={cn(
                  "w-12 h-12 rounded-lg text-xl transition-all",
                  isSelected ? 
                    "bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg scale-110" :
                    "bg-gray-700 hover:bg-gray-600"
                )}
              >
                {topping}
              </button>
            );
          })}
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Toppings: {selected.size}/{r}</p>
          {selected.size === r && (
            <p className="text-sm font-mono text-yellow-400">
              C(8,4) = {combination(n, r)} pizzas
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function CardHandsApp() {
  const [selected, setSelected] = useState(new Set());
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const cards = suits.slice(0, 2).flatMap(suit => 
    values.slice(0, 6).map(value => ({ suit, value }))
  );
  const n = cards.length, r = 5;
  
  const toggleCard = (index) => {
    const newSelected = new Set(selected);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else if (newSelected.size < r) {
      newSelected.add(index);
    }
    setSelected(newSelected);
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Card Hand: Pick 5 cards</h4>
        
        <div className="grid grid-cols-6 gap-1 mb-4">
          {cards.map((card, i) => {
            const isSelected = selected.has(i);
            const isRed = card.suit === '♥' || card.suit === '♦';
            return (
              <button
                key={i}
                onClick={() => toggleCard(i)}
                className={cn(
                  "w-10 h-14 rounded text-xs font-bold flex flex-col items-center justify-center transition-all",
                  isSelected ? 
                    "bg-white text-black scale-110 shadow-lg" :
                    "bg-gray-700 hover:bg-gray-600",
                  !isSelected && (isRed ? "text-red-400" : "text-gray-300")
                )}
              >
                <span>{card.value}</span>
                <span>{card.suit}</span>
              </button>
            );
          })}
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Hand: {selected.size}/{r}</p>
          {selected.size === r && (
            <p className="text-sm font-mono text-yellow-400">
              C(12,5) = {combination(n, r)} hands
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Application configurations
const applications = [
  { id: 'lottery', name: 'Lottery', icon: Dices, component: LotteryApp },
  { id: 'team', name: 'Team Selection', icon: Users, component: TeamSelectionApp },
  { id: 'menu', name: 'Menu Choices', icon: Coffee, component: MenuChoicesApp },
  { id: 'committee', name: 'Committee', icon: Trophy, component: CommitteeApp },
  { id: 'pizza', name: 'Pizza Toppings', icon: Pizza, component: PizzaToppingsApp },
  { id: 'cards', name: 'Card Hands', icon: CreditCard, component: CardHandsApp }
];

function RealWorldApplications({ n = 6, r = 3 }) {
  const [activeApp, setActiveApp] = useState('lottery');
  const ActiveComponent = applications.find(app => app.id === activeApp)?.component || LotteryApp;
  
  return (
    <div className="h-[450px] flex flex-col">
      {/* Application tabs - 40px */}
      <div className="h-[40px] flex items-center gap-2 px-4 border-b border-gray-700">
        {applications.map(app => {
          const Icon = app.icon;
          const isActive = activeApp === app.id;
          
          return (
            <button
              key={app.id}
              onClick={() => setActiveApp(app.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                isActive ? 
                  "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md" :
                  "bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{app.name}</span>
            </button>
          );
        })}
      </div>
      
      {/* Content area - 410px */}
      <div className="h-[410px] bg-gradient-to-br from-gray-800/30 to-gray-900/30">
        <ActiveComponent />
      </div>
    </div>
  );
}

export default RealWorldApplications;