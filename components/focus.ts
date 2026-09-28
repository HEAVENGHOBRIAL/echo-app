import { StyleSheet, type PressableStateCallbackType } from 'react-native';
import { lightColors } from '@/theme';

// Sur le web, Pressable donne aussi "focused" (navigation au clavier avec Tab).
// Les types React Native ne le connaissent pas, donc on l'ajoute ici.
export type PressState = PressableStateCallbackType & { focused?: boolean };

// Contour menthe bien visible autour de l'élément qui a le focus clavier (même couleur dans les 2 thèmes)
export const focusStyles = StyleSheet.create({
  ring: { outlineColor: lightColors.brand.accent, outlineWidth: 3, outlineStyle: 'solid', outlineOffset: 2 },
});
