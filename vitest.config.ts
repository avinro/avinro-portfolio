import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
  },
  resolve: {
    alias: {
      "next-intl/server": path.resolve(__dirname, "src/__mocks__/next-intl-server.ts"),
      "next-intl/routing": path.resolve(__dirname, "src/__mocks__/next-intl-routing.ts"),
      "@/i18n/navigation": path.resolve(__dirname, "src/__mocks__/i18n-navigation.tsx"),
      "next-intl": path.resolve(__dirname, "src/__mocks__/next-intl.tsx"),
      "@": path.resolve(__dirname, "./src"),
      // server-only throws at import time in server component tests.
      // Replace with an empty stub so Vitest can import server modules.
      "server-only": path.resolve(__dirname, "src/__mocks__/server-only.ts"),
    },
  },
});
