// Écrans 02 · Connexion et 03 · Connexion — erreur (Figma nodes 7:28 et 7:55)
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Alert } from '@/components/Alert';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { TextLink } from '@/components/TextLink';
import { useT } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { makeStyles } from '@/lib/theme';
import { validateEmail } from '@/lib/validation';
import { spacing, typography } from '@/theme';

type FormAlert = { title: string; message: string; type: 'error' | 'info' };

export default function Login() {
  const styles = useStyles();
  const t = useT();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [alert, setAlert] = useState<FormAlert | null>(null);
  const [loading, setLoading] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  async function handleLogin() {
    setAlert(null);

    // 1. Vérifs rapides dans l'app
    const eErr = validateEmail(email, t);
    const pErr = password ? null : t.validation.passwordEmpty;
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr) return emailRef.current?.focus();
    if (pErr) return passwordRef.current?.focus();

    // 2. Connexion Supabase
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);

    // Si ça marche, _layout.tsx redirige tout seul vers l'accueil
    if (!error) return;

    if (error.code === 'invalid_credentials') {
      setAlert({ type: 'error', title: t.login.invalidTitle, message: t.login.invalidMsg });
      setPasswordError(t.login.checkPassword);
      passwordRef.current?.focus();
    } else if (error.code === 'email_not_confirmed') {
      setAlert({ type: 'info', title: t.login.notConfirmedTitle, message: t.login.notConfirmedMsg });
    } else if (error.name === 'AuthRetryableFetchError' || error.status === 0) {
      setAlert({ type: 'error', title: t.common.noConnectionTitle, message: t.common.noConnectionMsg });
    } else {
      setAlert({ type: 'error', title: t.login.invalidTitle, message: t.common.genericError });
    }
  }

  return (
    <Screen>
      <BackButton />
      <Logo />

      <View style={styles.header}>
        <Text role="heading" aria-level={1} style={styles.title}>
          {t.login.title}
        </Text>
        <Text style={styles.subtitle}>{t.login.subtitle}</Text>
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
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        submitBehavior="submit"
      />

      <TextField
        ref={passwordRef}
        label={t.login.password}
        password
        value={password}
        onChangeText={(v) => {
          setPassword(v);
          setPasswordError(null);
        }}
        error={passwordError}
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={handleLogin}
      />

      <View style={styles.forgot}>
        <TextLink
          label={t.login.forgot}
          onPress={() => router.push({ pathname: '/forgot-password', params: email ? { email: email.trim() } : {} })}
        />
      </View>

      <View style={styles.spacer} />

      <Button label={t.login.submit} onPress={handleLogin} loading={loading} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>{t.login.noAccount}</Text>
        <TextLink label={t.login.createAccount} onPress={() => router.replace('/signup')} />
      </View>
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  header: { gap: 6 },
  title: { ...typography.h1, color: c.text.primary },
  subtitle: { ...typography.body, color: c.text.secondary },
  forgot: { alignItems: 'flex-end' },
  spacer: { flexGrow: 1, minHeight: spacing.md },
  footer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', columnGap: spacing.xs },
  footerText: { ...typography.body, color: c.text.secondary },
}));
