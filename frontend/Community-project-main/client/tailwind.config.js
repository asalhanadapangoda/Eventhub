/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#102D48',
          800: '#163B5C',
          700: '#1C4A73',
        },
        primary: {
          DEFAULT: '#102D48',
          dark: '#0B2034',
          deep: '#163B5C',
          accent: '#0070F3',
          light: '#2563EB',
        },
        slate: {
          bg: '#F5F7FA',
          border: '#E5E7EB',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Outfit', 'Inter', 'sans-serif']
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(16, 45, 72, 0.06), 0 1px 2px -1px rgba(16, 45, 72, 0.04)',
        'card-hover': '0 10px 25px -5px rgba(16, 45, 72, 0.1), 0 8px 10px -6px rgba(16, 45, 72, 0.08)',
        'modal': '0 25px 50px -12px rgba(16, 45, 72, 0.25)',
      }
    },
  },
  plugins: [],
}

