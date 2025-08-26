'use client';

import { useSidebar } from '../ui/sidebar';

export function FooterWrapper({ children }) {
  const { isOpen } = useSidebar();
  
  return (
    <div className={`transition-all duration-200 ${isOpen ? 'ml-64 sm:ml-72' : 'ml-0'}`}>
      {children}
    </div>
  );
}