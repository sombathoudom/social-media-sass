import '../css/app.css';
// import './bootstrap';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { configureEcho } from '@laravel/echo-react';

// configureEcho({
//     broadcaster: 'reverb',
//     key: import.meta.env.VITE_REVERB_APP_KEY,
//     wsHost: import.meta.env.VITE_REVERB_HOST,
//     wsPort: import.meta.env.VITE_REVERB_PORT ? Number(import.meta.env.VITE_REVERB_PORT) : 8080,
//     wssPort: import.meta.env.VITE_REVERB_PORT ? Number(import.meta.env.VITE_REVERB_PORT) : 8080,
//     forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
//     disableStats: true,
//     enabledTransports: ['ws', 'wss'],
// });

// use this in component
// import { useEcho } from '@laravel/echo-react';

// // In your component
// const echo = useEcho();

// useEffect(() => {
//     if (!conversationId) return;

//     const channel = echo.channel(`chat.${conversationId}`);

//     channel.listen('.new.message', (event: Message) => {
//         onReceive(event);
//     });

//     return () => {
//         echo.leave(`chat.${conversationId}`);
//     };
// }, [conversationId, echo]);



// Make Pusher available globally for Echo
// declare global {
//     interface Window {
//         Pusher: typeof Pusher;
//         // Corrected: Provide the generic type argument for Echo
//         // Since Reverb uses Pusher-compatible client, Pusher is the appropriate type here.
//         Echo: Echo<any>;
//     }
// }

// window.Pusher = Pusher;

// // 3. Initialize Laravel Echo with Reverb configuration
// // Ensure your .env variables (VITE_REVERB_APP_KEY, VITE_REVERB_HOST, etc.) are correctly set.
// window.Echo = new Echo({
//     broadcaster: 'reverb',
//     key: import.meta.env.VITE_REVERB_APP_KEY,
//     wsHost: import.meta.env.VITE_REVERB_HOST,
//     wsPort: import.meta.env.VITE_REVERB_PORT ? Number(import.meta.env.VITE_REVERB_PORT) : 8080,
//     wssPort: import.meta.env.VITE_REVERB_PORT ? Number(import.meta.env.VITE_REVERB_PORT) : 8080, // For HTTPS
//     forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
//     disableStats: true,
//     enabledTransports: ['ws', 'wss'], // Specify WebSockets only
//     // You might also need `cluster` if you've configured it in Laravel's Reverb config
//     // cluster: import.meta.env.VITE_REVERB_CLUSTER,
// });

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
