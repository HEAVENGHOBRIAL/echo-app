// Espace admin : créer / modifier une carte, avec aperçu en direct du verso
//   /admin/card/new?deck=6   → nouvelle carte dans le deck 6
//   /admin/card/12           → modifier la carte 12
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { AdminGate } from '@/components/AdminGate';
import { Alert } from '@/components/Alert';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/Button';
import { ConfirmDelete } from '@/components/ConfirmDelete';
import { FlashCard } from '@/components/FlashCard';
import { Screen } from '@/components/Screen';
import { LoadError, Loading } from '@/components/StateViews';
import { TextField } from '@/components/TextField';
import { adminErrorMessage, createCard, deleteCard, getCard, updateCard } from '@/lib/admin';
import { getLevel, getTracksOverview } from '@/lib/api';
import { pick, useLang, useT } from '@/lib/i18n';
import { makeStyles } from '@/lib/theme';
import { useData } from '@/lib/useData';
import { fonts, layout, spacing, typography } from '@/theme';

export default function AdminCard() {
  const styles = useStyles();
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const { width } = useWindowDimensions();
  const wide = width >= layout.wideBreakpoint;
  return (
    <Screen maxWidth={wide ? 1000 : layout.maxContentWidth}>
      <BackButton />
      <Text role="heading" aria-level={1} style={styles.title}>
        {isNew ? t.admin.newCard : t.admin.editCard}
      </Text>
      <AdminGate>
        <CardEditor id={isNew ? null : Number(id)} wide={wide} />
      </AdminGate>
    </Screen>
  );
}

function CardEditor({ id, wide }: { id: number | null; wide: boolean }) {
  const styles = useStyles();
  const { t, lang } = useLang();
  const params = useLocalSearchParams<{ deck?: string }>();

  const { data, error, loading, reload } = useData(async () => {
    const card = id ? await getCard(id) : null;
    const levelId = card?.level_id ?? Number(params.deck);
    const [level, tracks] = await Promise.all([getLevel(levelId), getTracksOverview(false)]);
    const trackSlug = tracks.find((tr) => tr.id === level?.track_id)?.slug ?? '';
    return { card, level, trackSlug };
  }, [id, params.deck]);

  const [front, setFront] = useState('');
  const [frontEn, setFrontEn] = useState('');
  const [code, setCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [explanationEn, setExplanationEn] = useState('');
  const [frontError, setFrontError] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.card) {
      setFront(data.card.front ?? '');
      setFrontEn(data.card.front_en ?? '');
      setCode(data.card.code_snippet ?? '');
      setExplanation(data.card.explanation_fr ?? '');
      setExplanationEn(data.card.explanation_en ?? '');
    }
  }, [data?.card]);

  if (!data && loading) return <Loading />;
  if (!data || error) return <LoadError onRetry={reload} />;
  if (!data.level) return <Text style={styles.meta}>{t.admin.deckNotFound}</Text>;

  const level = data.level;

  async function save() {
    setStatus(null);
    if (!front.trim()) {
      setFrontError(t.admin.frontRequired);
      return;
    }
    setSaving(true);
    const input = {
      front: front.trim(),
      front_en: frontEn.trim() || null,
      code_snippet: code.replace(/\s+$/, ''),
      explanation_fr: explanation.trim(),
      explanation_en: explanationEn.trim() || null,
    };
    try {
      if (id) {
        await updateCard(id, input);
        setStatus({ type: 'success', message: t.admin.cardSaved });
      } else {
        await createCard(level.id, input);
        router.replace(`/admin/deck/${level.id}`);
      }
    } catch (e) {
      setStatus({ type: 'error', message: adminErrorMessage(e, t) });
    } finally {
      setSaving(false);
    }
  }

  const form = (
    <View style={styles.form}>
      <Text style={styles.meta}>{t.admin.deckOf(pick(lang, level.title, level.title_en))}</Text>
      {status && (
        <Alert type={status.type} title={status.type === 'success' ? t.admin.done : t.admin.oops} message={status.message} />
      )}
      <TextField
        label={t.admin.front}
        value={front}
        onChangeText={(v) => {
          setFront(v);
          setFrontError(null);
        }}
        error={frontError}
        placeholder={t.admin.frontPh}
        autoCapitalize="none"
      />
      <TextField label={t.admin.frontEn} value={frontEn} onChangeText={setFrontEn} autoCapitalize="none" />
      <TextField
        label={t.admin.code}
        value={code}
        onChangeText={setCode}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        placeholder={'.container {\n  display: flex;\n}'}
        style={styles.codeInput}
      />
      <TextField
        label={t.admin.explanation}
        value={explanation}
        onChangeText={setExplanation}
        multiline
        placeholder={t.admin.explanationPh}
        style={styles.textArea}
      />
      <TextField
        label={t.admin.explanationEn}
        value={explanationEn}
        onChangeText={setExplanationEn}
        multiline
        style={styles.textArea}
      />
      <Button label={id ? t.admin.saveCard : t.admin.addCardBtn} onPress={save} loading={saving} />

      {id && (
        <View style={styles.danger}>
          <ConfirmDelete
            label={t.admin.deleteCard}
            warning={t.admin.deleteCardWarn}
            onConfirm={async () => {
              try {
                await deleteCard(id);
                router.replace(`/admin/deck/${level.id}`);
              } catch (e) {
                setStatus({ type: 'error', message: adminErrorMessage(e, t) });
              }
            }}
          />
        </View>
      )}
    </View>
  );

  // L'aperçu suit la langue choisie dans l'app
  const preview = (
    <View style={styles.preview}>
      <Text role="heading" aria-level={2} style={styles.previewTitle}>
        {t.admin.preview}
      </Text>
      <FlashCard
        flipped
        onFlip={() => {}}
        card={{
          id: id ?? 0,
          level_id: level.id,
          card_order: null,
          front: front || '…',
          front_en: frontEn || null,
          code_snippet: code,
          explanation_fr: explanation,
          explanation_en: explanationEn || null,
          deckTitle: level.title ?? '',
          deckTitleEn: level.title_en,
          trackSlug: data.trackSlug,
        }}
      />
    </View>
  );

  // Ordinateur : formulaire à gauche, aperçu à droite. Mobile : l'un sous l'autre.
  return wide ? (
    <View style={styles.columns}>
      {form}
      {preview}
    </View>
  ) : (
    <>
      {form}
      {preview}
    </>
  );
}

const useStyles = makeStyles((c) => ({
  title: { ...typography.h1, color: c.text.primary },
  meta: { ...typography.bodySmall, color: c.text.secondary },
  columns: { flexDirection: 'row', gap: spacing.xl, alignItems: 'flex-start' },
  form: { flex: 1, gap: spacing.md },
  preview: { flex: 1, gap: spacing.sm },
  previewTitle: { ...typography.h2, color: c.text.primary },
  codeInput: { minHeight: 140, fontFamily: fonts.code, fontSize: 14, textAlignVertical: 'top' },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  danger: { marginTop: spacing.lg },
}));
