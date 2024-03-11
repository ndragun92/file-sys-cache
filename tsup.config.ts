import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'file-sys-cache': 'src/index.ts',
    'file-sys-cache.types': 'src/types/index.type.ts'
  },
  format: ['cjs', 'esm'], // Build for commonJS and ESmodules
  dts: true, // Generate declaration file (.d.ts)
  splitting: false,
  sourcemap: true,
  clean: true,
  // Optionals
  treeshake: true,
  metafile: true,
  minify: true
})
