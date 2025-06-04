import { useEffect, useRef, useState } from 'react';

// Global queue for MathJax processing
let processingQueue = [];
let isProcessing = false;

async function processQueue() {
  if (isProcessing || processingQueue.length === 0) return;
  
  isProcessing = true;
  
  while (processingQueue.length > 0) {
    const { element, resolve } = processingQueue.shift();
    
    if (window.MathJax && window.MathJax.typesetPromise && element) {
      try {
        // Clear previous rendering
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([element]);
        }
        
        // Process the element
        await window.MathJax.typesetPromise([element]);
      } catch (err) {
        console.error('MathJax error:', err);
      }
    }
    
    resolve();
  }
  
  isProcessing = false;
}

export function useMathJaxQueue() {
  const [isReady, setIsReady] = useState(false);
  const elementRef = useRef(null);
  const contentHashRef = useRef('');
  
  useEffect(() => {
    // Check if MathJax is available
    const checkMathJax = () => {
      if (window.MathJax && window.MathJax.typesetPromise) {
        setIsReady(true);
        return true;
      }
      return false;
    };
    
    if (!checkMathJax()) {
      const timer = setInterval(() => {
        if (checkMathJax()) {
          clearInterval(timer);
        }
      }, 100);
      
      return () => clearInterval(timer);
    }
  }, []);
  
  const queueProcess = (element, contentHash) => {
    if (!element || !isReady) return Promise.resolve();
    
    // Skip if content hasn't changed
    if (contentHash === contentHashRef.current) {
      return Promise.resolve();
    }
    
    contentHashRef.current = contentHash;
    
    return new Promise((resolve) => {
      processingQueue.push({ element, resolve });
      
      // Process queue after a small delay to batch updates
      setTimeout(() => processQueue(), 10);
    });
  };
  
  return { queueProcess, isReady, elementRef };
}