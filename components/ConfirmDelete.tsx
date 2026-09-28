import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { useT } from '@/lib/i18n';
import { makeStyles } from '@/lib/theme';
import { spacing, typography } from '@/theme';

type Props = {
  label: string; // ex : "Supprimer la carte"
  warning: string; // ex : "La carte et les révisions liées seront supprimées."
  onConfirm: () => Promise<void> | void;
};

// Suppression en 2 étapes (pas de popup : marche pareil sur web et mobile)
export function ConfirmDelete({ label, warning, onConfirm }: Props) {
  const styles = useStyles();
  const t = useT();
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!asking) {
    return <Button label={label} variant="secondary" onPress={() => setAsking(true)} />;
  }

  return (
    <View style={styles.box} role="alert">
      <Text style={styles.title}>{t.confirm.sure}</Text>
      <Text style={styles.text}>
        {warning} {t.confirm.definitive}
      </Text>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Button label={t.confirm.cancel} variant="secondary" onPress={() => setAsking(false)} />
        </View>
        <View style={styles.flex}>
          <Button
            label={t.confirm.delete}
            loading={busy}
            onPress={async () => {
              setBusy(true);
              try {
                await onConfirm();
              } finally {
                setBusy(false);
                setAsking(false);
              }
            }}
          />
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  box: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.feedback.error,
    backgroundColor: c.feedback.errorSoft,
  },
  title: { ...typography.h3, color: c.feedback.errorText },
  text: { ...typography.bodySmall, color: c.text.primary },
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  flex: { flex: 1 },
}));
