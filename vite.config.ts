import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import tailwind from "tailwindcss";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react(), svgr()],
    base: "./",
    css: {
      postcss: {
        plugins: [tailwind()],
      },
    },
    define: {
      global: 'globalThis',
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'import.meta.env.VITE_WORDPRESS_API_URL': JSON.stringify(env.VITE_WORDPRESS_API_URL),
    },
    resolve: {
      alias: {
        buffer: 'buffer'
      }
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis'
        }
      }
    }
  };
});