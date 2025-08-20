/**
 * UntitledUI Design Tokens
 * JavaScript constants for use in React components
 * These should match the CSS custom properties in untitledui-theme.css
 */

// Helper function to get CSS custom property value
const getCSSVar = (name) => `var(${name})`;

// Color Palette - Using UntitledUI design tokens
export const colors = {
  // Gray Scale
  gray: {
    25: getCSSVar('--color-gray-25'),
    50: getCSSVar('--color-gray-50'),
    100: getCSSVar('--color-gray-100'),
    200: getCSSVar('--color-gray-200'),
    300: getCSSVar('--color-gray-300'),
    400: getCSSVar('--color-gray-400'),
    500: getCSSVar('--color-gray-500'),
    600: getCSSVar('--color-gray-600'),
    700: getCSSVar('--color-gray-700'),
    800: getCSSVar('--color-gray-800'),
    900: getCSSVar('--color-gray-900'),
    950: getCSSVar('--color-gray-950'),
  },
  
  // Brand Colors (Your custom blue)
  brand: {
    25: getCSSVar('--color-brand-25'),
    50: getCSSVar('--color-brand-50'),
    100: getCSSVar('--color-brand-100'),
    200: getCSSVar('--color-brand-200'),
    300: getCSSVar('--color-brand-300'),
    400: getCSSVar('--color-brand-400'),
    500: getCSSVar('--color-brand-500'),
    600: getCSSVar('--color-brand-600'),
    700: getCSSVar('--color-brand-700'),
    800: getCSSVar('--color-brand-800'),
    900: getCSSVar('--color-brand-900'),
    950: getCSSVar('--color-brand-950'),
  },
  
  // Success Colors
  success: {
    25: getCSSVar('--color-success-25'),
    50: getCSSVar('--color-success-50'),
    100: getCSSVar('--color-success-100'),
    200: getCSSVar('--color-success-200'),
    300: getCSSVar('--color-success-300'),
    400: getCSSVar('--color-success-400'),
    500: getCSSVar('--color-success-500'),
    600: getCSSVar('--color-success-600'),
    700: getCSSVar('--color-success-700'),
    800: getCSSVar('--color-success-800'),
    900: getCSSVar('--color-success-900'),
    950: getCSSVar('--color-success-950'),
  },
  
  // Error Colors
  error: {
    25: getCSSVar('--color-error-25'),
    50: getCSSVar('--color-error-50'),
    100: getCSSVar('--color-error-100'),
    200: getCSSVar('--color-error-200'),
    300: getCSSVar('--color-error-300'),
    400: getCSSVar('--color-error-400'),
    500: getCSSVar('--color-error-500'),
    600: getCSSVar('--color-error-600'),
    700: getCSSVar('--color-error-700'),
    800: getCSSVar('--color-error-800'),
    900: getCSSVar('--color-error-900'),
    950: getCSSVar('--color-error-950'),
  },
  
  // Warning Colors
  warning: {
    25: getCSSVar('--color-warning-25'),
    50: getCSSVar('--color-warning-50'),
    100: getCSSVar('--color-warning-100'),
    200: getCSSVar('--color-warning-200'),
    300: getCSSVar('--color-warning-300'),
    400: getCSSVar('--color-warning-400'),
    500: getCSSVar('--color-warning-500'),
    600: getCSSVar('--color-warning-600'),
    700: getCSSVar('--color-warning-700'),
    800: getCSSVar('--color-warning-800'),
    900: getCSSVar('--color-warning-900'),
    950: getCSSVar('--color-warning-950'),
  },
  
  // Base Colors
  white: getCSSVar('--color-white'),
  black: getCSSVar('--color-black'),
  transparent: getCSSVar('--color-transparent'),
};

