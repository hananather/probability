"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const toggle = () => setIsOpen(prev => !prev);
  return (
    <SidebarContext.Provider value={{ isOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('useSidebar must be used within SidebarProvider');
  return context;
}

export function Sidebar({ children }) {
  const { isOpen } = useSidebar();
  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-neutral-900 text-white w-64 transform transition-transform duration-200 ${isOpen ? 'translate-x-0' : '-translate-x-full'} z-50`}
    >
      {children}
    </aside>
  );
}

export function SidebarContent({ children }) {
  const { isOpen } = useSidebar();
  const contentRef = useRef(null);
  const scrollPosRef = useRef(0);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    if (!isOpen) {
      scrollPosRef.current = el.scrollTop;
    } else {
      el.scrollTop = scrollPosRef.current;
    }
  }, [isOpen]);

  return (
    <div ref={contentRef} className="pt-16 px-4 pb-4 space-y-2 overflow-y-auto h-full">
      {children}
    </div>
  );
}

export function SidebarTrigger() {
  const { toggle } = useSidebar();
  return (
    <button
      onClick={toggle}
      className="fixed top-4 left-4 z-60 p-2 bg-neutral-900 text-white rounded hover:bg-neutral-700 focus:outline-none"
      aria-label="Toggle Sidebar"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}
