/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.bottom-border-shadow': {
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)', 
        },
        '.center-vertical': {
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
        },
        '.df': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        '.h2': {
          fontSize: '2rem',
          fontWeight: 'bold',
        },
        '.nav-button': {
          '@apply border-2 border-white px-2 py-1 font-bold transition-all duration-200 hover:bg-white hover:text-blue-600 active:border-slate-200 active:bg-slate-200':
            {},
        },
        '.prm-button': {
          '@apply transform rounded-3xl bg-blue-600 px-4 font-bold text-white transition-all duration-300 ease-in-out hover:bg-blue-700 active:scale-95 active:bg-blue-800':
            {},
        },
        '.prm-button-red': {
          '@apply transform rounded-3xl bg-red-600 px-4 font-bold text-white transition-all duration-300 ease-in-out hover:bg-red-700 active:scale-95 active:bg-red-800':
            {},
        },
        '.active': {
          '@apply bg-white border-white text-blue-600': {},
        },
        '.login-input': {
          width: 'clamp(200px, 30vw, 300px)',
          padding: '4px 8px',
        },
        '.clamp-sm': {
          width: 'clamp(300px, 30vw, 400px)',
        },
        '.clamp-ss': {
          width: 'clamp(100px, 15vw, 300px)',
        },
        '.edit-textarea': {
          borderRadius: '1.5rem',
          borderWidth: '2px',
          borderColor: 'transparent',
          paddingLeft: '1.25rem',
          paddingRight: '1.25rem',
          paddingTop: '0.75rem',
          paddingBottom: '0.75rem',
          '&:hover': {
            borderColor: 'white',
          },
          '&:focus': {
            borderColor: 'transparent',
          },
        },
        '.clamp-card': {
          width: 'clamp(400px, 40vw, 800px)',
        },
        '.calc-h-vw': {
          height: 'calc(100vh - 64px)',
        },
        '.calc-h-vw-1': {
          height: 'calc(100vh - 110px)',
        },
        '.calc-h-vw-2': {
          height: 'calc(100vh - 144px)',
        },
        '.box-shadow-br': {
          boxShadow: '10px 10px 2px 1px rgba(0, 0, 0, 0.15)',
          borderRadius: '10px',
        },
        '.grid-auto-fit': {
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
        },
      };

      addUtilities(newUtilities, ['responsive', 'hover']);
    },
  ],
};
