import { useMemo, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { store } from '@/app/store';
import { useAppSelector } from '@/app/store/hooks';
import { createAppTheme } from '@/app/config/theme';

function ThemedApp({ children }: { children: ReactNode }) {
  const colorMode = useAppSelector((state) => state.ui.colorMode);
  const theme = useMemo(() => createAppTheme(colorMode), [colorMode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ThemedApp>{children}</ThemedApp>
    </Provider>
  );
}
