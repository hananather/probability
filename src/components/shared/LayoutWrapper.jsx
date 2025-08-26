'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarTrigger } from '../ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { ContentWrapper } from './ContentWrapper';
import { FooterWrapper } from './FooterWrapper';
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';

export function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  
  if (isLandingPage) {
    // Landing page without sidebar, header, or footer (has its own)
    return <div className="min-h-screen">{children}</div>;
  }
  
  // All other pages with sidebar, header, and footer
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <SidebarProvider>
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarTrigger />
          <ContentWrapper>
            {children}
          </ContentWrapper>
        </div>
        <FooterWrapper>
          <Footer />
        </FooterWrapper>
      </SidebarProvider>
    </div>
  );
}