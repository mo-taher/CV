import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The site is served from https://mo-taher.github.io/CV/
// If you ever move it to another repo, change "/CV/" to "/<repo-name>/".
// If you move it to a user site (mo-taher.github.io), change it to "/".
export default defineConfig({
  base: '/CV/',
  plugins: [react()],
  assetsInclude: ['**/*.glsl', '**/*.vert', '**/*.frag'],
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1100,
  },
})
