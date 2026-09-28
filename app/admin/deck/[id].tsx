// Espace admin : créer / modifier un deck et gérer ses cartes
//   /admin/deck/new?track=2   → nouveau deck dans le parcours 2
//   /admin/deck/6             → modifier le deck 6
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AdminGate } from '@/components/AdminGate';
import { Alert } from '@/components/Alert';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { ConfirmDelete } from '@/components/ConfirmDelete';
import { focusStyles, type PressState } from '@/components/focus';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { LoadError, Loading } from '@/components/StateViews';
import { TextField } from '@/components/TextField';
import { adminErrorMessage, createDeck, deleteDeck, getAdminCards, swapCards, updateDeck } from '@/lib/admin';
import { getLevel } from '@/lib/api';
import { pick, useLang, useT } from '@/lib/i18n';
import { makeStyles } from '@/lib/theme';
import type { Card } from '@/lib/types';
import { useData } from '@/lib/useData';
import { fonts, spacing, typography } from '@/theme';

export default function AdminDeck() {
  const styles = useStyles();
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  return (
    <Screen maxWidth={640}>
      <BackButton />
      <Text role="heading" aria-level={1} style={styles.title}>
        {isNew ? t.admin.newDeck : t.admin.editDeck}
      </Text>
      <AdminGate>
        <DeckEditor id={isNew ? null : Number(id)} />
      </AdminGate>
    </Screen>
  );
}

