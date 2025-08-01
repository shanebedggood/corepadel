// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        "./src/**/*.{html,ts}", // Important: Adjust if your templates are elsewhere
    ],
    theme: {
        extend: {},
    },
    plugins: [], // The tailwindcss-primeui plugin is now typically handled via @plugin in CSS for v4
};

export default config;