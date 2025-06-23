import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/widget.ts',
      name: 'SupkvnWidget',
      fileName: 'widget',
      formats: ['umd']
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    },
    minify: 'terser'
  }
})