import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://deone.example',
  redirects: {
    '/suites': '/suites/prestige',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
