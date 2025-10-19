/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#2D2D2D',
          light: '#FAFAFA',
        },
        surface: {
          DEFAULT: '#3A3A3A',
          light: '#FFFFFF',
        },
        text: {
          primary: {
            DEFAULT: '#E5E5E5',
            light: '#2D2D2D',
          },
          secondary: {
            DEFAULT: '#A6A6A6',
            light: '#6B6B6B',
          },
        },
        accent: {
          DEFAULT: '#4791B1',
          light: '#5BB3D9',
        },
      },
      fontFamily: {
        serif: ['Libre Baskerville', 'serif'],
        sans: ['General Sans', 'Work Sans', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.text.primary.DEFAULT'),
            lineHeight: '1.8',
            maxWidth: '672px',
            a: {
              color: theme('colors.accent.DEFAULT'),
              textDecoration: 'none',
              '&:hover': {
                color: theme('colors.accent.light'),
              },
            },
            h1: {
              fontFamily: theme('fontFamily.serif').join(','),
              fontWeight: '700',
              fontSize: '3rem',
              lineHeight: '1.2',
            },
            h2: {
              fontFamily: theme('fontFamily.serif').join(','),
              fontWeight: '700',
              fontSize: '2.25rem',
              lineHeight: '1.2',
            },
            h3: {
              fontFamily: theme('fontFamily.serif').join(','),
              fontWeight: '700',
              fontSize: '2rem',
              lineHeight: '1.2',
            },
            p: {
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
            },
            code: {
              fontFamily: theme('fontFamily.mono').join(','),
              backgroundColor: theme('colors.surface.DEFAULT'),
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
          },
        },
        light: {
          css: {
            color: theme('colors.text.primary.light'),
            a: {
              color: theme('colors.accent.DEFAULT'),
            },
            code: {
              backgroundColor: theme('colors.surface.light'),
            },
          },
        },
      }),
    },
  },
  plugins: [typography()],
};
