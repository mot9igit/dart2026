import { resolve } from "path";
import { defineConfig } from "vite";
import handlebars from "vite-plugin-handlebars";
import HandlebarUpdate from "./hbaTrigger";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

const partDirs = [
  "src/partials",
  "src/partials/headers",
  "src/partials/footers",
  "src/partials/sidebars",
];

export default defineConfig({
  plugins: [
    handlebars({
      partialDirectory: partDirs,
      reloadOnPartialChange: true,
    }),
    HandlebarUpdate(),
    // Оптимизация изображений при сборке (Sharp для jpg/png/webp/gif/tiff/avif, SVGO для svg)
    ViteImageOptimizer({
      // Обрабатывать и файлы из public/ (по умолчанию уже true)
      includePublic: true,
      // Выводить статистику сжатия в консоль
      logStats: true,
      // Кэшировать результат, чтобы не пережимать при повторных сборках
      cache: false,
      // SVG — SVGO. Осторожно: viewBox/id используются в стилях и скриптах
      svg: {
        multipass: true,
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: {
                removeViewBox: false,
                cleanupIds: { minify: false, remove: false },
                cleanupNumericValues: false,
                convertPathData: false,
              },
            },
          },
          "sortAttrs",
          {
            name: "addAttributesToSVGElement",
            params: { attributes: [{ xmlns: "http://www.w3.org/2000/svg" }] },
          },
        ],
      },
      // Растровые форматы — Sharp
      png: { quality: 90, compressionLevel: 9 },
      jpg: { quality: 90, progressive: true },
      jpeg: { quality: 90, progressive: true },
      webp: { quality: 90 },
      gif: {},
    }),
  ],
  server: {},
  build: {
    outDir: "dist",
    emptyOutDir: true,
    // Минификация JS. Возможные значения:
    //   'esbuild'      — быстрый минификатор (дефолт был раньше)
    //   'oxc'          — минификатор на Oxc, дефолт Vite 8 (быстрее esbuild)
    //   'terser'       — самый агрессивный, требует: npm i -D terser
    //   false          — отключить минификацию (удобно при отладке)
    minify: "oxc",
    // Минификация CSS отдельно от JS. Возможные значения:
    //   'lightningcss' — нативный минификатор, дефолт Vite 8
    //   'esbuild'      — минификатор esbuild
    //   false          — отключить минификацию CSS
    cssMinify: "lightningcss",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/js/main.js"),
        style: resolve(__dirname, "src/styles/global.scss"),
        index: resolve(__dirname, "index.html"),        
        notFound: resolve(__dirname, "pages/404.html"),        
        development: resolve(__dirname, "pages/services/development.html"),        
      },
      output: {
        entryFileNames: `js/[name].js`,
        chunkFileNames: `js/[name].js`,
        assetFileNames: `css/[name].[ext]`,
      },
    },
  },
});
