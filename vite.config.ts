import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import cesium from "vite-plugin-cesium";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), cesium(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api/celestrak": {
        target: "https://celestrak.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/celestrak/, ""),
      },
      "/api/opensky-auth": {
        target: "https://auth.opensky-network.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/opensky-auth/, ""),
      },
      "/api/opensky": {
        target: "https://opensky-network.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/opensky/, ""),
      },
      "/api/adsb": {
        target: "https://api.adsb.lol",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/adsb/, ""),
      },
      "/api/usgs": {
        target: "https://earthquake.usgs.gov",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/usgs/, ""),
      },
      "/api/ioda": {
        target: "https://api.ioda.inetintel.cc.gatech.edu",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ioda/, ""),
      },
      "/api/gpsjam": {
        target: "https://gpsjam.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gpsjam/, ""),
      },
    },
  },
});
