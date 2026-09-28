import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { LoadError, Loading } from '@/components/StateViews';
import { getProfile } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useT } from '@/lib/i18n';
import { makeStyles } from '@/lib/theme';
import { useData } from '@/lib/useData';
import { spacing, typography } from '@/theme';

// N'affiche l'espace admin qu'aux comptes avec is_admin = true
export function AdminGate({ children }: { children: ReactNode }) {
  const styles = useStyles();
  const t = useT();
  const { session } = useAuth();
  const userId = session?.user.id;
  const { data, error, loading, reload } = useData(
    () => (userId ? getProfile(userId) : Promise.resolve(null)),
    [userId],
  );

  if (!data && loading) return <Loading />;
  if (error) return <LoadError onRetry={reload} />;
  if (!data?.is_admin) {
    return (
      <View style={styles.box} role="alert">
        <Text style={styles.title}>{t.admin.reservedTitle}</Text>
        <Text style={styles.text}>{t.admin.reservedMsg}</Text>
        <Button label={t.admin.backHome} variant="secondary" onPress={() => router.replace('/home')} />
      </View>
    );
  }
  return <>{children}</>;
}

const useStyles = makeStyles((c) => ({
  box: { gap: spacing.md, paddingVertical: spacing.xl },
  title: { ...typography.h2, color: c.text.primary },
  text: { ...typography.body, color: c.text.secondary },
}));
