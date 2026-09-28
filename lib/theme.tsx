// Thème clair / sombre.
// - "auto" suit le réglage du téléphone / de l'ordinateur
// - le choix est gardé sur l'appareil (AsyncStorage)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Platform, StyleSheet, useColorScheme } from 'react-native';
import { darkColors, lightColors, type Colors } from '@/theme';

export type ThemePref = 'system' | 'light' | 'dark';
type Scheme = 'light' | 'dark';

const KEY = 'echo.theme';

type ThemeState = {
  colors: Colors;
  scheme: Scheme;
  pref: ThemePref;
  setPref: (p: ThemePref) => void;
};

const ThemeContext = createContext<ThemeState>({
  colors: lightColors,
  scheme: 'light',
  pref: 'system',
  setPref: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [pref, setPrefState] = useState<ThemePref>('system');

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => {
        if (v === 'light' || v === 'dark' || v === 'system') setPrefState(v);
      })
      .catch(() => {});
  }, []);

  const scheme: Scheme = pref === 'system' ? (system === 'dark' ? 'dark' : 'light') : pref;
  const colors = scheme === 'dark' ? darkColors : lightColors;

  // Sur le web : fond de la page + barre du navigateur mobile aux couleurs du thème
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.body.style.backgroundColor = colors.bg.app;
    document.documentElement.style.colorScheme = scheme;
  }, [colors, scheme]);

  function setPref(p: ThemePref) {
    setPrefState(p);
    AsyncStorage.setItem(KEY, p).catch(() => {});
  }

  return <ThemeContext.Provider value={{ colors, scheme, pref, setPref }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

// Crée des styles qui dépendent des couleurs du thème.
// Usage : const useStyles = makeStyles((c) => ({ box: { backgroundColor: c.bg.surface } }));
//         puis dans le composant : const styles = useStyles();
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(factory: (c: Colors) => T) {
  const cache: Partial<Record<Scheme, T>> = {};
  return function useStyles(): T {
    const { colors, scheme } = useTheme();
    if (!cache[scheme]) cache[scheme] = StyleSheet.create(factory(colors));
    return cache[scheme]!;
  };
}
