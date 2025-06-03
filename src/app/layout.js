"use client";
import './globals.css';
import 'katex/dist/katex.min.css';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

const geistSans = GeistSans({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});
const geistMono = GeistMono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});
import { Typography } from '../components/ui/typography';
import { SidebarProvider, SidebarTrigger, useSidebar } from '../components/ui/sidebar';
import { AppSidebar } from '../components/AppSidebar';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth antialiased">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarTrigger />
          <ContentWrapper>
            {children}
          </ContentWrapper>
        </SidebarProvider>
      </body>
    </html>
  );
}

function ContentWrapper({ children }) {
  const { isOpen } = useSidebar();
  return (
    <div className={`max-w-4xl mx-auto px-6 py-8 transition-all duration-200 ${isOpen ? 'ml-64' : 'ml-0'}`}>
      <Typography>
        {children}
      </Typography>
    </div>
  );
}
