import {defineConfig} from 'tsup';
export default defineConfig({
  entry: ['./src/index.ts', './src/cli.ts'],
  clean: true,
  sourcemap: true,
  outDir: 'dist',
  dts: true,
  format: ['cjs','esm'],
})