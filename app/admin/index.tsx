// Espace admin : liste des parcours et de leurs decks
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { AdminGate } from '@/components/AdminGate';
import { BackButton } from '@/components/BackButton';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { focusStyles, type PressState } from '@/components/focus';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { LoadError, Loading } from '@/components/StateViews';
import { getTracksOverview } from '@/lib/api';
import { pick, useLang, useT } from '@/lib/i18n';
import { makeStyles } from '@/lib/theme';
import { trackColor } from '@/lib/trackColors';
import { useData } from '@/lib/useData';
import { spacing, typography } from '@/theme';

export default function AdminHome() {
  const styles = useStyles();
  const t = useT();
  return (
    <Screen maxWidth={640}>
      <BackButton />
      <View style={styles.header}>
        <Text role="heading" aria-level={1} style={styles.title}>
          {t.admin.title}
        </Text>
        <Text style={styles.subtitle}>{t.admin.subtitle}</Text>
      </View>
      <AdminGate>
        <TrackList />
      </AdminGate>
    </Screen>
  );
}

function TrackList() {
  const styles = useStyles();
  const { t, lang } = useLang();
  const { data, error, loading, reload } = useData(() => getTracksOverview(false), []);

  if (!data && loading) return <Loading />;
  if (!data || error) return <LoadError onRetry={reload} />;

  return (
    <>
      {data.map((track) => (
        <View key={track.id} style={styles.section}>
          <View style={styles.trackHead}>
            <View style={[styles.dot, { backgroundColor: trackColor(track.slug, track.color) }]} aria-hidden />
            <SectionHeader title={`${track.name} · ${t.common.cards(track.cardsTotal)}`} />
          </View>

          <View style={styles.list}>
            {track.decks.map((deck) => {
              const title = pick(lang, deck.title, deck.title_en);
              return (
                <Pressable
                  key={deck.id}
                  onPress={() => router.push(`/admin/deck/${deck.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={t.admin.editDeckLabel(title, deck.cardCount, deck.is_demo)}
                  style={({ pressed, focused }: PressState) => [styles.row, pressed && styles.rowPressed, focused && focusStyles.ring]}
                >
                  <Text style={styles.order}>{deck.level_number}</Text>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowTitle}>{title}</Text>
                    <Text style={styles.rowMeta}>
                      {t.common.cards(deck.cardCount)} · {pick(lang, deck.description, deck.description_en)}
                    </Text>
                  </View>
                  {deck.is_demo && <Badge kind="demo" />}
                  <Text style={styles.chevron} aria-hidden>
                    ›
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Button
            label={t.admin.addDeck(track.name)}
            variant="secondary"
            onPress={() => router.push(`/admin/deck/new?track=${track.id}`)}
          />
        </View>
      ))}
    </>
  );
}

const useStyles = makeStyles((c) => ({
  header: { gap: 2 },
  title: { ...typography.h1, color: c.text.primary },
  subtitle: { ...typography.body, color: c.text.secondary },
  section: { gap: spacing.sm, marginBottom: spacing.md },
  trackHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 14, height: 14, borderRadius: 7 },
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    backgroundColor: c.bg.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 16,
  },
  rowPressed: { backgroundColor: c.bg.subtle },
  order: { ...typography.label, color: c.text.secondary, minWidth: 18 },
  rowInfo: { flex: 1, gap: 2 },
  rowTitle: { ...typography.h3, color: c.text.primary },
  rowMeta: { ...typography.bodySmall, color: c.text.secondary },
  chevron: { fontSize: 24, color: c.text.secondary },
}));
