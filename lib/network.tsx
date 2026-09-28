import NetInfo from '@react-native-community/netinfo';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { flushQueue } from '@/lib/sync';

const NetworkContext = createContext(true);

// Suit la connexion internet. Au retour du réseau, on envoie les réponses en attente.
export function NetworkProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      const isOnline = state.isConnected !== false && state.isInternetReachable !== false;
      setOnline((was) => {
        if (!was && isOnline) flushQueue().catch(() => {});
        return isOnline;
      });
    });
  }, []);

  return <NetworkContext.Provider value={online}>{children}</NetworkContext.Provider>;
}

export function useOnline() {
  return useContext(NetworkContext);
}
