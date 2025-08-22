"use client";
import { Typography } from '../ui/typography';
import { useSidebar } from '../ui/sidebar';

export function ContentWrapper({ children }) {
  const { isOpen } = useSidebar();
  return (
    <div className={`transition-all duration-200 ${isOpen ? 'lg:ml-64 sm:lg:ml-72' : 'ml-0'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Typography>
          {children}
        </Typography>
      </div>
    </div>
  );
}