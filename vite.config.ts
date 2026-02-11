import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Polyfill simple pour éviter que process.env ne fasse planter l'app si utilisé
      'process.env': env,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    resolve: {
      alias: {
        '@google/genai': '/lib/genai-adapter.ts', // Rediriger vers l'adaptateur
      },
    },
  };
});
