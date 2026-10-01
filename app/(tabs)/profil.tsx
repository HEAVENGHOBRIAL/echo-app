// Onglet Profil
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Alert } from '@/components/Alert';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { SettingsPanel } from '@/components/Settings';
import { TextField } from '@/components/TextField';
import { getProfile, updateDisplayName } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useT } from '@/lib/i18n';
import { makeStyles } from '@/lib/theme';
import { useData } from '@/lib/useData';
import { validateFirstName } from '@/lib/validation';
import { spacing, typography } from '@/theme';

export default function Profil() {
  const styles = useStyles();
  const t = useT();
  const { isGuest } = useAuth();
  return (
    <Screen edges={['top']}>
      <Text role="heading" aria-level={1} style={styles.title}>
        {t.profile.title}
      </Text>
      {isGuest ? <GuestProfile /> : <MemberProfile />}
    </Screen>
  );
}

function GuestProfile() {
  const styles = useStyles();
  const t = useT();
  const { signOut } = useAuth();
  return (
    <>
      <Alert type="info" title={t.profile.guestTitle} message={t.profile.guestMsg} announce={false} />
      <Button label={t.profile.createAccount} onPress={() => router.push('/signup')} />
      <Button label={t.profile.signIn} variant="secondary" onPress={() => router.push('/login')} />
      <SettingsPanel />
      <View style={styles.spacer} />
      <Button label={t.profile.quitGuest} variant="secondary" onPress={signOut} />
    </>
  );
}

function MemberProfile() {
  const styles = useStyles();
  const t = useT();
  const { session, signOut } = useAuth();
  const userId = session!.user.id;
  const { data } = useData(() => getProfile(userId), [userId]);

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<'ok' | 'error' | null>(null);

  useEffect(() => {
    if (data?.display_name) setName(data.display_name);
  }, [data?.display_name]);

  async function save() {
    setSaved(null);
    const err = validateFirstName(name, t);
    setNameError(err);
    if (err) return;
    setSaving(true);
    try {
      await updateDisplayName(userId, name.trim());
      setSaved('ok');
    } catch {
      setSaved('error');
    } finally {
      setSaving(false);
    }
  }

  const initial = (data?.display_name || session?.user.email || '?')[0]?.toUpperCase();

  return (
    <>
      <View style={styles.identity}>
        <View style={styles.avatar} aria-hidden>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.identityText}>
          {!!data?.display_name && <Text style={styles.name}>{data.display_name}</Text>}
          <Text style={styles.email}>{session?.user.email}</Text>
        </View>
      </View>

      {data?.is_admin && (
        <View style={styles.adminBox}>
          <Text style={styles.adminTitle}>{t.profile.adminTitle}</Text>
          <Text style={styles.email}>{t.profile.adminMsg}</Text>
          <Button label={t.profile.openAdmin} onPress={() => router.push('/admin')} />
        </View>
      )}

      {saved === 'ok' && <Alert type="success" title={t.profile.savedTitle} message={t.profile.savedMsg} />}
      {saved === 'error' && <Alert type="error" title={t.profile.saveErrorTitle} message={t.profile.saveErrorMsg} />}

      <TextField
        label={t.signup.firstName}
        value={name}
        onChangeText={(v) => {
          setName(v);
          setNameError(null);
          setSaved(null);
        }}
        error={nameError}
        autoCapitalize="words"
        autoComplete="given-name"
        returnKeyType="done"
        onSubmitEditing={save}
      />
      <Button label={t.profile.save} variant="secondary" onPress={save} loading={saving} />

      <SettingsPanel />

      <View style={styles.spacer} />
      <Button label={t.profile.signOut} onPress={signOut} />
    </>
  );
}

const useStyles = makeStyles((c) => ({
  title: { ...typography.h1, color: c.text.primary },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: c.brand.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.h1, color: c.onTrack },
  identityText: { flex: 1, gap: 2 },
  name: { ...typography.h2, color: c.text.primary },
  email: { ...typography.body, color: c.text.secondary },
  spacer: { flexGrow: 1, minHeight: spacing.lg },
  adminBox: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.brand.primary,
    backgroundColor: c.brand.soft,
  },
  adminTitle: { ...typography.h3, color: c.text.primary },
}));
