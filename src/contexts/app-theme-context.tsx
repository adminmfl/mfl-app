import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { Uniwind, useUniwind } from 'uniwind';

type ThemeName =
  | 'light'
  | 'dark'
  | 'lavender-light'
  | 'lavender-dark'
  | 'mint-light'
  | 'mint-dark'
  | 'sky-light'
  | 'sky-dark';

export type { ThemeName };

interface AppThemeContextType {
  currentTheme: string;
  isLight: boolean;
  isDark: boolean;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
}

const AppThemeContext = createContext<AppThemeContextType | undefined>(
  undefined
);

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { theme } = useUniwind();
  const initialized = useRef(false);

  // Default to light theme on first launch
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      if (theme === 'dark') {
        Uniwind.setTheme('light');
      }
    }
  }, []);

  const isLight = useMemo(() => {
    return theme === 'light' || theme.endsWith('-light');
  }, [theme]);

  const isDark = useMemo(() => {
    return theme === 'dark' || theme.endsWith('-dark');
  }, [theme]);

  const setTheme = useCallback((newTheme: ThemeName) => {
    Uniwind.setTheme(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const currentTheme = theme;

    // Determine if current theme is dark
    const isCurrentlyDark = currentTheme === 'dark' || currentTheme.endsWith('-dark');

    if (isCurrentlyDark) {
      // Currently dark, switch to light variant
      if (currentTheme === 'dark') {
        Uniwind.setTheme('light');
      } else if (currentTheme.startsWith('lavender')) {
        Uniwind.setTheme('lavender-light');
      } else if (currentTheme.startsWith('mint')) {
        Uniwind.setTheme('mint-light');
      } else if (currentTheme.startsWith('sky')) {
        Uniwind.setTheme('sky-light');
      }
    } else {
      // Currently light, switch to dark variant
      if (currentTheme === 'light') {
        Uniwind.setTheme('dark');
      } else if (currentTheme.startsWith('lavender')) {
        Uniwind.setTheme('lavender-dark');
      } else if (currentTheme.startsWith('mint')) {
        Uniwind.setTheme('mint-dark');
      } else if (currentTheme.startsWith('sky')) {
        Uniwind.setTheme('sky-dark');
      }
    }
  }, [theme]);

  const value = useMemo(
    () => ({
      currentTheme: theme,
      isLight,
      isDark,
      setTheme,
      toggleTheme,
    }),
    [theme, isLight, isDark, setTheme, toggleTheme]
  );

  return (
    <AppThemeContext.Provider value={value}>
      {children}
    </AppThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }
  return context;
};
