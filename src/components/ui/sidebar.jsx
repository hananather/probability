"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useId } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const desktopOpenRef = useRef(true);
  const scrollPosRef = useRef(0);
  const triggerRef = useRef(null);
  const sidebarId = useId();
  
  useEffect(() => {
    try {
      const savedOpen = localStorage.getItem('sidebarOpen');
      desktopOpenRef.current = savedOpen !== 'false';
    } catch {
      // Navigation remains available when browser storage is blocked.
    }
    const desktopQuery = window.matchMedia('(min-width: 1024px)');
    const checkScreenSize = () => {
      setIsDesktop(desktopQuery.matches);
      setIsOpen(desktopQuery.matches ? desktopOpenRef.current : false);
    };
    checkScreenSize();
    desktopQuery.addEventListener('change', checkScreenSize);
    return () => desktopQuery.removeEventListener('change', checkScreenSize);
  }, []);
  
  const toggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (isDesktop) {
      desktopOpenRef.current = newState;
      try {
        localStorage.setItem('sidebarOpen', String(newState));
      } catch {
        // Keep the current session usable without saving the preference.
      }
    }
  };
  
  return (
    <SidebarContext.Provider value={{ isOpen, isDesktop, toggle, sidebarId, scrollPosRef, triggerRef, close: () => setIsOpen(false) }}>
      <Dialog.Root open={!isDesktop && isOpen} onOpenChange={setIsOpen}>
        {children}
      </Dialog.Root>
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('useSidebar must be used within SidebarProvider');
  return context;
}

export function Sidebar({ children }) {
  const { isOpen, isDesktop, sidebarId, close, triggerRef } = useSidebar();
  const className = 'fixed top-16 left-0 flex h-[calc(100dvh-4rem)] w-64 flex-col bg-neutral-900 text-white sm:w-72 z-[60]';

  if (isDesktop) {
    return (
      <aside
        id={sidebarId}
        aria-label="Course navigation"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={`${className} transform transition-transform duration-200 motion-reduce:transition-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {children}
      </aside>
    );
  }

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <Dialog.Content
        id={sidebarId}
        aria-modal="true"
        aria-describedby={undefined}
        className={className}
        onCloseAutoFocus={event => {
          if (triggerRef.current) {
            event.preventDefault();
            triggerRef.current.focus();
          }
        }}
        onClick={event => {
          if (event.target.closest('a[href]') && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) close();
        }}
      >
        <div className="flex shrink-0 items-center justify-between px-4 py-2">
          <Dialog.Title className="text-sm font-medium">Course navigation</Dialog.Title>
          <Dialog.Close className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400" aria-label="Close sidebar">
            <span aria-hidden="true" className="text-2xl">×</span>
          </Dialog.Close>
        </div>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export function SidebarContent({ children }) {
  const { isOpen, scrollPosRef } = useSidebar();
  const contentRef = useRef(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    if (isOpen) {
      el.scrollTop = scrollPosRef.current;
    }
    return () => {
      scrollPosRef.current = el.scrollTop;
    };
  }, [isOpen, scrollPosRef]);

  return (
    <div ref={contentRef} className="min-h-0 flex-1 pt-4 px-4 pb-4 space-y-2 overflow-y-auto">
      {children}
    </div>
  );
}

export function SidebarTrigger() {
  const { toggle, isOpen, isDesktop, sidebarId, triggerRef } = useSidebar();
  const button = (
    <button
      ref={triggerRef}
      type="button"
      onClick={isDesktop ? toggle : undefined}
      className="flex h-10 w-10 shrink-0 items-center justify-center bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 transition-colors motion-reduce:transition-none"
      aria-label="Toggle Sidebar"
      aria-expanded={isOpen}
      aria-controls={sidebarId}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
      </svg>
    </button>
  );
  return isDesktop ? button : <Dialog.Trigger asChild>{button}</Dialog.Trigger>;
}
