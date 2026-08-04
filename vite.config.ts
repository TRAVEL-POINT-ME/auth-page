import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative asset URLs, so the build also works when it is not served from
  // the domain root (a subpath, a preview folder, an artifact viewer).
  base: './',
  plugins: [react()],
  // Honour PORT so a second dev server (a parallel session, a preview harness)
  // lands where it was told to rather than on the next free port.
  server: { port: Number(process.env.PORT) || 5173 },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
});
