'use client';

import React from 'react';

/**
 * Typography wrapper using Tailwind CSS Typography plugin.
 * Applies ShadCN-style prose classes to child content.
 */
export function Typography({ children, className = '' }) {
  return (
    <div className={`prose prose-invert ${className}`}>
      {children}
    </div>
  );
}
