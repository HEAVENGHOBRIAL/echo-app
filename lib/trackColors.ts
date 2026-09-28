import { lightColors } from '@/theme';

// Couleur d'un parcours à partir de son slug (repli si la colonne "color" est vide).
// Les couleurs de parcours sont les mêmes en mode clair et sombre.
export function trackColor(slug: string | null | undefined, fallback?: string | null) {
  if (fallback) return fallback;
  if (slug === 'backend') return lightColors.track.backend;
  if (slug === 'js-react') return lightColors.track.js;
  return lightColors.track.frontend;
}
