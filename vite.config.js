import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import researchPlanPlugin from './researchPlanPlugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), researchPlanPlugin()],
})
