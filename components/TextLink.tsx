import { Pressable, Text, type TextStyle } from 'react-native';
import { focusStyles, type PressState } from '@/components/focus';
import { makeStyles } from '@/lib/theme';
import { typography } from '@/theme';

type Props = {
  label: string;
  onPress: () => void;
  accessibilityHint?: string;
  style?: TextStyle;
};

// Lien texte (ex : "Se connecter", "Mot de passe oublié ?").
// La zone cliquable fait au moins 44 px de haut pour être facile à toucher.
export function TextLink({ label, onPress, accessibilityHint, style }: Props) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      hitSlop={12}
      style={({ focused }: PressState) => [styles.touch, focused && focusStyles.ring]}
    >
      {({ pressed }) => <Text style={[styles.text, pressed && styles.pressed, style]}>{label}</Text>}
    </Pressable>
  );
}

const useStyles = makeStyles((c) => ({
  touch: { minHeight: 44, justifyContent: 'center', borderRadius: 6 },
  text: { ...typography.label, color: c.brand.primary },
  pressed: { textDecorationLine: 'underline' },
}));
