"use client";
import { Typography } from '../ui/typography';
import { useSidebar } from '../ui/sidebar';

export function ContentWrapper({ children }) {
  const { isOpen } = useSidebar();
  return (
    <div className={`max-w-4xl mx-auto px-6 py-8 transition-all duration-200 ${isOpen ? 'ml-64' : 'ml-0'}`}>
      <Typography>
        {children}
      </Typography>
    </div>
  );
}