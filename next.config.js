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
  webpack(config) {
    config.resolve.extensions.push('.jsx', '.md', '.mdx');
    return config;
  },
});
