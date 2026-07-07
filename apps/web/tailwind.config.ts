import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1',
          dark: '#4F46E5',
          light: '#EEF2FF',
        },
        secondary: '#0EA5E9',
        accent: '#F59E0B',
        success: '#22C55E',
        danger: '#EF4444',
        warning: '#F97316',
        anonymous: {
          purple: '#8B5CF6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
