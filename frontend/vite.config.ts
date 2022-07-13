import react from "@vitejs/plugin-react"
import git from "git-rev-sync"
import path from "path"
import { defineConfig } from "vite"
import checker from "vite-plugin-checker"

export default defineConfig({
  plugins: [
    react(),
    checker({
      typescript: true,
      eslint: {
        lintCommand: "eslint .",
      },
    }),
  ],
  base: "/intern/",
  resolve: {
    alias: [
      {
        find: "components",
        replacement: path.resolve(__dirname, "./src/components"),
      },
      { find: "layout", replacement: path.resolve(__dirname, "./src/layout") },
      {
        find: "modules",
        replacement: path.resolve(__dirname, "./src/modules"),
      },
      { find: "urls", replacement: path.resolve(__dirname, "./src/urls") },
      { find: "utils", replacement: path.resolve(__dirname, "./src/utils") },
    ],
  },
  define: {
    DEBUG: process.env.DEBUG === "true",
    __BUILD_INFO__: JSON.stringify({
      buildTime: new Date().toString(),
      gitCommitShort: git.short(),
    }),
    BACKEND_URL: JSON.stringify(process.env.BACKEND_URL ?? "/intern/"),
  },
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
})
