import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [react()],

    root: '.',

    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },

    server: {
      host: true,
      port: 5000,
      strictPort: true,
      open: true,
      hmr: true,
    },

    build: {
      outDir: 'dist',
      // Чтобы структура папок была похожа на webpack (static/js, static/media)
      assetsDir: 'static', 
      sourcemap: isProduction, // Аналог devtool
      minify: isProduction ? 'esbuild' : false,
      
      // Настройка имен файлов (опционально, для максимального сходства с webpack)
      rollupOptions: {
        output: {
          entryFileNames: `static/js/[name].[hash].js`,
          chunkFileNames: `static/js/[name].[hash].js`,
          assetFileNames: ({ name }) => {
            if (/\.(gif|jpe?g|png|svg)$/.test(name ?? '')) {
              return 'static/media/[name]-[hash][extname]';
            }
            if (/\.css$/.test(name ?? '')) {
              return 'static/css/[name]-[hash][extname]';
            }
            if (/\.(woff|woff2|eot|ttf|otf)$/.test(name ?? '')) {
              return 'static/fonts/[name]-[hash][extname]';
            }
            return 'static/assets/[name]-[hash][extname]';
          },
        },
      },
    },

    // Обработка переменных окружения
    // Vite автоматически загружает .env, .env.local и т.д.
    // Но переменные должны начинаться с VITE_
    define: {
      // Если в коде остался process.env, можно подменить (но лучше рефакторить)
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    
    // Для поддержки импорта .md файлов как текста (аналог asset/source)
    assetsInclude: ['**/*.md'],
  };
});