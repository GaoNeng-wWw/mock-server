import {defineConfig} from 'tsup';
export default defineConfig({
  entry: ['./src/index.ts'],
  clean: true,
  sourcemap: true,
  outDir: 'dist',
  dts: true,
  format: ['cjs','esm'],
})