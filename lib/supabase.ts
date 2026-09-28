import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    // La session reste enregistrée sur le téléphone (on reste connectée après fermeture de l'app)
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Sur le web : on lit la session dans l'URL des liens reçus par email
    // (confirmation d'inscription, réinitialisation du mot de passe)
    detectSessionInUrl: Platform.OS === 'web',
  },
});

// Adresse où renvoient les liens envoyés par email (ex : https://echo.vercel.app/reset-password)
export function authRedirectUrl(path: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') return `${window.location.origin}${path}`;
  return undefined;
}

// Sur mobile : on rafraîchit le token seulement quand l'app est au premier plan
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
