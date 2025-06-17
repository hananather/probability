import './globals.css';
import 'katex/dist/katex.min.css';
import { MathJaxProvider } from '../components/shared/MathJaxProvider';
import { LayoutWrapper } from '../components/shared/LayoutWrapper';

export const metadata = {
  title: 'Probability Lab - MAT 2377',
  description: 'Interactive probability and statistics learning platform for engineering students',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth antialiased">
      <body>
        <MathJaxProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </MathJaxProvider>
      </body>
    </html>
  );
}
