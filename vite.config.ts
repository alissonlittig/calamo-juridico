import { defineConfig } from 'vitest/config';
import solid from 'vite-plugin-solid';

export default defineConfig({
  base: './',
  plugins: [solid()],
  test: { environment: 'node' },
});
