import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// Cambia "base" por el nombre de tu repositorio en GitHub Pages
export default defineConfig({ base: '/reportes-produccion/', plugins: [react(), tailwindcss()] })
