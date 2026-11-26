/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#0B192C',
        'primary-container': '#0e1c2f',
        'on-primary': '#ffffff',
        'on-primary-container': '#77849c',
        'primary-fixed': '#d6e3fe',
        'primary-fixed-dim': '#bac7e1',

        secondary: '#006398',
        'secondary-hover': '#0284c7',
        'secondary-container': '#5bb8fe',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#00476e',
        'secondary-fixed': '#cce5ff',
        'secondary-fixed-dim': '#93ccff',

        tertiary: '#00174b',
        'tertiary-container': '#00174b',
        'tertiary-fixed': '#dbe1ff',

        surface: '#faf8ff',
        'surface-canvas': '#ffffff',
        'surface-subtle': '#f8fafc',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f2f3ff',
        'surface-container': '#eaedff',
        'surface-container-high': '#e2e7ff',
        'surface-container-highest': '#dae2fd',

        'on-surface': '#131b2e',
        'on-surface-variant': '#44474c',
        'inverse-surface': '#283044',
        'inverse-on-surface': '#eef0ff',

        outline: '#75777d',
        'outline-variant': '#c5c6cd',
        'border-subtle': '#e2e8f0',
        'border-strong': '#cbd5e1',

        error: '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',
        'on-error-container': '#93000a',
        background: '#faf8ff',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(11, 25, 44, 0.04), 0 1px 2px -1px rgba(11, 25, 44, 0.04)',
        hover: '0 12px 24px -6px rgba(11, 25, 44, 0.08), 0 4px 6px -4px rgba(11, 25, 44, 0.03)',
        modal: '0 24px 48px -12px rgba(11, 25, 44, 0.16)',
      },
    },
  },
  plugins: [],
};

