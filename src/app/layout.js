import './globals.css';
import 'katex/dist/katex.min.css';
import { SidebarProvider, SidebarTrigger } from '../components/ui/sidebar';
import { AppSidebar } from '../components/shared/AppSidebar';
import { ContentWrapper } from '../components/shared/ContentWrapper';
import { MathJaxProvider } from '../components/shared/MathJaxProvider';

export const metadata = {
  title: 'Probability Lab - MAT 2377',
  description: 'Interactive probability and statistics learning platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth antialiased">
      <body>
        <MathJaxProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarTrigger />
            <ContentWrapper>
              {children}
            </ContentWrapper>
          </SidebarProvider>
        </MathJaxProvider>
      </body>
    </html>
  );
}
