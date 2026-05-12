import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, type AppStateStatus, View } from 'react-native';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

import { OfflineBanner } from '../components/OfflineBanner';
import { useToast } from './ToastContext';

function computeOffline(state: NetInfoState): boolean {
  if (state.isConnected === false) {
    return true;
  }
  if (state.isInternetReachable === false) {
    return true;
  }
  return false;
}

type NetworkContextValue = {
  /** Brak sieci lub brak realnego dostępu do internetu (wg NetInfo). */
  isOffline: boolean;
};

const NetworkContext = createContext<NetworkContextValue | null>(null);

const RECONNECT_TOAST_AFTER_MS = 2800;

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  const [isOffline, setIsOffline] = useState(false);
  const offlineSinceRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const apply = (offline: boolean) => {
      if (cancelled) {
        return;
      }

      setIsOffline((prev) => {
        const becameOnline = prev && !offline;
        const becameOffline = !prev && offline;

        if (becameOffline) {
          offlineSinceRef.current = Date.now();
        }

        if (becameOnline) {
          const since = offlineSinceRef.current;
          offlineSinceRef.current = null;
          if (since != null && Date.now() - since >= RECONNECT_TOAST_AFTER_MS) {
            showToast({
              type: 'success',
              message: 'Połączenie z internetem przywrócone.',
            });
          }
        }

        return offline;
      });
    };

    void NetInfo.fetch().then((state) => {
      if (!cancelled) {
        apply(computeOffline(state));
      }
    });

    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      apply(computeOffline(state));
    });

    const onAppState = (next: AppStateStatus) => {
      if (next === 'active') {
        void NetInfo.fetch().then((state) => apply(computeOffline(state)));
      }
    };

    const appSub = AppState.addEventListener('change', onAppState);

    return () => {
      cancelled = true;
      unsubscribeNetInfo();
      appSub.remove();
    };
  }, [showToast]);

  const value = useMemo(() => ({ isOffline }), [isOffline]);

  return (
    <NetworkContext.Provider value={value}>
      <View style={{ flex: 1 }}>
        {children}
        <OfflineBanner visible={isOffline} />
      </View>
    </NetworkContext.Provider>
  );
}

export function useNetwork(): NetworkContextValue {
  const ctx = useContext(NetworkContext);
  if (!ctx) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }
  return ctx;
}

/**
 * Zwraca funkcję: jeśli jesteśmy offline — pokazuje toast i false.
 * Wywołaj na początku akcji wymagającej sieci (logowanie, zapis do Supabase).
 */
export function useNetworkGuard(): () => boolean {
  const { isOffline } = useNetwork();
  const { showToast } = useToast();

  return useCallback(() => {
    if (isOffline) {
      showToast({
        type: 'info',
        title: 'Brak sieci',
        message:
          'To działanie wymaga internetu. Połącz się z siecią Wi‑Fi lub komórkową i spróbuj ponownie.',
      });
      return false;
    }
    return true;
  }, [isOffline, showToast]);
}
