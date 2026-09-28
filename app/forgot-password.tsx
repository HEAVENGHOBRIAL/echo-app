// Mot de passe oublié : on envoie un lien de réinitialisation par email (Supabase Auth)
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Alert } from '@/components/Alert';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { TextLink } from '@/components/TextLink';
import { useT } from '@/lib/i18n';
import { authRedirectUrl, supabase } from '@/lib/supabase';
import { makeStyles } from '@/lib/theme';
import { validateEmail } from '@/lib/validation';
import { typography } from '@/theme';

type FormAlert = { type: 'success' | 'error'; title: string; message: string };

export default function ForgotPassword() {
  const styles = useStyles();
  const t = useT();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [alert, setAlert] = useState<FormAlert | null>(null);
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<TextInput>(null);

  async function send() {
    setAlert(null);
    const err = validateEmail(email, t);
    setEmailError(err);
    if (err) return emailRef.current?.focus();

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: authRedirectUrl('/reset-password'),
    });
    setLoading(false);

    if (error?.status === 429 || error?.code === 'over_email_send_rate_limit') {
      setAlert({ type: 'error', title: t.forgot.tooManyTitle, message: t.forgot.tooManyMsg });
    } else if (error && (error.name === 'AuthRetryableFetchError' || error.status === 0)) {
      setAlert({ type: 'error', title: t.common.noConnectionTitle, message: t.common.noConnectionMsg });
    } else {
      // Même message que le compte existe ou non : on ne révèle pas quels emails sont inscrits
      setAlert({ type: 'success', title: t.forgot.sentTitle, message: t.forgot.sentMsg(email.trim()) });
    }
  }

  return (
    <Screen>
      <BackButton />
      <View style={styles.header}>
        <Text role="heading" aria-level={1} style={styles.title}>
          {t.forgot.title}
        </Text>
        <Text style={styles.subtitle}>{t.forgot.subtitle}</Text>
      </View>

      {alert && <Alert type={alert.type} title={alert.title} message={alert.message} />}

      <TextField
        ref={emailRef}
        label={t.login.email}
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          setEmailError(null);
        }}
        error={emailError}
        placeholder={t.login.emailPh}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="send"
        onSubmitEditing={send}
      />
      <Button label={t.forgot.submit} onPress={send} loading={loading} />

      <View style={styles.center}>
        <TextLink label={t.forgot.backToLogin} onPress={() => router.replace('/login')} />
      </View>
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  header: { gap: 6 },
  title: { ...typography.h1, color: c.text.primary },
  subtitle: { ...typography.body, color: c.text.secondary },
  center: { alignItems: 'center' },
}));
