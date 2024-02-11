/** @type {import('tailwindcss').Config} */
export default {
  content: [ './src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
        '14': 'repeat(14, minmax(0, 1fr))',
        '15': 'repeat(15, minmax(0, 1fr))',
        '16': 'repeat(16, minmax(0, 1fr))',
      }
    },
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

