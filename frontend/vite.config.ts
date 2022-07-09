import git from 'git-rev-sync'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/intern/',
  resolve: {
    alias: [
      { find: 'api', replacement: path.resolve(__dirname, './src/api') },
      {
        find: 'components',
        replacement: path.resolve(__dirname, './src/components'),
      },
      { find: 'layout', replacement: path.resolve(__dirname, './src/layout') },
      {
        find: 'modules',
        replacement: path.resolve(__dirname, './src/modules'),
      },
      { find: 'utils', replacement: path.resolve(__dirname, './src/utils') },
    ],
  },
  define: {
    DEBUG: process.env.DEBUG === 'true',
    __BUILD_INFO__: JSON.stringify({
      buildTime: new Date().toString(),
      gitCommitShort: git.short(),
    }),
    BACKEND_URL: JSON.stringify(process.env.BACKEND_URL ?? '/intern/'),
  },
  server: {
    proxy: {
      "/intern/api": {
        target: "https://foreningenbs.no/intern/api",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/intern\/api/, ""),
      },
    },
  }
})
