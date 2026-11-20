import { defineConfig } from "@lovable.dev/vite-tanstack-config"
import tailwindcss from '@tailwindcss/vite'
import path from "path"

export default defineConfig({
    cloudflare: false,
    tanstackStart: {
        server: {
            preset: 'vercel'
        }
    },
    vite: {
        plugins: [
            tailwindcss(),
            
        ],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
    }
})