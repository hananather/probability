// MathJax v3's default protocol regex does not normalize embedded URL controls.
// The browser URL parser does, so check its canonical protocol before ui/safe.
export function hardenMathJaxSafeUrls(mathJax, baseURL) {
  const safe = mathJax.startup.document.safe;
  const originalFilter = safe.filterMethods.filterURL;
  safe.filterMethods.filterURL = (handler, value) => {
    let parsed;
    try { parsed = new URL(String(value), baseURL); } catch { return null; }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return originalFilter(handler, parsed.href);
  };
}
