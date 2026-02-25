import { defineConfig, loadEnv } from 'vite'

const createProxyConfig = (env) => ({
  '/api': {
    target: env.VITE_API_BASE || 'http://localhost:8000',
    changeOrigin: true
  }
})

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const proxy = createProxyConfig(env)
  return {
    root: '.',
    publicDir: 'public',
    build: {
      target: 'es2022',
      minify: 'terser',
      sourcemap: mode !== 'production',
      outDir: 'build',
      emptyOutDir: true,
      rollupOptions: {
        input: 'index.html',
        output: {
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: '[ext]/[name]-[hash].[ext]',
          manualChunks: {
            axios: ['axios']
          }
        }
      },
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: true
        }
      }
    },
    server: {
      port: 3000,
      open: true,
      proxy
    },
    preview: {
      port: 4173,
      proxy
    }
  }
})
