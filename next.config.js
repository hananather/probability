/** @type {import('next').NextConfig} */
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [require('remark-math').default],
    rehypePlugins: [require('rehype-katex').default],
    providerImportSource: '@mdx-js/react'
  }
});

module.exports = withMDX({
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
  // Add all possible dev origins to prevent CORS issues
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://10.0.0.112:3000',
    'http://10.0.0.112:3002'
  ],
  webpack(config) {
    config.resolve.extensions.push('.jsx', '.md', '.mdx');
    return config;
  },
});
