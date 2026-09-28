import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { makeStyles } from '@/lib/theme';
import { layout, spacing } from '@/theme';

type Props = {
  children: ReactNode;
  // Largeur max du contenu (par défaut : colonne de 440 px centrée sur grand écran)
  maxWidth?: number;
  // Dans les onglets, la barre du bas gère déjà la zone sûre du bas
  edges?: Edge[];
};

// Conteneur commun à tous les écrans :
// - respecte les zones sûres (encoche, barre du bas)
// - défile si l'écran est petit ou si le texte est agrandi (accessibilité)
// - remonte au-dessus du clavier
// - reste centré et pas trop large sur ordinateur
export function Screen({ children, maxWidth = layout.maxContentWidth, edges = ['top', 'bottom'] }: Props) {
  const styles = useStyles();
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={[styles.content, { maxWidth }]}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((c) => ({
  safe: { flex: 1, backgroundColor: c.bg.app },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  content: { flex: 1, width: '100%', gap: spacing.md },
}));
