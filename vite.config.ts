import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the build works both under a GitHub Pages project subpath
// (<user>.github.io/gaming-journey) and under a custom domain at the root.
// Safe because the site has no router — see docs/SCOPE.md.
export default defineConfig({
  base: './',
  plugins: [react()],
})
