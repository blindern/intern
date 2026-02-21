import { defineConfig, type PluginOption } from "vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"

// TanStack Start only registers the injected-head-scripts virtual module for
// the server environment. In SPA mode the client also imports router-manifest
// which conditionally imports it, causing a resolve error. This plugin provides
// a no-op stub for the client environment.
function spaHeadScriptsFix(): PluginOption {
  return {
    name: "spa-head-scripts-fix",
    resolveId(id) {
      if (id === "tanstack-start-injected-head-scripts:v") {
        return "\0virtual:tanstack-start-injected-head-scripts"
      }
    },
    load(id) {
      if (id === "\0virtual:tanstack-start-injected-head-scripts") {
        return "export const injectedHeadScripts = undefined"
      }
    },
  }
}

const proxyApi = process.env.PROXY_API

export default defineConfig({
  server: proxyApi
    ? {
        proxy: {
          "/intern/_server": { target: proxyApi, changeOrigin: true },
          "/intern/api": { target: proxyApi, changeOrigin: true },
        },
      }
    : undefined,
  plugins: [
    tanstackStart({
      spa: {
        enabled: true,
      },
      router: {
        basepath: "/intern",
      },
    }),
    spaHeadScriptsFix(),
  ],
  base: "/intern/",
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: [
          "import",
          "global-builtin",
          "color-functions",
          "slash-div",
          "if-function",
        ],
      },
    },
  },

  esbuild: {
    jsx: "automatic",
  },
  build: {
    rollupOptions: {
      // Externalize Node.js builtins that leak from @tanstack/router-core SSR code
      external: [/^node:/],
    },
  },
})
