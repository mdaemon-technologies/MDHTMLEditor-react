import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MDHTMLEditorReact',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', '@mdaemon/html-editor'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@mdaemon/html-editor': 'MDHTMLEditor',
        },
      },
    },
    sourcemap: true,
    minify: false,
  },
});
