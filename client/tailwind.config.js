/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#F3F1EA',
        bg2: '#ECE9DF',
        surface: '#FBFAF6',
        surface2: '#F6F4EC',
        ink: '#0B1512',
        inksoft: '#2B3831',
        muted: '#6E7A73',
        lime: '#C7F464',
        lime2: '#B4EA45',
        limedeep: '#4C7A1E',
        forest: '#16301F',
        coral: '#DE4C52',
        sky: '#2F6FEB',
        night: '#08100D',
        night2: '#0D1713',
      },
      fontFamily: {
        sans: ['"Inter Tight"', 'Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(11,21,18,.04), 0 18px 50px -24px rgba(11,21,18,.22)',
        lift: '0 2px 4px rgba(11,21,18,.05), 0 30px 80px -30px rgba(11,21,18,.35)',
        glass: '0 1px 0 rgba(255,255,255,.7) inset, 0 20px 60px -30px rgba(11,21,18,.35)',
        lime: '0 10px 40px -10px rgba(150,220,60,.6)',
      },
      borderRadius: {
        xs: '3px',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-10px,0)' },
        },
        floatAlt: {
          '0%,100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,12px,0)' },
        },
        marquee: {
          '0%': { transform: 'translate3d(0,0,0)' },
          '100%': { transform: 'translate3d(-50%,0,0)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(.65)', opacity: '.8' },
          '100%': { transform: 'scale(2.1)', opacity: '0' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(900%)' },
        },
        dash: {
          to: { strokeDashoffset: '-220' },
        },
        spinSlow: {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        'float-alt': 'floatAlt 9s ease-in-out infinite',
        marquee: 'marquee 38s linear infinite',
        'pulse-ring': 'pulseRing 2.6s cubic-bezier(0,0,.2,1) infinite',
        scan: 'scan 7s linear infinite',
        dash: 'dash 9s linear infinite',
        'spin-slow': 'spinSlow 60s linear infinite',
      },
    },
  },
  plugins: [],
};
