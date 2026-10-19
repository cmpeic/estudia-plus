import type { NextConfig } from "next";

// App 100% estática: `next build` genera la carpeta `out/` que se puede
// abrir desde cualquier hosting estático (Vercel, Netlify, GitHub Pages…)
// y funciona offline gracias al service worker de /public/sw.js.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // El indicador de desarrollo tapaba la barra de navegación inferior en el celular
  devIndicators: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
