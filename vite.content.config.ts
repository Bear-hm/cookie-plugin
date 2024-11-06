import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { CRX_CONTENT_OUTDIR } from './globalConfig'

export default defineConfig({
    build: {
        // 输出目录
        outDir: CRX_CONTENT_OUTDIR,
        lib: {
            entry: [path.resolve(__dirname, 'src/content/index.ts')],
            // content script不支持ES6，因此不用使用es模式，需要改为cjs模式
            formats: ['cjs'],
            // 设置生成文件的文件名
            fileName: () => {
                return 'content.js'
            },
        },
        rollupOptions: {
            output: {
                assetFileNames: () => {
                    return 'content.css'
                },
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    // 解决代码中包含process.env.NODE_ENV导致无法使用的问题
    define: {
        'process.env.NODE_ENV': null,
    },
    plugins: [react()],
})
