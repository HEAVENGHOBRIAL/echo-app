import type { TextStyle } from 'react-native';

// Couleurs reprises des variables Figma "Echo · Couleurs" (bleu marine + menthe).
export const lightColors = {
  bg: { app: '#F4F6FA', surface: '#FFFFFF', subtle: '#EAEFF5' },
  text: { primary: '#0F1A2E', secondary: '#56607A', muted: '#98A1B3', onBrand: '#FFFFFF' },
  border: '#DDE3EC',
  brand: { primary: '#1B2A4A', pressed: '#111C33', soft: '#E2F8F4', accent: '#5EEAD4' },
  feedback: {
    success: '#1FA971', successSoft: '#E3F7EE',
    warning: '#F5A524', warningSoft: '#FFF3DC',
    error: '#E5484D', errorSoft: '#FDECEC',
    // Accessibilité : versions plus contrastées pour le petit texte (niveau AA ≥ 4,5:1)
    errorText: '#B42328',
    successStrong: '#167A55',
    successText: '#146C4B',
    warningText: '#8A5A00',
  },
  track: { backend: '#FF7A45', frontend: '#2EA3F2', js: '#F7C948' },
  // Texte posé sur une couleur vive (parcours, menthe) : toujours foncé, dans les 2 thèmes
  onTrack: '#0F1A2E',
  white: '#FFFFFF',
  // Carte "Série en cours" et logo
  hero: { bg: '#1B2A4A', text: '#FFFFFF', dotOff: '#111C33' },
  // Bloc de code des cartes
  code: { bg: '#0F1A2E', text: '#FFFFFF' },
  backdrop: 'rgba(15, 26, 46, 0.5)',
};

export type Colors = typeof lightColors;

// Mode sombre : fonds bleu nuit, la menthe devient la couleur principale des boutons
export const darkColors: Colors = {
  bg: { app: '#0B1220', surface: '#141D2F', subtle: '#1E293D' },
  text: { primary: '#EEF2F8', secondary: '#A9B3C6', muted: '#7E8AA0', onBrand: '#0B1220' },
  border: '#2A3550',
  brand: { primary: '#5EEAD4', pressed: '#3CCFB8', soft: '#12343A', accent: '#5EEAD4' },
  feedback: {
    success: '#2BC48A', successSoft: '#12362A',
    warning: '#F5A524', warningSoft: '#3A2C0E',
    error: '#F0666B', errorSoft: '#3D1A1D',
    errorText: '#FF9EA1',
    successStrong: '#167A55',
    successText: '#6EE7B7',
    warningText: '#FCD34D',
  },
  track: { backend: '#FF7A45', frontend: '#2EA3F2', js: '#F7C948' },
  onTrack: '#0F1A2E',
  white: '#FFFFFF',
  hero: { bg: '#1B2A4A', text: '#FFFFFF', dotOff: '#0B1220' },
  code: { bg: '#060B14', text: '#E6EDF7' },
  backdrop: 'rgba(0, 0, 0, 0.65)',
};

// Maquettes en 390 × 844, marges latérales 24 px.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  screen: 24,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  xl: 32,
  full: 999,
};

// Largeur max du contenu sur tablette / ordinateur : l'app reste lisible au lieu de s'étirer.
export const layout = {
  maxContentWidth: 440,
  wideBreakpoint: 900,
};

// Noms des polices chargées dans app/_layout.tsx
export const fonts = {
  body: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semibold: 'DMSans_600SemiBold',
  display: 'SpaceGrotesk_700Bold',
  code: 'JetBrainsMono_400Regular',
};

// Styles de texte du Figma (Display, H1, H2, H3, Body, Label, Body small, Caption, Code)
export const typography = {
  display: { fontFamily: fonts.display, fontSize: 34, lineHeight: 40 },
  h1: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32 },
  h2: { fontFamily: fonts.display, fontSize: 20, lineHeight: 26 },
  h3: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20 },
  bodySmall: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
  code: { fontFamily: fonts.code, fontSize: 14, lineHeight: 20 },
} satisfies Record<string, TextStyle>;
