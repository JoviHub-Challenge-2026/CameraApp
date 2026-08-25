import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuracao do Vite. So precisamos do plugin do React aqui.
export default defineConfig({
  plugins: [react()],
})
