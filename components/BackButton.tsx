import { router } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { focusStyles, type PressState } from '@/components/focus';
import { useT } from '@/lib/i18n';
import { makeStyles } from '@/lib/theme';

// Flèche "‹" en haut des écrans. Si on ne peut pas revenir en arrière, on va à l'accueil.
export function BackButton() {
  const styles = useStyles();
  const t = useT();
  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      accessibilityRole="button"
      accessibilityLabel={t.common.back}
      hitSlop={8}
      style={({ focused }: PressState) => [styles.touch, focused && focusStyles.ring]}
    >
      <Text style={styles.chevron}>‹</Text>
    </Pressable>
  );
}

const useStyles = makeStyles((c) => ({
  touch: {
    width: 44,
    height: 44,
    marginLeft: -12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  chevron: { fontSize: 30, lineHeight: 34, color: c.text.primary },
}));
