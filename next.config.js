/** @type {import('next').NextConfig} */
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    providerImportSource: '@mdx-js/react',
    remarkPlugins: [require('remark-math')],
    rehypePlugins: [require('rehype-katex')],
  }
});

module.exports = withMDX({
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
  webpack(config) {
    config.resolve.extensions.push('.jsx', '.md', '.mdx');
    return config;
  },
});