function DeckEditor({ id }: { id: number | null }) {
  const styles = useStyles();
  const { t, lang } = useLang();
  const { track } = useLocalSearchParams<{ track?: string }>();
  const { data, error, loading, reload } = useData(async () => {
    if (!id) return { level: null, cards: [] as Card[] };
    const [level, cards] = await Promise.all([getLevel(id), getAdminCards(id)]);
    return { level, cards };
  }, [id]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [isDemo, setIsDemo] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Remplit le formulaire une fois le deck chargé
  useEffect(() => {
    if (data?.level) {
      setTitle(data.level.title ?? '');
      setDescription(data.level.description ?? '');
      setTitleEn(data.level.title_en ?? '');
      setDescriptionEn(data.level.description_en ?? '');
      setIsDemo(data.level.is_demo);
    }
  }, [data?.level]);

  if (!data && loading) return <Loading />;
  if (!data || error) return <LoadError onRetry={reload} />;
  if (id && !data.level) return <Text style={styles.meta}>{t.admin.deckNotFound}</Text>;

  async function save() {
    setStatus(null);
    if (!title.trim()) {
      setTitleError(t.admin.deckRequired);
      return;
    }
    setSaving(true);
    const input = {
      title: title.trim(),
      description: description.trim(),
      title_en: titleEn.trim() || null,
      description_en: descriptionEn.trim() || null,
      is_demo: isDemo,
    };
    try {
      if (id) {
        await updateDeck(id, input);
        setStatus({ type: 'success', message: t.admin.deckSaved });
      } else {
        const created = await createDeck(Number(track), input);
        router.replace(`/admin/deck/${created.id}`);
      }
    } catch (e) {
      setStatus({ type: 'error', message: adminErrorMessage(e, t) });
    } finally {
      setSaving(false);
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const cards = data!.cards;
    const other = cards[index + direction];
    if (!other) return;
    try {
      await swapCards(cards[index], other);
      reload();
    } catch (e) {
      setStatus({ type: 'error', message: adminErrorMessage(e, t) });
    }
  }

  return (
    <>
      {status && (
        <Alert type={status.type} title={status.type === 'success' ? t.admin.done : t.admin.oops} message={status.message} />
      )}

      <TextField
        label={t.admin.deckTitle}
        value={title}
        onChangeText={(v) => {
          setTitle(v);
          setTitleError(null);
        }}
        error={titleError}
        placeholder={t.admin.deckTitlePh}
      />
      <TextField label={t.admin.deckDesc} value={description} onChangeText={setDescription} placeholder={t.admin.deckDescPh} />
      <TextField label={t.admin.titleEn} value={titleEn} onChangeText={setTitleEn} />
      <TextField label={t.admin.descEn} value={descriptionEn} onChangeText={setDescriptionEn} />
      <Checkbox label={t.admin.demoCheckbox} checked={isDemo} onChange={setIsDemo} />
      <Button label={id ? t.admin.saveDeck : t.admin.createDeck} onPress={save} loading={saving} />

      {id && (
        <>
          <SectionHeader title={t.admin.cardsCount(data.cards.length)} />
          <Button label={t.admin.addCard} variant="secondary" onPress={() => router.push(`/admin/card/new?deck=${id}`)} />

          <View style={styles.list}>
            {data.cards.map((card, i) => {
              const front = pick(lang, card.front, card.front_en);
              return (
                <View key={card.id} style={styles.cardRow}>
                  <Pressable
                    onPress={() => router.push(`/admin/card/${card.id}`)}
                    accessibilityRole="button"
                    accessibilityLabel={t.admin.editCardLabel(i + 1, front)}
                    style={({ pressed, focused }: PressState) => [
                      styles.cardMain,
                      pressed && { opacity: 0.7 },
                      focused && focusStyles.ring,
                    ]}
                  >
                    <Text style={styles.order}>{i + 1}</Text>
                    <View style={styles.cardInfo}>
                      <Text style={styles.front}>{front}</Text>
                      <Text style={styles.snippet} numberOfLines={1}>
                        {card.code_snippet?.split('\n').join('  ')}
                      </Text>
                    </View>
                  </Pressable>
                  <View style={styles.arrows}>
                    <ArrowButton label={t.admin.moveUp(front)} symbol="↑" disabled={i === 0} onPress={() => move(i, -1)} />
                    <ArrowButton
                      label={t.admin.moveDown(front)}
                      symbol="↓"
                      disabled={i === data.cards.length - 1}
                      onPress={() => move(i, 1)}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.danger}>
            {data.cards.length === 0 ? (
              <ConfirmDelete
                label={t.admin.deleteDeck}
                warning={t.admin.deleteDeckWarn}
                onConfirm={async () => {
                  try {
                    await deleteDeck(id);
                    router.replace('/admin');
                  } catch (e) {
                    setStatus({ type: 'error', message: adminErrorMessage(e, t) });
                  }
                }}
              />
            ) : (
              <Text style={styles.meta}>{t.admin.deleteCardsFirst}</Text>
            )}
          </View>
        </>
      )}
    </>
  );
}

function ArrowButton({ label, symbol, disabled, onPress }: { label: string; symbol: string; disabled: boolean; onPress: () => void }) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      aria-disabled={disabled}
      style={({ pressed, focused }: PressState) => [
        styles.arrow,
        disabled && { opacity: 0.3 },
        pressed && styles.arrowPressed,
        focused && focusStyles.ring,
      ]}
    >
      <Text style={styles.arrowText}>{symbol}</Text>
    </Pressable>
  );
}

const useStyles = makeStyles((c) => ({
  title: { ...typography.h1, color: c.text.primary },
  meta: { ...typography.bodySmall, color: c.text.secondary },
  list: { gap: spacing.sm },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    backgroundColor: c.bg.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 16,
  },
  cardMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, borderRadius: 8 },
  order: { ...typography.label, color: c.text.secondary, minWidth: 20 },
  cardInfo: { flex: 1, gap: 2 },
  front: { ...typography.h3, color: c.text.primary },
  snippet: { fontFamily: fonts.code, fontSize: 12, color: c.text.secondary },
  arrows: { flexDirection: 'row' },
  arrow: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22 },
  arrowPressed: { backgroundColor: c.bg.subtle },
  arrowText: { fontSize: 20, color: c.brand.primary },
  danger: { marginTop: spacing.lg },
}));
