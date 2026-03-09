import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFileSync } from 'fs'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'add-nojekyll',
      closeBundle() {
        writeFileSync('dist/.nojekyll', '')
      }
    }
  ],
  base: '/kemenkop-arsa0/',
})