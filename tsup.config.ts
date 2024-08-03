import {version} from './package.json';
import {defineConfig} from 'tsup';
export default defineConfig({
  entry: ['./src/index.ts', './src/cli.ts'],
  clean: true,
  sourcemap: true,
  outDir: 'dist',
  dts: true,
  format: ['cjs','esm'],
  define: {
    __VER__: `'${version}'`,
    __NAME__: `'mock-server'`
  }
})