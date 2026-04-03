
// UntitledUI Design System Token Configuration for Ant Design + Your Brand Colors
// Following UntitledUI design principles with your exact primary colors

// Your Exact Brand Colors
const brandColors = {
  primary: '#1A1ABA',
  primaryText: '#2121DD',
  primary50: '#F3F5F4',
};

// UntitledUI Color Palette with your brand integration
const colors = {
  // Gray Scale (UntitledUI)
  gray: {
    25: '#FCFCFD',
    50: '#F8FAFC',
    100: '#EEF2F6',
    200: '#E3E8EF',
    300: '#CDD5DF',
    400: '#9AA3B2',
    500: '#697586',
    600: '#4B5565',
    700: '#364152',
    800: '#202939',
    900: '#121926',
  },
  
  // Your Custom Primary Colors - Built around your exact colors
  primary: {
    25: '#F8F9FF',
    50: brandColors.primary50, // Your exact color
    100: '#E6E7FF',
    200: '#D1D3FF',
    300: '#B8BBFF',
    400: '#9CA0FF',
    500: brandColors.primaryText, // Your Primary-Text color
    600: brandColors.primary,     // Your exact Primary color
    700: '#1515A3',
    800: '#12128C',
    900: '#0F0F75',
  },
  
  // Success Colors
  success: {
    25: '#F6FEF9',
    50: '#ECFDF3',
    100: '#DCFAE6',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#12B76A',
    600: '#16A249',
    700: '#027A48',
    800: '#05603A',
    900: '#054F31',
  },
  
  // Error Colors
  error: {
    25: '#FFFBFA',
    50: '#FEF3F2',
    100: '#FEE4E2',
    200: '#FECDCA',
    300: '#FDA29B',
    400: '#F97066',
    500: '#F04438',
    600: '#D92D20',
    700: '#B42318',
    800: '#912018',
    900: '#7A271A',
  },
  
  // Warning Colors
  warning: {
    25: '#FFFCF5',
    50: '#FFFAEB',
    100: '#FEF0C7',
    200: '#FEDF89',
    300: '#FEC84B',
    400: '#FDB022',
    500: '#F79009',
    600: '#DC6803',
    700: '#B54708',
    800: '#93370D',
    900: '#7A2E0E',
  },
};

// Global UntitledUI Theme Configuration with your brand colors
export const globalToken = {
  // Base Colors - Using your exact primary colors
  colorPrimary: brandColors.primary, // Your exact #1A1ABA
  colorInfo: brandColors.primary,
  colorSuccess: colors.success[500],
  colorWarning: colors.warning[500],
  colorError: colors.error[500],
  
  // Text Colors
  colorText: colors.gray[900],
  colorTextSecondary: colors.gray[600],
  colorTextTertiary: colors.gray[500],
  colorTextQuaternary: colors.gray[400],
  colorTextDisabled: colors.gray[400],
  
  // Background Colors
  colorBgBase: '#FFFFFF',
  colorBgContainer: '#FFFFFF',
  colorBgContainerDisabled: colors.gray[50],
  colorBgLayout: colors.gray[25],
  colorBgSpotlight: colors.gray[50],
  colorBgMask: 'rgba(0, 0, 0, 0.45)',
  
  // Border Colors
  colorBorder: colors.gray[200],
  colorBorderSecondary: colors.gray[100],
  
  // Status Colors with UntitledUI palette
  colorSuccessText: colors.success[700],
  colorSuccessBg: colors.success[50],
  colorSuccessBorder: colors.success[200],
  
  colorWarningText: colors.warning[700],
  colorWarningBg: colors.warning[50],
  colorWarningBorder: colors.warning[200],
  
  colorErrorText: colors.error[700],
  colorErrorBg: colors.error[50],
  colorErrorBorder: colors.error[200],
  
  colorInfoText: colors.primary[700], // Using your brand color scale
  colorInfoBg: colors.primary[50],    // Using your Primary-50
  colorInfoBorder: colors.primary[200],
  
  // Typography
  fontFamily: '"Inter", sans-serif',
  fontSize: 14,
  fontSizeSM: 12,
  fontSizeLG: 16,
  fontSizeXL: 18,
  fontWeightStrong: 600,
  
  // Spacing & Layout
  borderRadius: 8,
  borderRadiusSM: 6,
  borderRadiusLG: 12,
  controlHeight: 40,
  controlHeightSM: 32,
  controlHeightLG: 48,
  
  // Shadow (UntitledUI inspired)
  boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
  boxShadowSecondary: '0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)',
  boxShadowTertiary: '0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)',
  
  // Motion
  motionDurationSlow: '0.3s',
  motionDurationMid: '0.2s',
  motionDurationFast: '0.1s',
};

// Light Mode Specific Tokens
export const lightToken = {
  colorBgBase: '#FFFFFF',
  colorBgContainer: '#FFFFFF',
  colorBgLayout: colors.gray[25],
  colorText: colors.gray[900],
  colorTextSecondary: colors.gray[600],
  colorBorder: colors.gray[200],
  colorBorderSecondary: colors.gray[100],
  colorFill: colors.gray[50],
  colorFillSecondary: colors.gray[25],
  colorFillTertiary: colors.gray[100],
  colorFillQuaternary: colors.gray[200],
  
  // Ensure your brand colors are consistent in light mode
  colorPrimary: brandColors.primary,
  colorPrimaryHover: brandColors.primaryText,
  colorPrimaryActive: colors.primary[700],
  colorPrimaryBg: colors.primary[50],
  colorPrimaryBgHover: colors.primary[100],
  colorPrimaryBorder: colors.primary[200],
  colorPrimaryBorderHover: colors.primary[300],
};

// Dark Mode Specific Tokens
export const darkToken = {
  colorBgBase: colors.gray[900],
  colorBgContainer: colors.gray[800],
  colorBgLayout: colors.gray[900],
  colorText: colors.gray[50],
  colorTextSecondary: colors.gray[300],
  colorBorder: colors.gray[700],
  colorBorderSecondary: colors.gray[800],
  colorFill: colors.gray[800],
  colorFillSecondary: colors.gray[700],
  colorFillTertiary: colors.gray[600],
  colorFillQuaternary: colors.gray[500],
  
  // Keep your brand colors consistent in dark mode
  colorPrimary: brandColors.primary,
  colorPrimaryHover: brandColors.primaryText,
  colorPrimaryActive: colors.primary[500],
  colorPrimaryBg: colors.primary[900],
  colorPrimaryBgHover: colors.primary[800],
  colorPrimaryBorder: colors.primary[700],
  colorPrimaryBorderHover: colors.primary[600],
};