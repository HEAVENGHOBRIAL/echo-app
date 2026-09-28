import { Text, View } from 'react-native';
import { useT, type Dict } from '@/lib/i18n';
import { makeStyles, useTheme } from '@/lib/theme';
import type { DeckStatus } from '@/lib/types';
import { radius, typography } from '@/theme';

export type BadgeKind = DeckStatus | 'demo' | 'locked';

// Petite pastille de statut (Démo, Nouveau, À revoir, Maîtrisé…)
export function Badge({ kind }: { kind: BadgeKind }) {
  const styles = useStyles();
  const t = useT();
  const { colors: c } = useTheme();
  const look: Record<BadgeKind, { bg: string; fg: string }> = {
    demo: { bg: c.brand.accent, fg: c.onTrack },
    locked: { bg: c.bg.subtle, fg: c.text.secondary },
    nouveau: { bg: c.brand.soft, fg: c.brand.primary },
    en_cours: { bg: c.bg.subtle, fg: c.brand.primary },
    a_revoir: { bg: c.feedback.warningSoft, fg: c.text.primary },
    maitrise: { bg: c.feedback.successSoft, fg: c.feedback.successText },
    verrouille: { bg: c.bg.subtle, fg: c.text.secondary },
    reussi: { bg: c.brand.accent, fg: c.onTrack },
  };
  return (
    <View style={[styles.badge, { backgroundColor: look[kind].bg }]}>
      <Text style={[styles.text, { color: look[kind].fg }]}>
        {kind === 'verrouille' ? '🔒 ' : kind === 'reussi' ? '⚡ ' : ''}
        {t.badges[kind]}
      </Text>
    </View>
  );
}

export function badgeLabel(kind: BadgeKind, t: Dict) {
  return t.badges[kind];
}

const useStyles = makeStyles(() => ({
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  text: typography.caption,
}));
