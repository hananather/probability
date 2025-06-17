'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarTrigger } from '../ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { ContentWrapper } from './ContentWrapper';

export function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  
  if (isLandingPage) {
    // Landing page without sidebar
    return <div className="min-h-screen">{children}</div>;
  }
  
  // All other pages with sidebar
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <ContentWrapper>
        {children}
      </ContentWrapper>
    </SidebarProvider>
  );
}