// Conditions d'utilisation (lien depuis l'inscription et le profil)
import { Text, View } from 'react-native';
import { BackButton } from '@/components/BackButton';
import { Screen } from '@/components/Screen';
import { useT } from '@/lib/i18n';
import { makeStyles } from '@/lib/theme';
import { spacing, typography } from '@/theme';

export default function Terms() {
  const styles = useStyles();
  const t = useT();
  return (
    <Screen maxWidth={640}>
      <BackButton />
      <Text role="heading" aria-level={1} style={styles.title}>
        {t.terms.title}
      </Text>
      <Text style={styles.updated}>{t.terms.updated}</Text>
      {t.terms.sections.map((s) => (
        <View key={s.title} style={styles.section}>
          <Text role="heading" aria-level={2} style={styles.sectionTitle}>
            {s.title}
          </Text>
          <Text style={styles.body}>{s.body}</Text>
        </View>
      ))}
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  title: { ...typography.h1, color: c.text.primary },
  updated: { ...typography.bodySmall, color: c.text.secondary },
  section: { gap: spacing.xs },
  sectionTitle: { ...typography.h3, color: c.text.primary },
  body: { ...typography.body, color: c.text.secondary },
}));
