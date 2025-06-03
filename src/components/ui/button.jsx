"use client";
import React from 'react';

export function Button({ className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
