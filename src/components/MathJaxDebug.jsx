"use client";
import React, { useEffect, useState } from "react";

export const MathJaxDebug = () => {
  const [status, setStatus] = useState({
    mathJax: false,
    mathJaxReady: false,
    version: null
  });

  useEffect(() => {
    const checkStatus = () => {
      setStatus({
        mathJax: !!window.MathJax,
        mathJaxReady: !!window.MathJaxReady,
        version: window.MathJax?.version || null
      });
    };

    // Check immediately
    checkStatus();

    // Check again after a delay
    const timer = setInterval(checkStatus, 500);

    return () => clearInterval(timer);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 10,
      background: '#1a1a1a',
      color: '#fff',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999
    }}>
      <div>MathJax Status:</div>
      <div>window.MathJax: {status.mathJax ? '✅' : '❌'}</div>
      <div>window.MathJaxReady: {status.mathJaxReady ? '✅' : '❌'}</div>
      <div>Version: {status.version || 'N/A'}</div>
    </div>
  );
};