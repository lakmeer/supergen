/** @type {import('tailwindcss').Config} */
export default {
  content: [ './src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    'accent-green-500',
    'accent-red-400',
    'accent-slate-300',
    'text-green-500',
    'text-red-400',
    'text-slate-300',
    'bg-green-500',
    'bg-red-400',
    'bg-slate-300',
  ]
}

