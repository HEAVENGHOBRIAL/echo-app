import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold } from '@expo-google-fonts/dm-sans';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';
import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { LanguageProvider } from '@/lib/i18n';
import { NetworkProvider } from '@/lib/network';
import { ThemeProvider, useTheme } from '@/lib/theme';

// On garde l'écran de démarrage tant que les polices et la session ne sont pas prêtes
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    SpaceGrotesk_700Bold,
    JetBrainsMono_400Regular,
  });

  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <NetworkProvider>
            <RootNavigator />
          </NetworkProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { session, isGuest, loading } = useAuth();
  const { colors, scheme } = useTheme();

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync().catch(() => {});
  }, [loading]);

  if (loading) return null;

  const signedIn = !!session;

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg.app },
        }}
      >
        {/* L'ordre compte : si un écran est interdit, Expo Router ouvre le 1er écran autorisé.
            Donc les onglets en premier (connectée / invitée), puis l'onboarding (déconnectée). */}

        {/* Dans l'app : connectée ou invitée */}
        <Stack.Protected guard={signedIn || isGuest}>
          <Stack.Screen name="(tabs)" options={{ title: 'Echo' }} />
          <Stack.Screen name="track/[slug]" options={{ title: 'Echo' }} />
          <Stack.Screen name="review" options={{ title: 'Echo', gestureEnabled: false }} />
          <Stack.Screen name="results" options={{ title: 'Echo' }} />
          <Stack.Screen name="challenge" options={{ title: 'Echo', gestureEnabled: false }} />
        </Stack.Protected>

        {/* Espace admin : compte connecté obligatoire (AdminGate vérifie ensuite is_admin).
            reset-password : ouvert depuis le lien email, qui connecte l'utilisatrice. */}
        <Stack.Protected guard={signedIn}>
          <Stack.Screen name="reset-password" options={{ title: 'Echo' }} />
          <Stack.Screen name="admin/index" options={{ title: 'Echo — Admin' }} />
          <Stack.Screen name="admin/deck/[id]" options={{ title: 'Echo — Admin' }} />
          <Stack.Screen name="admin/card/[id]" options={{ title: 'Echo — Admin' }} />
        </Stack.Protected>

        {/* Pas encore entrée dans l'app : onboarding */}
        <Stack.Protected guard={!signedIn && !isGuest}>
          <Stack.Screen name="index" options={{ title: 'Echo' }} />
        </Stack.Protected>

        {/* Connexion / inscription : accessibles tant qu'on n'est pas connectée (même en invitée) */}
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="login" options={{ title: 'Echo' }} />
          <Stack.Screen name="signup" options={{ title: 'Echo' }} />
          <Stack.Screen name="forgot-password" options={{ title: 'Echo' }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}
