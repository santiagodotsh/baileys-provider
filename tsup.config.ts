import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  target: 'esnext',
  outDir: 'dist',
  bundle: true,
  clean: true,
  minify: true,
  sourcemap: true,
  dts: true,
  splitting: false,
  treeshake: true
})
