import type { SessionResult } from '@/lib/types';

// Dernier résultat de révision, lu par l'écran Résultats.
// (Simple variable en mémoire : pas besoin de le garder après fermeture de l'app.)
let last: SessionResult | null = null;

export function setLastResult(result: SessionResult) {
  last = result;
}

export function getLastResult() {
  return last;
}
