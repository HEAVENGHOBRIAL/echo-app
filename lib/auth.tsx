import type { Session } from '@supabase/supabase-js';
import { router } from 'expo-router';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { clearGuestAnswers, flushQueue, importGuestAnswers } from '@/lib/sync';

type AuthState = {
  session: Session | null;
  isGuest: boolean;
  // true tant qu'on ne sait pas encore si l'utilisatrice est connectée
  loading: boolean;
  startGuest: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

// Donne à toute l'app : la session Supabase + le mode invité.
// Le mode invité n'est gardé qu'en mémoire : si on ferme l'app, on repart de zéro.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Au lancement : session déjà enregistrée ?
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      // Réponses hors ligne restées en attente depuis la dernière fois
      if (data.session) flushQueue().catch(() => {});
    });

    // 2. Ensuite : on suit chaque connexion / déconnexion
    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (newSession) setIsGuest(false);
      if (event === 'PASSWORD_RECOVERY') {
        // Lien "mot de passe oublié" ouvert : on va choisir un nouveau mot de passe
        setTimeout(() => router.replace('/reset-password'), 0);
      }
      if (event === 'SIGNED_IN') {
        // On importe les cartes révisées en mode invité dans le compte, puis la file hors ligne.
        // setTimeout : Supabase déconseille d'appeler l'API directement dans ce callback.
        setTimeout(() => {
          importGuestAnswers()
            .then(flushQueue)
            .catch(() => {});
        }, 0);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  function startGuest() {
    clearGuestAnswers();
    setIsGuest(true);
  }

  async function signOut() {
    // Quitter le mode invité = on efface la progression de la démo
    clearGuestAnswers();
    setIsGuest(false);
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ session, isGuest, loading, startGuest, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>');
  return ctx;
}
