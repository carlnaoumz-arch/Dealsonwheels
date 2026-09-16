import tailwindcss from '@tailwindcss/postcss';
import {nitro} from 'nitro/vite';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {defineConfig} from 'vite';
import vinext from 'vinext';

// Keep the Sites/Cloudflare build independent from the Vercel server build.
const require = createRequire(import.meta.url);
export default defineConfig({
  css: {postcss: {plugins: [tailwindcss()]}},
  resolve: {alias: {
    'cloudflare:workers': fileURLToPath(new URL('./lib/vercel-bindings.ts', import.meta.url)),
    'tailwindcss': require.resolve('tailwindcss/index.css'),
    'tw-animate-css': fileURLToPath(new URL('./node_modules/tw-animate-css/dist/tw-animate.css', import.meta.url)),
    'shadcn/tailwind.css': require.resolve('shadcn/tailwind.css'),
  }},
  plugins: [vinext(), nitro({preset: 'vercel'})],
});
