/** @type {import('tailwindcss').Config} */
module.exports = {
  // Aktivera dark mode baserat på 'class' för en manuell toggle
  darkMode: 'class', 
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // MAUI färger mappade till Tailwind
        // Primära färger
        primary: {
          DEFAULT: 'var(--color-primary)',      // #512BD4
          light: 'var(--color-primary-light)',  // #ac99ea
          dark: 'var(--color-primary-dark)',    // #2B0B98
          text: 'var(--color-primary-text)',    // #242424
          textLight: 'var(--color-secondary-dark-text)', // #9880e5 (SecondaryDarkText)
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',    // #DFD8F7
          accent: 'var(--color-accent)',        // #3498DB (Accent100)
          accentDark: 'var(--color-accent-dark)', // #004079 (Accent200)
        },
        brand: { // En ny kategori för den "röd-liknande" färgen från din första design
          red: 'var(--color-brand-red)', // Den röda färgen jag använde tidigare
        },

        // Bakgrundsfärger
        background: {
          light: 'var(--color-background-light)', // #F2F2F2
          dark: 'var(--color-background-dark)',   // #17171a
          lightOnDark: 'var(--color-light-on-dark-background)', // #C3C3C3
          darkOnLight: 'var(--color-dark-on-light-background)', // #0D0D0D
          lightSecondary: 'var(--color-light-secondary-background)', // #E0E0E0
          darkSecondary: 'var(--color-dark-secondary-background)', // #222228
        },

        // Gråskala
        gray: {
          100: 'var(--color-gray-100)', // #E1E1E1
          200: 'var(--color-gray-200)', // #C8C8C8
          300: 'var(--color-gray-300)', // #ACACAC
          400: 'var(--color-gray-400)', // #919191
          500: 'var(--color-gray-500)', // #6E6E6E
          600: 'var(--color-gray-600)', // #404040
          700: 'var(--color-gray-700)', // Inte explicit definierad, men standard Tailwind
          800: 'var(--color-gray-800)', // Inte explicit definierad, men standard Tailwind
          900: 'var(--color-gray-900)', // #212121
          950: 'var(--color-gray-950)', // #141414
        },

        // Övriga färger från MAUI-paletten
        white: 'var(--color-white)',     // White
        black: 'var(--color-black)',     // Black
        magenta: 'var(--color-magenta)', // #D600AA
        midnightBlue: 'var(--color-midnight-blue)', // #190649
        offBlack: 'var(--color-off-black)',     // #1f1f1f

        // Ytterligare primära/bakgrundsfärger från din "gamla" Styles.xaml (Primary100, Background100 etc.)
        // Dessa är nu döpta om för att undvika konflikter och bättre beskriva deras användning
        darkBlueGray: 'var(--color-dark-blue-gray)', // Primary100: #2C3E50
        mediumBlueGray: 'var(--color-medium-blue-gray)', // Primary200: #57687c
        lightBlueGray: 'var(--color-light-blue-gray)', // Primary300: #b4c7dd
        textLightMode: 'var(--color-text-light-mode)', // Text100: #FFFFFF (vit text för ljusa bakgrunder)
        textDarkMode: 'var(--color-text-dark-mode)', // Text200: #e0e0e0 (ljusgrå text för mörka bakgrunder)
        deepDarkBackground: 'var(--color-deep-dark-background)', // Background100: #1A2A33
        darkerBackground: 'var(--color-darker-background)', // Background200: #2a3a43
        darkBackgroundAccent: 'var(--color-dark-background-accent)', // Background300: #42525c
      },
      fontFamily: {
        // Lägg till Google Fonts i _app.tsx för att använda dem
        // Exempel: 'poppins': ['Poppins', 'sans-serif'],
        // 'open-sans': ['Open Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};