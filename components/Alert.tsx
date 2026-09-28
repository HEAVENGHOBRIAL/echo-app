import { Text, View } from 'react-native';
import { makeStyles, useTheme } from '@/lib/theme';
import { fonts, radius, spacing, typography } from '@/theme';

type Props = {
  title: string;
  message: string;
  type?: 'error' | 'success' | 'info' | 'warning';
  // false pour une info permanente (pas besoin de l'annoncer au lecteur d'écran à chaque affichage)
  announce?: boolean;
};

// Bandeau d'alerte (ex : "Connexion impossible").
// role="alert" → le lecteur d'écran l'annonce dès qu'il apparaît.
export function Alert({ title, message, type = 'error', announce = true }: Props) {
  const styles = useStyles();
  const { colors: c } = useTheme();
  const palette = {
    error: { bg: c.feedback.errorSoft, border: c.feedback.error, icon: c.feedback.error, fg: c.white, symbol: '!' },
    success: { bg: c.feedback.successSoft, border: c.feedback.success, icon: c.feedback.success, fg: c.white, symbol: '✓' },
    info: { bg: c.brand.soft, border: c.brand.primary, icon: c.brand.primary, fg: c.text.onBrand, symbol: 'i' },
    warning: { bg: c.feedback.warningSoft, border: c.feedback.warning, icon: c.feedback.warning, fg: c.white, symbol: '!' },
  };
  const p = palette[type];

  return (
    <View
      role={announce ? 'alert' : undefined}
      accessibilityLiveRegion={announce ? 'assertive' : 'none'}
      style={[styles.box, { backgroundColor: p.bg, borderColor: p.border }]}
    >
      <View
        style={[styles.icon, { backgroundColor: p.icon }]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Text style={[styles.iconText, { color: p.fg }]}>{p.symbol}</Text>
      </View>
      <View style={styles.texts}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: radius.md,
    width: '100%',
  },
  icon: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontFamily: fonts.semibold, fontSize: 13 },
  texts: { flex: 1, gap: 2 },
  title: { ...typography.h3, color: c.text.primary },
  message: { ...typography.bodySmall, color: c.text.secondary },
}));
