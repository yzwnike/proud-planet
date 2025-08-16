/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        'nike': '#FF6B35',
        'adidas': '#000000',
        'puma': '#007ACC',
        'kappa': '#8B5CF6'
      }
    },
  },
  plugins: [],
}
