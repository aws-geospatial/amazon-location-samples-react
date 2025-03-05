// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/** @type {import('vite').UserConfig} */
export default defineConfig({
  plugins: [react()],
  define: {
    global: {},
  },
  resolve: {
    alias: {
      "./runtimeConfig": "./runtimeConfig.browser",
    },
  },
  server: {
    port: 3000,
    allowedHosts: true
  },
  build: {
    outDir: "./build",
    commonjsOptions: { include: [] },
    target: "esnext"
  },
  optimizeDeps: {
    disabled: false,
  },
});
