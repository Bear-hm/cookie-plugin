import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import {CRX_OUTDIR} from './globalConfig'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
// https://vite.dev/config/
export default defineConfig({
  build:{
    outDir:CRX_OUTDIR
  },
  server:{
    port:3000,
  },
  plugins: [react(),],
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
  resolve:{
    alias:{
      '@':path.resolve(__dirname,'src'),
    }
  }
})
