import { Pressable, Text, View } from 'react-native';
import { focusStyles, type PressState } from '@/components/focus';
import { ProgressBar } from '@/components/ProgressBar';
import { useT } from '@/lib/i18n';
import { makeStyles } from '@/lib/theme';
import { trackColor } from '@/lib/trackColors';
import type { TrackOverview } from '@/lib/types';
import { fonts, radius, spacing, typography } from '@/theme';

type Props = {
  track: TrackOverview;
  onPress: () => void;
  // Progression affichée (0 → 1). Par défaut : cartes vues / cartes totales
  progress?: number;
};

// Carte d'un parcours (Backend / Frontend / JS) : pastille couleur, nom, nombre de cartes, progression.
export function TrackCard({ track, onPress, progress }: Props) {
  const styles = useStyles();
  const t = useT();
  const color = trackColor(track.slug, track.color);
  const value = progress ?? (track.cardsTotal ? track.seen / track.cardsTotal : 0);
  const subtitle = `${track.description} · ${t.common.cards(track.cardsTotal)}`;
  const pct = Math.round(value * 100);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t.trackCard.label(track.name, subtitle, pct)}
      accessibilityHint={t.trackCard.hint}
      style={({ pressed, focused }: PressState) => [styles.card, pressed && styles.pressed, focused && focusStyles.ring]}
    >
      <View style={[styles.icon, { backgroundColor: color }]}>
        <Text style={styles.iconText}>{track.badge}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{track.name}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <ProgressBar value={value} color={color} height={6} label={t.trackCard.progress(pct)} style={styles.bar} />
      </View>

      <Text style={styles.chevron} aria-hidden>
        ›
      </Text>
    </Pressable>
  );
}

const useStyles = makeStyles((c) => ({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: spacing.md,
    backgroundColor: c.bg.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 18,
  },
  pressed: { backgroundColor: c.bg.subtle },
  icon: { width: 52, height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  iconText: { ...typography.label, color: c.onTrack },
  info: { flex: 1, gap: 6 },
  name: { ...typography.h3, color: c.text.primary },
  subtitle: { ...typography.bodySmall, color: c.text.secondary },
  bar: { maxWidth: 180 },
  chevron: { fontFamily: fonts.body, fontSize: 24, color: c.text.secondary },
}));
