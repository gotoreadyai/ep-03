import * as path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: "dist/stats.html",
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React dependencies
          "react-vendor": [
            "react",
            "react-dom",
            "react-router-dom",
            "react-router",
            "react-is",
          ],
          
          // Refine framework
          "refine-core": [
            "@refinedev/core",
            "@refinedev/react-router",
          ],
          
          // Refine UI integrations
          "refine-ui": [
            "@refinedev/react-hook-form",
            "@refinedev/react-table",
            "@refinedev/supabase",
          ],
          
          // Form handling
          "forms": [
            "react-hook-form",
            "@hookform/resolvers",
            "zod",
          ],
          
          // Table functionality
          "tables": [
            "@tanstack/react-table",
            "recharts",
          ],
          
          // Radix UI components
          "radix-ui": [
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-dialog",
            "@radix-ui/react-label",
            "@radix-ui/react-popover",
            "@radix-ui/react-progress",
            "@radix-ui/react-radio-group",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slot",
            "@radix-ui/react-tabs",
            "@radix-ui/react-tooltip",
          ],
          
          // UI utilities
          "ui-utils": [
            "class-variance-authority",
            "clsx",
            "tailwind-merge",
            "lucide-react",
          ],
          
          // Date handling
          "date": [
            "date-fns",
            "react-day-picker",
          ],
          
          // Other utilities
          "utils": [
            "zustand",
            "sonner",
            "react-markdown",
          ],
        },
      },
    },
    
    // Optymalizacja wydajności
    chunkSizeWarningLimit: 1000,
    
    // Minifikacja
    minify: 'esbuild',
    
    // Source maps dla produkcji (opcjonalnie)
    sourcemap: false,
    
    // Optymalizacja CSS
    cssCodeSplit: true,
    
    // Target dla nowoczesnych przeglądarek
    target: 'es2020',
  },
  
  // Optymalizacja dla development
  server: {
    hmr: {
      overlay: false,
    },
  },
  
  // Optymalizacja pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@refinedev/core',
      '@tanstack/react-table',
    ],
    exclude: ['@refinedev/cli'],
  },
});