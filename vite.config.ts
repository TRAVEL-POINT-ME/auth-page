import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative asset URLs, so the build also works when it is not served from
  // the domain root (a subpath, a preview folder, an artifact viewer).
  base: './',
  plugins: [react()],
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
});
