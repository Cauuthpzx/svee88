import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
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
      proxy: {
        '/api': {
          target: env.VITE_API_BASE || 'http://localhost:8000',
          changeOrigin: true
        },
        '/agent': {
          target: env.VITE_UPSTREAM_BASE || 'https://a2u4k.ee88dly.com',
          changeOrigin: true,
          secure: true,
          configure: (proxy) => {
            const upstreamBase = env.VITE_UPSTREAM_BASE || 'https://a2u4k.ee88dly.com'
            proxy.on('proxyReq', (proxyReq, req) => {
              const cookie = env.VITE_UPSTREAM_COOKIE
              if (cookie) proxyReq.setHeader('Cookie', cookie)
              proxyReq.setHeader('User-Agent',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36')
              proxyReq.setHeader('Referer', upstreamBase + req.url)
              proxyReq.setHeader('Origin', upstreamBase)
            })
          }
        }
      }
    },
    preview: {
      port: 4173,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE || 'http://localhost:8000',
          changeOrigin: true
        },
        '/agent': {
          target: env.VITE_UPSTREAM_BASE || 'https://a2u4k.ee88dly.com',
          changeOrigin: true,
          secure: true,
          configure: (proxy) => {
            const upstreamBase = env.VITE_UPSTREAM_BASE || 'https://a2u4k.ee88dly.com'
            proxy.on('proxyReq', (proxyReq, req) => {
              const cookie = env.VITE_UPSTREAM_COOKIE
              if (cookie) proxyReq.setHeader('Cookie', cookie)
              proxyReq.setHeader('User-Agent',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36')
              proxyReq.setHeader('Referer', upstreamBase + req.url)
              proxyReq.setHeader('Origin', upstreamBase)
            })
          }
        }
      }
    }
  }
})
