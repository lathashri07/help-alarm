/** Design tokens from the Phase 4 component sheet. Change them here, nowhere else. */
export default {
content: ['./index.html', './apps/web/src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0B0B0D',
        surface: '#141416',
        card: '#1B1B1E',
        primary: { DEFAULT: '#7A2EC0', hover: '#6A24B0' },
        accent: '#B794F4',
        ink: { DEFAULT: '#FFFFFF', muted: '#A8A8B0' },
        line: '#2B2B30',
        success: '#15803D',
        danger: '#DC2626',
        waiting: '#F59E0B',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { input: '12px', btn: '14px', card: '16px' },
      minHeight: { touch: '44px' },
      minWidth: { touch: '44px' },
    },
  },
  plugins: [],
};