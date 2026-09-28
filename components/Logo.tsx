import { Text, View } from 'react-native';
import { makeStyles } from '@/lib/theme';
import { fonts } from '@/theme';

// Logo "E" avec la pastille menthe. Décoratif : le titre de l'écran suffit au lecteur d'écran.
export function Logo() {
  const styles = useStyles();
  return (
    <View style={styles.logo} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Text style={styles.letter}>E</Text>
      <View style={styles.dot} />
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  logo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: c.hero.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32, color: c.hero.text },
  dot: {
    position: 'absolute',
    top: 8,
    left: 38,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: c.brand.accent,
  },
}));
