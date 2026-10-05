import './globals.css';
import Script from 'next/script';
import { MathJaxProvider } from '../components/shared/MathJaxProvider';
import { LayoutWrapper } from '../components/shared/LayoutWrapper';
import { MotionPreferenceProvider } from '../components/shared/MotionPreferenceProvider';
import { ActiveProgressProvider } from '../components/shared/ActiveProgressProvider';
import { MATHJAX_CONFIG_SCRIPT } from '@/lib/mathjax/config';

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
    <html lang="en" className="scroll-smooth antialiased" data-reduced-motion="true">
      <body>
      <Script
        id="mathjax-config"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: MATHJAX_CONFIG_SCRIPT,
        }}
      />
        <MotionPreferenceProvider>
          <ActiveProgressProvider>
            <MathJaxProvider>
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </MathJaxProvider>
          </ActiveProgressProvider>
        </MotionPreferenceProvider>
      </body>
    </html>
  );
}
