/** @type {import('tailwindcss').Config} */
export default {
  content: [ './src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    'accent-red-400',
    'accent-green-500',
    'text-red-400',
    'text-green-500',
    'bg-red-400',
    'bg-green-500',
  ]
}

