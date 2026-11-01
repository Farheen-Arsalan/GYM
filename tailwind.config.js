/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: v('bg'),
        bg2: v('bg-2'),
        fg: v('fg'),
        muted: v('muted'),
        line: v('line'),
        lime: v('lime'),
        cyan: v('cyan'),
        ink: v('accent-ink'),
        onaccent: '#05070a',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgb(var(--lime) / 0.25), 0 10px 40px -10px rgb(var(--lime) / 0.55)',
        'glow-cyan': '0 10px 40px -12px rgb(var(--cyan) / 0.6)',
        card: '0 1px 0 0 rgb(255 255 255 / 0.04) inset, 0 20px 50px -24px rgb(0 0 0 / 0.6)',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%,100%': { opacity: 0.55, transform: 'scale(1)' },
          '50%': { opacity: 0.9, transform: 'scale(1.06)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        shimmer: 'shimmer 6s linear infinite',
      },
    },
  },
  plugins: [],
}
