'use client';

import React, { useState, useEffect } from 'react';

const FloatingSymbols = React.memo(() => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Reduced set of symbols for better performance
  const symbols = [
    { symbol: '∑', delay: 0, x: 10, y: 15 },
    { symbol: '∫', delay: 2, x: 85, y: 25 },
    { symbol: 'π', delay: 4, x: 25, y: 70 },
    { symbol: 'μ', delay: 1, x: 70, y: 45 },
    { symbol: 'σ', delay: 3, x: 45, y: 85 },
    { symbol: '∞', delay: 5, x: 90, y: 60 },
    { symbol: 'λ', delay: 2.5, x: 15, y: 40 },
    { symbol: '√', delay: 1.5, x: 60, y: 20 },
    { symbol: '∂', delay: 3.5, x: 35, y: 55 },
    { symbol: 'Δ', delay: 4.5, x: 80, y: 80 },
    { symbol: 'θ', delay: 0.5, x: 50, y: 10 },
    { symbol: 'ℝ', delay: 2.2, x: 20, y: 90 },
    { symbol: '∇', delay: 3.8, x: 75, y: 35 },
    { symbol: 'Ω', delay: 1.3, x: 40, y: 65 },
    { symbol: '≈', delay: 4.2, x: 65, y: 75 },
    { symbol: 'ρ', delay: 2.8, x: 30, y: 30 },
    { symbol: '∈', delay: 0.8, x: 55, y: 50 },
    { symbol: 'ℕ', delay: 3.3, x: 95, y: 40 },
    { symbol: 'α', delay: 1.8, x: 5, y: 60 },
    { symbol: 'β', delay: 4.8, x: 85, y: 15 }
  ];
  
  if (!mounted) {
    return <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" />;
  }
  
  return (
    <>
      <style>{`
        @keyframes float {
          0% { 
            transform: translate3d(0px, 0px, 0) rotate(0deg) scale(1);
          }
          20% { 
            transform: translate3d(30px, -20px, 0) rotate(90deg) scale(1.1);
          }
          40% { 
            transform: translate3d(-20px, 10px, 0) rotate(180deg) scale(0.9);
          }
          60% { 
            transform: translate3d(20px, -30px, 0) rotate(270deg) scale(1.05);
          }
          80% { 
            transform: translate3d(-30px, 20px, 0) rotate(360deg) scale(0.95);
          }
          100% { 
            transform: translate3d(0px, 0px, 0) rotate(360deg) scale(1);
          }
        }
      `}</style>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {symbols.map((item, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              animationDelay: `${item.delay}s`,
              fontSize: index < 6 ? '3rem' : index < 12 ? '2rem' : '1.5rem',
              opacity: index < 6 ? 0.08 : index < 12 ? 0.1 : 0.12,
              color: 'rgb(163, 163, 163)',
              animation: 'float 25s infinite ease-in-out',
              willChange: 'transform',
              transform: 'translate3d(0, 0, 0)'
            }}
          >
            {item.symbol}
          </div>
        ))}
      </div>
    </>
  );
});

FloatingSymbols.displayName = 'FloatingSymbols';

export default FloatingSymbols;