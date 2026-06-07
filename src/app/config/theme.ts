import { createTheme, type Theme, type ThemeOptions } from '@mui/material/styles';

export const brandTokens = {
  primary: '#0069A6',
  primaryDark: '#004C78',
  primaryLight: '#E7F4FB',
  secondary: '#F7941D',
  ink: '#1B2A38',
  radius: 8,
  fontFamily:
    '"Inter", "Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
} as const;

const lightPalette: ThemeOptions['palette'] = {
  mode: 'light',
  primary: { main: brandTokens.primary, dark: brandTokens.primaryDark, light: brandTokens.primaryLight },
  secondary: { main: brandTokens.secondary, dark: '#C36C11', light: '#FFF1E0' },
  success: { main: '#1F8A64' },
  warning: { main: '#B86F14' },
  error: { main: '#BF3D31' },
  info: { main: '#2E7FA8' },
  background: { default: '#F6F8FB', paper: '#FFFFFF' },
  text: { primary: brandTokens.ink, secondary: '#5D6B78' },
  divider: 'rgba(27, 42, 56, 0.11)',
};

const darkPalette: ThemeOptions['palette'] = {
  mode: 'dark',
  primary: { main: '#62B5E5', dark: '#0069A6', light: '#12364A' },
  secondary: { main: '#FFB45C' },
  success: { main: '#50B98A' },
  warning: { main: '#E5A642' },
  error: { main: '#EA7060' },
  info: { main: '#77BDE2' },
  background: { default: '#0F1821', paper: '#162230' },
  text: { primary: '#F3F7FA', secondary: '#AEB8C2' },
  divider: 'rgba(243, 247, 250, 0.12)',
};

export function createAppTheme(mode: 'light' | 'dark'): Theme {
  const isDark = mode === 'dark';
  return createTheme({
    palette: isDark ? darkPalette : lightPalette,
    shape: { borderRadius: brandTokens.radius },
    typography: {
      fontFamily: brandTokens.fontFamily,
      h4: { fontWeight: 700, letterSpacing: 0 },
      h5: { fontWeight: 700, letterSpacing: 0 },
      h6: { fontWeight: 700, letterSpacing: 0 },
      subtitle1: { fontWeight: 700 },
      subtitle2: { fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 700 },
    },
    components: {
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            border: `1px solid ${isDark ? 'rgba(243,247,250,0.10)' : 'rgba(20,39,56,0.10)'}`,
            borderRadius: brandTokens.radius,
            boxShadow: isDark ? 'none' : '0 1px 2px rgba(27,42,56,0.05)',
          },
        },
      },
      MuiButton: { defaultProps: { disableElevation: true } },
      MuiChip: { styleOverrides: { root: { fontWeight: 700 } } },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 700,
            whiteSpace: 'nowrap',
            backgroundColor: isDark ? '#192839' : '#F2F6FA',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              backgroundColor: isDark ? 'rgba(98,181,229,0.16)' : 'rgba(0,105,166,0.08)',
            },
            '&.Mui-selected:hover': {
              backgroundColor: isDark ? 'rgba(98,181,229,0.22)' : 'rgba(0,105,166,0.12)',
            },
          },
        },
      },
    },
  });
}
