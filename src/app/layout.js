import './globals.css';
import Script from 'next/script';
import { MathJaxProvider } from '../components/shared/MathJaxProvider';
import { LayoutWrapper } from '../components/shared/LayoutWrapper';

export const metadata = {
  title: 'Probability Lab - MAT 2377',
  description: 'Interactive probability and statistics learning platform for engineering students',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth antialiased">
      <body>
      <Script
        id="mathjax-config"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.MathJax = {
              tex: {
                inlineMath: [['\\\\(', '\\\\)']],
                displayMath: [['\\\\[', '\\\\]']],
              },
              startup: {
                typeset: false,
                ready: () => {
                  MathJax.startup.defaultReady();
                  // Dispatch custom event when MathJax is ready
                  window.dispatchEvent(new Event('MathJaxReady'));
                }
              },
              options: {
                renderActions: {
                  addMenu: [],
                  checkLoading: []
                }
              }
            };
          `,
        }}
      />
        <MathJaxProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </MathJaxProvider>
      </body>
    </html>
  );
}
