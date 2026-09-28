import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useT } from '@/lib/i18n';
import { makeStyles, useTheme } from '@/lib/theme';
import { typography } from '@/theme';

const SIZE = 180;
const STROKE = 18;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

// Anneau de score de l'écran Résultats (ex : 80 % maîtrisé)
export function ScoreRing({ percent }: { percent: number }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const t = useT();
  const p = Math.max(0, Math.min(100, percent));
  return (
    <View style={styles.wrapper} role="img" aria-label={t.results.ring(p)} accessibilityLabel={t.results.ring(p)}>
      <Svg width={SIZE} height={SIZE}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={colors.bg.subtle} strokeWidth={STROKE} fill="none" />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke={colors.brand.primary}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${CIRC} ${CIRC}`}
          strokeDashoffset={CIRC * (1 - p / 100)}
          // On part du haut (midi) et on tourne dans le sens des aiguilles d'une montre
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>
      <View style={styles.center} aria-hidden>
        <Text style={styles.value}>{p}%</Text>
        <Text style={styles.label}>{t.results.mastered}</Text>
      </View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  wrapper: { width: SIZE, height: SIZE, alignSelf: 'center' },
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  value: { ...typography.display, color: c.text.primary },
  label: { ...typography.bodySmall, color: c.text.secondary },
}));