// Typography Scale - Using CSS custom properties
export const typography = {
  fontFamily: {
    body: getCSSVar('--font-body'),
    display: getCSSVar('--font-display'),
    mono: getCSSVar('--font-mono'),
  },
  
  fontSize: {
    xs: getCSSVar('--text-xs'),
    sm: getCSSVar('--text-sm'),
    md: getCSSVar('--text-md'),
    lg: getCSSVar('--text-lg'),
    xl: getCSSVar('--text-xl'),
    'display-xs': getCSSVar('--text-display-xs'),
    'display-sm': getCSSVar('--text-display-sm'),
    'display-md': getCSSVar('--text-display-md'),
    'display-lg': getCSSVar('--text-display-lg'),
    'display-xl': getCSSVar('--text-display-xl'),
    'display-2xl': getCSSVar('--text-display-2xl'),
  },
  
  lineHeight: {
    xs: getCSSVar('--text-xs--line-height'),
    sm: getCSSVar('--text-sm--line-height'),
    md: getCSSVar('--text-md--line-height'),
    lg: getCSSVar('--text-lg--line-height'),
    xl: getCSSVar('--text-xl--line-height'),
    'display-xs': getCSSVar('--text-display-xs--line-height'),
    'display-sm': getCSSVar('--text-display-sm--line-height'),
    'display-md': getCSSVar('--text-display-md--line-height'),
    'display-lg': getCSSVar('--text-display-lg--line-height'),
    'display-xl': getCSSVar('--text-display-xl--line-height'),
    'display-2xl': getCSSVar('--text-display-2xl--line-height'),
  },
  
  letterSpacing: {
    'display-md': getCSSVar('--text-display-md--letter-spacing'),
    'display-lg': getCSSVar('--text-display-lg--letter-spacing'),
    'display-xl': getCSSVar('--text-display-xl--letter-spacing'),
    'display-2xl': getCSSVar('--text-display-2xl--letter-spacing'),
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

// Spacing Scale (Using 4px base via CSS custom properties)
export const spacing = getCSSVar('--spacing');

// Border Radius - Using CSS custom properties
export const borderRadius = {
  none: getCSSVar('--radius-none'),
  xs: getCSSVar('--radius-xs'),
  sm: getCSSVar('--radius-sm'),
  default: getCSSVar('--radius-DEFAULT'),
  md: getCSSVar('--radius-md'),
  lg: getCSSVar('--radius-lg'),
  xl: getCSSVar('--radius-xl'),
  '2xl': getCSSVar('--radius-2xl'),
  '3xl': getCSSVar('--radius-3xl'),
  full: getCSSVar('--radius-full'),
};

// Box Shadows - Using CSS custom properties
export const boxShadow = {
  xs: getCSSVar('--shadow-xs'),
  sm: getCSSVar('--shadow-sm'),
  md: getCSSVar('--shadow-md'),
  lg: getCSSVar('--shadow-lg'),
  xl: getCSSVar('--shadow-xl'),
  '2xl': getCSSVar('--shadow-2xl'),
  '3xl': getCSSVar('--shadow-3xl'),
  'xs-skeumorphic': getCSSVar('--shadow-xs-skeumorphic'),
  skeumorphic: getCSSVar('--shadow-skeumorphic'),
  none: 'none',
};

// Semantic Color Mappings using CSS custom properties
export const semanticColors = {
  // Text Colors
  text: {
    primary: getCSSVar('--color-text-primary'),
    secondary: getCSSVar('--color-text-secondary'),
    tertiary: getCSSVar('--color-text-tertiary'),
    quaternary: getCSSVar('--color-text-quaternary'),
    disabled: getCSSVar('--color-text-disabled'),
    placeholder: getCSSVar('--color-text-placeholder'),
    white: getCSSVar('--color-text-white'),
    brand: {
      primary: getCSSVar('--color-text-brand-primary'),
      secondary: getCSSVar('--color-text-brand-secondary'),
    },
    error: getCSSVar('--color-text-error-primary'),
    warning: getCSSVar('--color-text-warning-primary'),
    success: getCSSVar('--color-text-success-primary'),
  },
  
  // Background Colors
  bg: {
    primary: getCSSVar('--color-bg-primary'),
    secondary: getCSSVar('--color-bg-secondary'),
    tertiary: getCSSVar('--color-bg-tertiary'),
    quaternary: getCSSVar('--color-bg-quaternary'),
    disabled: getCSSVar('--color-bg-disabled'),
    disabled_subtle: getCSSVar('--color-bg-disabled_subtle'),
    brand: {
      primary: getCSSVar('--color-bg-brand-primary'),
      secondary: getCSSVar('--color-bg-brand-secondary'),
      solid: getCSSVar('--color-bg-brand-solid'),
      solid_hover: getCSSVar('--color-bg-brand-solid_hover'),
    },
    error: {
      primary: getCSSVar('--color-bg-error-primary'),
      secondary: getCSSVar('--color-bg-error-secondary'),
      solid: getCSSVar('--color-bg-error-solid'),
    },
    warning: {
      primary: getCSSVar('--color-bg-warning-primary'),
      secondary: getCSSVar('--color-bg-warning-secondary'),
      solid: getCSSVar('--color-bg-warning-solid'),
    },
    success: {
      primary: getCSSVar('--color-bg-success-primary'),
      secondary: getCSSVar('--color-bg-success-secondary'),
      solid: getCSSVar('--color-bg-success-solid'),
    },
  },
  
  // Border Colors
  border: {
    primary: getCSSVar('--color-border-primary'),
    secondary: getCSSVar('--color-border-secondary'),
    tertiary: getCSSVar('--color-border-tertiary'),
    disabled: getCSSVar('--color-border-disabled'),
    disabled_subtle: getCSSVar('--color-border-disabled_subtle'),
    brand: getCSSVar('--color-border-brand'),
    error: getCSSVar('--color-border-error'),
    error_subtle: getCSSVar('--color-border-error_subtle'),
  },
  
  // Foreground Colors
  fg: {
    primary: getCSSVar('--color-fg-primary'),
    secondary: getCSSVar('--color-fg-secondary'),
    tertiary: getCSSVar('--color-fg-tertiary'),
    quaternary: getCSSVar('--color-fg-quaternary'),
    quaternary_hover: getCSSVar('--color-fg-quaternary_hover'),
    disabled: getCSSVar('--color-fg-disabled'),
    disabled_subtle: getCSSVar('--color-fg-disabled_subtle'),
    white: getCSSVar('--color-fg-white'),
    brand: {
      primary: getCSSVar('--color-fg-brand-primary'),
      secondary: getCSSVar('--color-fg-brand-secondary'),
      secondary_alt: getCSSVar('--color-fg-brand-secondary_alt'),
      secondary_hover: getCSSVar('--color-fg-brand-secondary_hover'),
    },
    error: {
      primary: getCSSVar('--color-fg-error-primary'),
      secondary: getCSSVar('--color-fg-error-secondary'),
    },
    warning: {
      primary: getCSSVar('--color-fg-warning-primary'),
      secondary: getCSSVar('--color-fg-warning-secondary'),
    },
    success: {
      primary: getCSSVar('--color-fg-success-primary'),
      secondary: getCSSVar('--color-fg-success-secondary'),
    },
  },
};

// Animation Durations
export const animation = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  
  easing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Breakpoints for responsive design
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Z-Index Scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
};

// Export default object for easy importing
export default {
  colors,
  typography,
  spacing,
  borderRadius,
  boxShadow,
  animation,
  breakpoints,
  zIndex,
  semanticColors,
};
