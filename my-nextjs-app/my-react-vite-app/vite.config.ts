import { defineConfig } from 'vite';

// Temporariamente não carregamos `@vitejs/plugin-react` para evitar
// falhas de peer-dependency quando o ambiente não possui a versão correta.
// Isso mantém o servidor Vite funcionando; React ainda será processado pelo
// esbuild para builds de desenvolvimento básicos.
export default defineConfig({
  plugins: [],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  },
});