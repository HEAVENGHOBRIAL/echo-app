import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

// Charge des données à chaque fois qu'on arrive sur l'écran
// (ex : en revenant d'une révision, l'accueil se met à jour).
export function useData<T>(load: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const loadRef = useRef(load);
  loadRef.current = load;

  const reload = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    loadRef
      .current()
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setError(null);
        }
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message || 'Erreur de chargement');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useFocusEffect(reload);

  return { data, error, loading, reload };
}
