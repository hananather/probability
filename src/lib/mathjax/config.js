export const MATHJAX_VERSION = '3.2.2';
export const MATHJAX_SCRIPT_URL = `https://cdn.jsdelivr.net/npm/mathjax@${MATHJAX_VERSION}/es5/tex-chtml.js`;

export function createMathJaxConfig() {
  return {
    loader: { load: ['ui/safe'] },
    tex: {
      inlineMath: [['\\(', '\\)']],
      displayMath: [['\\[', '\\]']],
    },
    startup: { typeset: false },
    options: {
      renderActions: { addMenu: [], checkLoading: [] },
      safeOptions: {
        allow: { URLs: 'safe', classes: 'safe', cssIDs: 'safe', styles: 'safe' },
        safeProtocols: { http: true, https: true, file: false, javascript: false, data: false },
      },
    },
  };
}

export const MATHJAX_CONFIG_SCRIPT = `window.MathJax = ${JSON.stringify(createMathJaxConfig())};`;
