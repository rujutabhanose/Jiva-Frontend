/**
 * Theme colors based on colours.txt design system
 * Natural, warm, earthy plant-themed color palette
 */

export const colors = {
  // Backgrounds
  background: '#F7F4EC', // Main background (soft warm cream)
  surface: '#FFFBF2', // Card/surface background (lighter cream)
  headerBg: '#2F5D3B', // Header/navigation background (deep forest green)

  // Text
  text: '#1F2933', // Primary text (deep charcoal)
  textSecondary: '#6B7280', // Secondary text (soft grey)
  textOnDark: '#F4F8F3', // Text on dark green backgrounds
  textOnPrimary: '#FEFCE8', // Text on primary green buttons (soft off-white)

  // Brand Colors - Primary Green
  primary: '#3F7C4C', // Primary green (deep leaf green)
  primaryHover: '#356542', // Hover state
  primaryActive: '#294C34', // Active/pressed state
  primaryLight: '#E3F2E5', // Light tint (backgrounds, highlights)

  // Brand Colors - Secondary Green-Blue
  secondary: '#6B8F7A', // Sage/teal
  secondaryHover: '#557263', // Hover state
  secondaryLight: '#E0EBE5', // Light tint

  // Functional Colors
  success: '#3F7C4C', // Same as primary green
  error: '#B55C4C', // Clay red
  errorAlt: '#C0152F', // Alternative red (darker)
  warning: '#D08A4E', // Terracotta/orange
  warningAlt: '#A84B2F', // Alternative orange (darker)
  info: '#626C71', // Slate grey

  // UI Elements - Borders
  border: 'rgba(146, 120, 89, 0.30)', // Standard borders (tan)
  borderCard: 'rgba(146, 120, 89, 0.18)', // Card borders (lighter)
  borderInner: 'rgba(146, 120, 89, 0.12)', // Inner borders (subtlest)

  // Secondary Surfaces
  surfaceSecondary: 'rgba(146, 120, 89, 0.10)', // Base
  surfaceSecondaryHover: 'rgba(146, 120, 89, 0.18)', // Hover
  surfaceSecondaryActive: 'rgba(146, 120, 89, 0.24)', // Active
};

export const typography = {
  fontFamily: {
    primary: '"Inter", -apple-system, system-ui',
    alternative: '"Geist", "FKGroteskNeue"',
    monospace: 'SF Mono, system-mono',
  },
  fontSize: {
    xs: 11, // Extra small (labels, captions)
    sm: 12, // Small (secondary text)
    base: 14, // Base/Body text
    lg: 16, // Large body
    xl: 18, // Subheadings
    '2xl': 20, // H3
    '3xl': 24, // H2
    '4xl': 30, // H1
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '550',
    bold: '600',
  },
};

