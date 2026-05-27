import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import researchPlanPlugin from './researchPlanPlugin.js'

export default defineConfig({
  base:'/anti-procrastination-app/',
  plugins: [react(), researchPlanPlugin()],
})
