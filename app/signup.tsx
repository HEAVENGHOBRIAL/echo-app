// Écrans 04 · Inscription et 05 · Inscription — erreur (Figma nodes 7:88 et 7:120)
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Alert } from '@/components/Alert';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { TextLink } from '@/components/TextLink';
import { useT } from '@/lib/i18n';
import { authRedirectUrl, supabase } from '@/lib/supabase';
import { makeStyles } from '@/lib/theme';
import { MIN_PASSWORD_LENGTH, validateEmail, validateFirstName, validatePassword } from '@/lib/validation';
import { spacing, typography } from '@/theme';

type FormAlert = { title: string; message: string; type: 'error' | 'success' };

export default function Signup() {
  const styles = useStyles();
  const t = useT();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);

  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [alert, setAlert] = useState<FormAlert | null>(null);
  const [loading, setLoading] = useState(false);

  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  async function handleSignup() {
    setAlert(null);

    // 1. Vérifs rapides dans l'app
    const nErr = validateFirstName(firstName, t);
    const eErr = validateEmail(email, t);
    const pErr = validatePassword(password, t);
    const tErr = accepted ? null : t.signup.termsError;
    setNameError(nErr);
    setEmailError(eErr);
    setPasswordError(pErr);
    setTermsError(tErr);
    // On place le curseur sur le premier champ à corriger
    if (nErr) return nameRef.current?.focus();
    if (eErr) return emailRef.current?.focus();
    if (pErr) return passwordRef.current?.focus();
    if (tErr) return;

    // 2. Inscription Supabase. Le prénom part dans les metadata :
    //    le trigger on_auth_user_created le copie dans profiles.display_name
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      // Le lien de confirmation par email ramène sur l'app (web)
      options: { data: { display_name: firstName.trim() }, emailRedirectTo: authRedirectUrl('/home') },
    });
    setLoading(false);

    // Supabase peut renvoyer un faux "succès" sans identité quand l'email existe déjà
    const alreadyUsed =
      error?.code === 'user_already_exists' ||
      error?.code === 'email_exists' ||
      (!error && data.user?.identities?.length === 0);

    if (alreadyUsed) {
      setEmailError(t.signup.emailUsed);
      emailRef.current?.focus();
      return;
    }

    if (error) {
      if (error.code === 'weak_password') {
        setPasswordError(t.signup.weakPassword);
        passwordRef.current?.focus();
      } else if (error.name === 'AuthRetryableFetchError' || error.status === 0) {
        setAlert({ type: 'error', title: t.common.noConnectionTitle, message: t.common.noConnectionMsg });
      } else {
        setAlert({ type: 'error', title: t.signup.failTitle, message: t.common.genericError });
      }
      return;
    }

    // Si la confirmation par email est activée, il n'y a pas encore de session
    if (!data.session) {
      setAlert({ type: 'success', title: t.signup.checkEmailTitle, message: t.signup.checkEmailMsg(email.trim()) });
    }
    // Sinon : session créée → _layout.tsx redirige vers l'accueil
  }

  return (
    <Screen>
      <BackButton />

      <View style={styles.header}>
        <Text role="heading" aria-level={1} style={styles.title}>
          {t.signup.title}
        </Text>
        <Text style={styles.subtitle}>{t.signup.subtitle}</Text>
      </View>

      {alert && <Alert type={alert.type} title={alert.title} message={alert.message} />}

      <TextField
        ref={nameRef}
        label={t.signup.firstName}
        value={firstName}
        onChangeText={(v) => {
          setFirstName(v);
          setNameError(null);
        }}
        error={nameError}
        autoCapitalize="words"
        autoComplete="given-name"
        textContentType="givenName"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
        submitBehavior="submit"
      />

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
        placeholder={t.signup.passwordPh(MIN_PASSWORD_LENGTH)}
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
      />

      <Checkbox
        label={t.signup.terms}
        checked={accepted}
        onChange={(v) => {
          setAccepted(v);
          setTermsError(null);
        }}
        error={termsError}
      />
      <View style={styles.termsLink}>
        <TextLink label={t.terms.read} onPress={() => router.push('/terms')} />
      </View>

      <View style={styles.spacer} />

      <Button label={t.signup.submit} onPress={handleSignup} loading={loading} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>{t.signup.haveAccount}</Text>
        <TextLink
          label={t.onboarding.signIn}
          onPress={() => router.replace({ pathname: '/login', params: email ? { email: email.trim() } : {} })}
        />
      </View>
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  header: { gap: 6 },
  title: { ...typography.h1, color: c.text.primary },
  subtitle: { ...typography.body, color: c.text.secondary },
  spacer: { flexGrow: 1, minHeight: spacing.md },
  termsLink: { alignItems: 'flex-start', marginTop: -spacing.sm },
  footer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', columnGap: spacing.xs },
  footerText: { ...typography.body, color: c.text.secondary },
}));
