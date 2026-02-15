import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true, // This will open the browser automatically on npm run dev
    port: 5173  // Standard Vite port
  }
})