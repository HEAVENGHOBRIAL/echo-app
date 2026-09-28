// Choisir un nouveau mot de passe (page ouverte depuis le lien reçu par email)
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Alert } from '@/components/Alert';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useT } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { makeStyles } from '@/lib/theme';
import { MIN_PASSWORD_LENGTH, validatePassword } from '@/lib/validation';
import { typography } from '@/theme';

export default function ResetPassword() {
  const styles = useStyles();
  const t = useT();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [failMsg, setFailMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  async function save() {
    setFailMsg(null);
    const pErr = validatePassword(password, t);
    const cErr = !pErr && password !== confirm ? t.reset.mismatch : null;
    setPasswordError(pErr);
    setConfirmError(cErr);
    if (pErr) return passwordRef.current?.focus();
    if (cErr) return confirmRef.current?.focus();

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (!error) return setDone(true);
    if (error.code === 'same_password') {
      setPasswordError(t.reset.samePassword);
      passwordRef.current?.focus();
    } else if (error.code === 'weak_password') {
      setPasswordError(t.signup.weakPassword);
      passwordRef.current?.focus();
    } else if (error.name === 'AuthRetryableFetchError' || error.status === 0) {
      setFailMsg(t.common.noConnectionMsg);
    } else {
      setFailMsg(t.common.genericError);
    }
  }

  return (
    <Screen>
      <Logo />
      <View style={styles.header}>
        <Text role="heading" aria-level={1} style={styles.title}>
          {t.reset.title}
        </Text>
        <Text style={styles.subtitle}>{t.reset.subtitle}</Text>
      </View>

      {done ? (
        <>
          <Alert type="success" title={t.reset.doneTitle} message={t.reset.doneMsg} />
          <Button label={t.reset.goHome} onPress={() => router.replace('/home')} />
        </>
      ) : (
        <>
          {failMsg && <Alert type="error" title={t.reset.failTitle} message={failMsg} />}
          <TextField
            ref={passwordRef}
            label={t.reset.password}
            password
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              setPasswordError(null);
            }}
            error={passwordError}
            placeholder={t.signup.passwordPh(MIN_PASSWORD_LENGTH)}
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
            submitBehavior="submit"
          />
          <TextField
            ref={confirmRef}
            label={t.reset.confirm}
            password
            value={confirm}
            onChangeText={(v) => {
              setConfirm(v);
              setConfirmError(null);
            }}
            error={confirmError}
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="done"
            onSubmitEditing={save}
          />
          <Button label={t.reset.submit} onPress={save} loading={loading} />
        </>
      )}
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  header: { gap: 6 },
  title: { ...typography.h1, color: c.text.primary },
  subtitle: { ...typography.body, color: c.text.secondary },
}));
