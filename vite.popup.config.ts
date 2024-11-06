import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import {CRX_OUTDIR} from './globalConfig'
// https://vite.dev/config/
export default defineConfig({
  build:{
    outDir:CRX_OUTDIR
  },
  server:{
    port:3000,
  },
  plugins: [react()],
  resolve:{
    alias:{
      '@':path.resolve(__dirname,'src'),
    }
  }
})
