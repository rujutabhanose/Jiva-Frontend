/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        background: '#FFFFFF', // Main background (soft warm cream)
        surface: '#F2F6F5', // Card/surface background (lighter cream)
        'header-bg': '#2F5D3B', // Header/navigation background (deep forest green)
        
        // Text
        foreground: '#1F2933', // Primary text (deep charcoal)
        'text-secondary': '#6B7280', // Secondary text (soft grey)
        'text-on-dark': '#F4F8F3', // Text on dark green backgrounds
        'text-on-primary': '#FEFCE8', // Text on primary green buttons
        
        // Brand Colors - Primary Green
        primary: '#3F7C4C', // Primary green (deep leaf green)
        'primary-hover': '#356542', // Hover state
        'primary-active': '#294C34', // Active/pressed state
        'primary-light': '#E3F2E5', // Light tint
        
        // Brand Colors - Secondary Green-Blue
        secondary: '#6B8F7A', // Sage/teal
        'secondary-hover': '#557263', // Hover state
        'secondary-light': '#E0EBE5', // Light tint
        
        // Functional Colors
        success: '#3F7C4C', // Same as primary green
        error: '#B55C4C', // Clay red
        'error-alt': '#C0152F', // Alternative red (darker)
        warning: '#D08A4E', // Terracotta/orange
        'warning-alt': '#A84B2F', // Alternative orange (darker)
        info: '#626C71', // Slate grey
        
        // UI Elements - Borders (using rgba format)
        border: 'rgba(146, 120, 89, 0.30)', // Standard borders
        'border-card': 'rgba(146, 120, 89, 0.18)', // Card borders
        'border-inner': 'rgba(146, 120, 89, 0.12)', // Inner borders
        
        // Secondary Surfaces
        'surface-secondary': 'rgba(146, 120, 89, 0.10)', // Base
        'surface-secondary-hover': 'rgba(146, 120, 89, 0.18)', // Hover
        'surface-secondary-active': 'rgba(146, 120, 89, 0.24)', // Active
        
        // Legacy compatibility (mapped to new colors)
        card: '#FFFBF2',
        'card-foreground': '#1F2933',
        'primary-foreground': '#FEFCE8',
        'secondary-foreground': '#1F2933',
        muted: '#E3F2E5',
        'muted-foreground': '#6B7280',
        accent: '#6B8F7A',
        'accent-foreground': '#1F2933',
        destructive: '#B55C4C',
        'destructive-foreground': '#FEFCE8',
        input: 'rgba(146, 120, 89, 0.30)',
        ring: '#3F7C4C',
      },
      fontSize: {
        xs: '11px',
        sm: '12px',
        base: '14px',
        lg: '16px',
        xl: '18px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '30px',
      },
      fontFamily: {
        primary: ['Inter', '-apple-system', 'system-ui', 'sans-serif'],
        alternative: ['Geist', 'FKGroteskNeue', 'sans-serif'],
        mono: ['SF Mono', 'system-mono', 'monospace'],
      },
      fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '550',
        bold: '600',
      },
    },
  },
  plugins: [],
}
