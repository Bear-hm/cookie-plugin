import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { CRX_BACKGROUND_OUTDIR } from './globalConfig'

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        // 输出目录
        outDir: CRX_BACKGROUND_OUTDIR,
        lib: {
            entry: [path.resolve(__dirname, 'src/background/index.ts')],
            // background script不支持ES6，因此不用使用es模式，需要改为cjs模式
            formats: ['cjs'],
            fileName:  () => {
                return 'background.js'
            }
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    plugins: [react()],
})