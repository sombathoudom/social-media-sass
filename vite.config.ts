import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    server :{
        host: true,
        port: 5173,
        strictPort: true,
        hmr: {
            host: '9d461279857f.ngrok-free.app',
            protocol: 'wss',
            port: 443,
        },
    },
//    server: {
//         host: true,
//         port: 5173,
//         hmr: {
//             host: '870f77749b99.ngrok-free.app',
//             protocol: 'wss'
//         },
//     },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
        
    ],
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
    esbuild: {
        jsx: 'automatic',
    },
});
