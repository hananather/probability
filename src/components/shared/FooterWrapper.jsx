'use client';

import { useSidebar } from '../ui/sidebar';

export function FooterWrapper({ children }) {
  const { isOpen } = useSidebar();
  
  return (
    <div className={`min-w-0 transition-[margin] duration-200 motion-reduce:transition-none ${isOpen ? 'lg:ml-72' : 'ml-0'}`}>
      {children}
    </div>
  );
}
