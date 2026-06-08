import path from "path";

import tailwindCaido from "@caido/tailwindcss";
import { defineConfig } from "@caido-community/dev";
import vue from "@vitejs/plugin-vue";
import prefixwrap from "postcss-prefixwrap";
import tailwindcss from "tailwindcss";
// @ts-expect-error no declared types at this time
import tailwindPrimeui from "tailwindcss-primeui";

const id = "resurface";

export default defineConfig({
  id,
  name: "Resurface",
  description:
    "Plant a canary token and get alerted when it resurfaces in later traffic.",
  version: "1.0.0",
  author: {
    name: "Amr Elsagaei",
    email: "info@amrelsagaei.com",
    url: "https://amrelsagaei.com",
  },
  plugins: [
    {
      kind: "backend",
      id: "resurface-backend",
      root: "packages/backend",
    },
    {
      kind: "frontend",
      id: "resurface-frontend",
      root: "packages/frontend",
      backend: {
        id: "resurface-backend",
      },
      vite: {
        plugins: [vue()],
        build: {
          rollupOptions: {
            external: [
              "@caido/frontend-sdk",
              "@codemirror/autocomplete",
              "@codemirror/commands",
              "@codemirror/language",
              "@codemirror/lint",
              "@codemirror/search",
              "@codemirror/state",
              "@codemirror/view",
              "@lezer/common",
              "@lezer/highlight",
              "@lezer/lr",
              "vue",
            ],
          },
        },
        resolve: {
          alias: {
            "@": path.resolve(__dirname, "packages/frontend/src"),
          },
        },
        css: {
          postcss: {
            plugins: [
              prefixwrap(`#plugin--${id}`),
              tailwindcss({
                corePlugins: {
                  preflight: false,
                },
                content: [
                  "./packages/frontend/src/**/*.{vue,ts}",
                  "./node_modules/@caido/primevue/dist/primevue.mjs",
                ],
                darkMode: ["selector", '[data-mode="dark"]'],
                plugins: [tailwindPrimeui, tailwindCaido],
              }),
            ],
          },
        },
      },
    },
  ],
});
