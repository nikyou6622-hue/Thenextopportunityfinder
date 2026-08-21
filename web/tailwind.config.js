/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0b0f19',
        foreground: '#f8fafc',
        card: {
          DEFAULT: '#111625',
          foreground: '#f8fafc',
        },
        popover: {
          DEFAULT: '#111625',
          foreground: '#f8fafc',
        },
        primary: {
          DEFAULT: '#6366f1',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#1e2238',
          foreground: '#f8fafc',
        },
        muted: {
          DEFAULT: '#1e2436',
          foreground: '#8a99ad',
        },
        accent: {
          DEFAULT: '#1e2238',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#f43f5e',
          foreground: '#ffffff',
        },
        border: 'rgba(255, 255, 255, 0.06)',
        input: 'rgba(255, 255, 255, 0.08)',
        ring: '#6366f1',
      },
      borderRadius: {
        lg: '16px',
        md: '12px',
        sm: '8px',
      },
    },
  },
  plugins: [],
}
