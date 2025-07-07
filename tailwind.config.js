/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Bonsai-specific colors inspired by Glass
        bonsai: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.2)',
          dark: 'rgba(0, 0, 0, 0.1)',
        },
        // SAT-specific colors
        sat: {
          math: '#3b82f6',
          reading: '#8b5cf6',
          writing: '#06b6d4',
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      minHeight: {
        '12': '3rem',
        '16': '4rem',
      },
      backdropBlur: {
        '3xl': '64px',
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-out': 'fade-out 0.5s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'slide-out': 'slide-out 0.3s ease-out',
        'bounce-gentle': 'bounce-gentle 2s infinite',
        'pulse-gentle': 'pulse-gentle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        // Glass-inspired animations
        'glass-shimmer': 'glass-shimmer 3s ease-in-out infinite',
        'bonsai-grow': 'bonsai-grow 1s ease-out',
        'bonsai-pulse': 'bonsai-pulse 2s ease-in-out infinite',
        // SAT-specific animations
        'typing': 'typing 3.5s steps(40, end)',
        'blink-cursor': 'blink-cursor 0.75s step-end infinite',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-out': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-100%)', opacity: '0' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'pulse-gentle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow': {
          '0%': { 
            'box-shadow': '0 0 5px rgba(34, 197, 94, 0.5), 0 0 10px rgba(34, 197, 94, 0.3)' 
          },
          '100%': { 
            'box-shadow': '0 0 10px rgba(34, 197, 94, 0.8), 0 0 20px rgba(34, 197, 94, 0.5)' 
          },
        },
        'glass-shimmer': {
          '0%': { 
            background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%)',
            transform: 'translateX(-100%)'
          },
          '50%': { 
            background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%)',
            transform: 'translateX(0%)'
          },
          '100%': { 
            background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%)',
            transform: 'translateX(100%)'
          },
        },
        'bonsai-grow': {
          '0%': { 
            transform: 'scale(0.8)', 
            opacity: '0.8' 
          },
          '50%': { 
            transform: 'scale(1.05)', 
            opacity: '0.9' 
          },
          '100%': { 
            transform: 'scale(1)', 
            opacity: '1' 
          },
        },
        'bonsai-pulse': {
          '0%, 100%': { 
            transform: 'scale(1)', 
            filter: 'brightness(1)' 
          },
          '50%': { 
            transform: 'scale(1.02)', 
            filter: 'brightness(1.1)' 
          },
        },
        'typing': {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        'blink-cursor': {
          '0%, 50%': { border-color: 'transparent' },
          '51%, 100%': { border-color: 'currentColor' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        'bonsai-gradient': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        'sat-gradient': 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)',
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(20px)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-inset': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'bonsai': '0 10px 25px -5px rgba(34, 197, 94, 0.25), 0 10px 10px -5px rgba(34, 197, 94, 0.04)',
        'bonsai-lg': '0 25px 50px -12px rgba(34, 197, 94, 0.25)',
        'sat': '0 10px 25px -5px rgba(59, 130, 246, 0.15)',
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      aspectRatio: {
        '4/3': '4 / 3',
        '16/10': '16 / 10',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      scale: {
        '102': '1.02',
        '103': '1.03',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    // Custom plugin for Glass morphism effects
    function ({ addUtilities, theme }) {
      const newUtilities = {
        '.glass': {
          background: 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          background: 'rgba(0, 0, 0, 0.1)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.bonsai-glass': {
          background: 'rgba(34, 197, 94, 0.1)',
          'backdrop-filter': 'blur(12px)',
          'border': '1px solid rgba(34, 197, 94, 0.2)',
          'box-shadow': '0 8px 32px 0 rgba(34, 197, 94, 0.2)',
        },
        '.text-stroke': {
          '-webkit-text-stroke': '1px currentColor',
        },
        '.text-stroke-2': {
          '-webkit-text-stroke': '2px currentColor',
        },
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': `${theme('colors.gray.400')} ${theme('colors.gray.100')}`,
        },
        '.scrollbar-webkit': {
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: theme('colors.gray.100'),
            'border-radius': '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme('colors.gray.400'),
            'border-radius': '3px',
            '&:hover': {
              background: theme('colors.gray.500'),
            },
          },
        },
      };
      addUtilities(newUtilities);
    },
  ],
};