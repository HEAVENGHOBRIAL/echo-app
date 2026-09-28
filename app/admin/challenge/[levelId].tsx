// Espace admin : créer / modifier le défi final d'un deck
//   /admin/challenge/6
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { AdminGate } from '@/components/AdminGate';
import { Alert } from '@/components/Alert';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { ConfirmDelete } from '@/components/ConfirmDelete';
import { Screen } from '@/components/Screen';
import { LoadError, Loading } from '@/components/StateViews';
import { TextField } from '@/components/TextField';
import { adminErrorMessage, deleteChallenge, saveChallenge } from '@/lib/admin';
import { getChallenge, getLevel } from '@/lib/api';
import { pick, useLang, useT } from '@/lib/i18n';
import { makeStyles } from '@/lib/theme';
import { useData } from '@/lib/useData';
import { codeFont, radius, spacing, typography } from '@/theme';

export default function AdminChallenge() {
  const styles = useStyles();
  const t = useT();
  const { levelId } = useLocalSearchParams<{ levelId: string }>();
  return (
    <Screen maxWidth={640}>
      <BackButton />
      <Text role="heading" aria-level={1} style={styles.title}>
        {t.admin.challengeTitle}
      </Text>
      <AdminGate>
        <ChallengeEditor levelId={Number(levelId)} />
      </AdminGate>
    </Screen>
  );
}

// Une carte par ligne (les lignes vides sont ignorées)
const toLines = (text: string) =>
  text
    .split('\n')
    .map((l) => l.replace(/\s+$/, ''))
    .filter((l) => l.trim() !== '');

function ChallengeEditor({ levelId }: { levelId: number }) {
  const styles = useStyles();
  const { t, lang } = useLang();
  const { data, error, loading, reload } = useData(async () => {
    const [level, challenge] = await Promise.all([getLevel(levelId), getChallenge(levelId)]);
    return { level, challenge };
  }, [levelId]);

  const [promptFr, setPromptFr] = useState('');
  const [promptEn, setPromptEn] = useState('');
  const [hintFr, setHintFr] = useState('');
  const [hintEn, setHintEn] = useState('');
  const [codeBefore, setCodeBefore] = useState('');
  const [codeAfter, setCodeAfter] = useState('');
  const [pieces, setPieces] = useState('');
  const [distractors, setDistractors] = useState('');
  const [ordered, setOrdered] = useState(true);
  const [promptError, setPromptError] = useState<string | null>(null);
  const [piecesError, setPiecesError] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Remplit le formulaire avec le défi existant
  useEffect(() => {
    const ch = data?.challenge;
    if (!ch) return;
    setPromptFr(ch.prompt_fr);
    setPromptEn(ch.prompt_en ?? '');
    setHintFr(ch.hint_fr ?? '');
    setHintEn(ch.hint_en ?? '');
    setCodeBefore(ch.code_before ?? '');
    setCodeAfter(ch.code_after ?? '');
    setPieces(ch.pieces.join('\n'));
    setDistractors(ch.distractors.join('\n'));
    setOrdered(ch.ordered);
  }, [data?.challenge]);

  if (!data && loading) return <Loading />;
  if (!data || error) return <LoadError onRetry={reload} />;
  if (!data.level) return <Text style={styles.meta}>{t.admin.deckNotFound}</Text>;

  const level = data.level;
  const solution = [codeBefore.trim(), ...toLines(pieces), codeAfter.trim()].filter(Boolean).join('\n');

  async function save() {
    setStatus(null);
    const pErr = promptFr.trim() ? null : t.admin.promptRequired;
    const cErr = toLines(pieces).length >= 2 ? null : t.admin.piecesRequired;
    setPromptError(pErr);
    setPiecesError(cErr);
    if (pErr || cErr) return;

    setSaving(true);
    try {
      await saveChallenge(level.id, {
        prompt_fr: promptFr.trim(),
        prompt_en: promptEn.trim() || null,
        hint_fr: hintFr.trim() || null,
        hint_en: hintEn.trim() || null,
        code_before: codeBefore.trim() || null,
        code_after: codeAfter.trim() || null,
        pieces: toLines(pieces),
        distractors: toLines(distractors),
        ordered,
      });
      setStatus({ type: 'success', message: t.admin.challengeSaved });
    } catch (e) {
      setStatus({ type: 'error', message: adminErrorMessage(e, t) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Text style={styles.meta}>{t.admin.deckOf(pick(lang, level.title, level.title_en))}</Text>
      {status && (
        <Alert type={status.type} title={status.type === 'success' ? t.admin.done : t.admin.oops} message={status.message} />
      )}

      <TextField
        label={t.admin.promptFr}
        value={promptFr}
        onChangeText={(v) => {
          setPromptFr(v);
          setPromptError(null);
        }}
        error={promptError}
        placeholder={t.admin.promptPh}
        multiline
        style={styles.textArea}
      />
      <TextField label={t.admin.promptEn} value={promptEn} onChangeText={setPromptEn} multiline style={styles.textArea} />
      <TextField label={t.admin.codeBefore} value={codeBefore} onChangeText={setCodeBefore} autoCapitalize="none" style={styles.code} />
      <TextField
        label={t.admin.pieces}
        value={pieces}
        onChangeText={(v) => {
          setPieces(v);
          setPiecesError(null);
        }}
        error={piecesError}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        style={[styles.code, styles.codeArea]}
      />
      <TextField label={t.admin.codeAfter} value={codeAfter} onChangeText={setCodeAfter} autoCapitalize="none" style={styles.code} />
      <TextField
        label={t.admin.distractors}
        value={distractors}
        onChangeText={setDistractors}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        style={[styles.code, styles.codeArea]}
      />
      <Checkbox label={t.admin.ordered} checked={ordered} onChange={setOrdered} />
      <TextField label={t.admin.hintFr} value={hintFr} onChangeText={setHintFr} multiline style={styles.textArea} />
      <TextField label={t.admin.hintEn} value={hintEn} onChangeText={setHintEn} multiline style={styles.textArea} />

      {!!solution && (
        <View style={styles.preview}>
          <Text role="heading" aria-level={2} style={styles.previewTitle}>
            {t.admin.solutionPreview}
          </Text>
          <ScrollView horizontal>
            <Text style={styles.previewCode}>{solution}</Text>
          </ScrollView>
        </View>
      )}

      <Button label={t.admin.saveChallenge} onPress={save} loading={saving} />

      {data.challenge && (
        <View style={styles.danger}>
          <ConfirmDelete
            label={t.admin.deleteChallenge}
            warning={t.admin.deleteChallengeWarn}
            onConfirm={async () => {
              try {
                await deleteChallenge(level.id);
                router.replace(`/admin/deck/${level.id}`);
              } catch (e) {
                setStatus({ type: 'error', message: adminErrorMessage(e, t) });
              }
            }}
          />
        </View>
      )}
    </>
  );
}

const useStyles = makeStyles((c) => ({
  title: { ...typography.h1, color: c.text.primary },
  meta: { ...typography.bodySmall, color: c.text.secondary },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  code: { ...codeFont, fontSize: 14 },
  codeArea: { minHeight: 130, textAlignVertical: 'top' },
  preview: { gap: spacing.sm },
  previewTitle: { ...typography.h3, color: c.text.primary },
  previewCode: {
    ...codeFont,
    fontSize: 14,
    lineHeight: 20,
    color: c.code.text,
    backgroundColor: c.code.bg,
    padding: spacing.md,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  danger: { marginTop: spacing.lg },
}));
