"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import Script from 'next/script';

const MathJaxContext = createContext({ ready: false });

export const useMathJax = () => useContext(MathJaxContext);

export function MathJaxProvider({ children }) {
  const [mathJaxReady, setMathJaxReady] = useState(false);

  useEffect(() => {
    // Check if MathJax is already loaded
    if (window.MathJax && window.MathJax.startup) {
      setMathJaxReady(true);
    }
    
    // Listen for MathJax ready event
    const handleMathJaxReady = () => {
      setMathJaxReady(true);
    };
    
    window.addEventListener('MathJaxReady', handleMathJaxReady);
    
    return () => {
      window.removeEventListener('MathJaxReady', handleMathJaxReady);
    };
  }, []);

  return (
    <MathJaxContext.Provider value={{ ready: mathJaxReady }}>
      <Script
        id="mathjax-config"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.MathJax = {
              tex: {
                inlineMath: [['\\\\(', '\\\\)']],
                displayMath: [['\\\\[', '\\\\]']],
              },
              startup: {
                typeset: false,
                ready: () => {
                  MathJax.startup.defaultReady();
                  // Dispatch custom event when MathJax is ready
                  window.dispatchEvent(new Event('MathJaxReady'));
                }
              },
              options: {
                renderActions: {
                  addMenu: [],
                  checkLoading: []
                }
              }
            };
          `,
        }}
      />
      <Script
        id="mathjax-script"
        src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"
        strategy="afterInteractive"
      />
      {children}
    </MathJaxContext.Provider>
  );
}

// Reusable hook for processing MathJax
export function useMathJaxProcessor() {
  const { ready } = useMathJax();
  const [isProcessing, setIsProcessing] = useState(false);

  const processMathJax = React.useCallback((element) => {
    if (!ready || !element || isProcessing) return Promise.resolve();
    
    setIsProcessing(true);
    
    // Create a promise that resolves when MathJax is done
    return new Promise((resolve) => {
      if (window.MathJax && window.MathJax.typesetPromise) {
        // Clear previous rendering
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([element]);
        }
        
        // Process the element
        window.MathJax.typesetPromise([element])
          .then(() => {
            setIsProcessing(false);
            resolve();
          })
          .catch((err) => {
            // Silent error: MathJax processing error
            setIsProcessing(false);
            resolve();
          });
      } else {
        setIsProcessing(false);
        resolve();
      }
    });
  }, [ready, isProcessing]);

  return { processMathJax, isProcessing };
}