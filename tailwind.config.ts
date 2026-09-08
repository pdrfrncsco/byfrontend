import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dynamic Theme System Colors (bound to index.css CSS Custom Properties)
        'background': 'var(--background)',
        'surface': 'var(--surface)',
        'surface-container': 'var(--surface-container)',
        'surface-container-low': 'var(--surface-container-low)',
        'surface-container-high': 'var(--surface-container-high)',
        'surface-container-highest': 'var(--surface-container-highest)',
        'surface-container-lowest': 'var(--surface-container-lowest)',
        'surface-bright': 'var(--surface-container-high)',
        'surface-dim': 'var(--surface)',
        'surface-variant': 'var(--surface-container)',
        'on-surface': 'var(--on-surface)',
        'on-background': 'var(--on-surface)',
        'on-surface-variant': 'var(--on-surface-variant)',
        'outline': 'var(--outline)',
        'outline-variant': 'var(--outline-variant)',
        'card': 'var(--bg-card)',
        'card-border': 'var(--bg-card-border)',

        // Brand & Accent Colors
        'primary': '#94d3c1',
        'surface-tint': '#94d3c1',
        'inverse-primary': '#29695b',
        'on-primary-fixed': '#00201a',
        'on-primary-container': '#7ebdac',
        'on-primary-fixed-variant': '#065043',
        'primary-container': '#004d40',
        'primary-fixed-dim': '#94d3c1',
        'primary-fixed': '#afefdd',
        'on-primary': '#00382e',

        'tertiary': '#e9c349',
        'tertiary-container': '#cca730',
        'tertiary-fixed-dim': '#e9c349',
        'tertiary-fixed': '#ffe088',
        'on-tertiary': '#3c2f00',
        'on-tertiary-fixed': '#241a00',
        'on-tertiary-fixed-variant': '#574500',
        'on-tertiary-container': '#4f3e00',

        'secondary': '#bec6e0',
        'secondary-container': '#3f465c',
        'secondary-fixed': '#dae2fd',
        'secondary-fixed-dim': '#bec6e0',
        'on-secondary': '#283044',
        'on-secondary-container': '#adb4ce',
        'on-secondary-fixed': '#131b2e',
        'on-secondary-fixed-variant': '#3f465c',

        'error': '#ffb4ab',
        'error-container': '#93000a',
        'on-error': '#690005',
        'on-error-container': '#ffdad6',

        'inverse-on-surface': '#213145',
        'inverse-surface': '#d3e4fe',

        // Warning
        'warning': 'var(--color-warning, #f59e0b)',
        'on-warning': 'var(--color-on-warning, #000)',
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem',
      },
      spacing: {
        base: '4px',
        xs: '4px',
        xl: '48px',
        md: '16px',
        sm: '8px',
        lg: '24px',
        'container-max': '1440px',
        'gutter': '20px',
      },
      fontFamily: {
        'headline-lg-mobile': ['Archivo Narrow'],
        'headline-lg': ['Archivo Narrow'],
        'display-lg': ['Archivo Narrow'],
        'title-md': ['Geist'],
        'data-tabular': ['JetBrains Mono'],
        'label-sm': ['Geist'],
        'body-md': ['Geist'],
        sans: ['Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
      fontSize: {
        'headline-lg-mobile': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'title-md': ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'data-tabular': ['13px', { lineHeight: '16px', fontWeight: '450' }],
        'label-sm': ['11px', { lineHeight: '14px', fontWeight: '600' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      })
    }),
  ],
}

export default config
