import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl'; // <-- 1. Importe o plugin aqui

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    // 2. Adicione basicSsl() dentro da lista de plugins abaixo:
    plugins: [react(), tailwindcss(), basicSsl()], 
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      allowedHosts: ['fecafinho.local'],
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});