import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeBites from './src/lib/rehype-bites.mjs';

export default defineConfig({
  // Served at mglsj.eu.org/super_aos, so all asset and page URLs need this prefix.
  base: '/super_aos/',
  integrations: [svelte(), mdx()],
  markdown: {
    // The unified processor is needed for the remark/rehype math plugins.
    processor: unified({ remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex, rehypeBites] }),
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
  vite: { plugins: [tailwindcss()] },
});
