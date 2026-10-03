"use client";
import { Typography } from '../ui/typography';
import { useSidebar } from '../ui/sidebar';

export function ContentWrapper({ children }) {
  const { isOpen } = useSidebar();
  
  return (
    <main className={`min-w-0 flex-1 transition-[margin] duration-200 motion-reduce:transition-none ${isOpen ? 'lg:ml-72' : 'lg:ml-24'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Typography className="max-w-none">
          {children}
        </Typography>
      </div>
    </main>
  );
}
