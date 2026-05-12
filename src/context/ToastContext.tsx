import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react-native';

export type ToastType = 'success' | 'error' | 'info';

export type ShowToastOptions = {
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
};

type ToastState = ShowToastOptions;

type ToastContextValue = {
  showToast: (options: ShowToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = {
  success: 3000,
  error: 4200,
  info: 3200,
} as const;

const ACCENT: Record<ToastType, string> = {
  success: '#10b981',
  error: '#f87171',
  info: '#f97316',
};

const MESSAGE_COLOR: Record<ToastType, string> = {
  success: '#6ee7b7',
  error: '#fecaca',
  info: '#fed7aa',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const hide = useCallback(() => {
    clearHideTimeout();
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 28,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setToast(null);
      }
    });
  }, [opacity, translateY]);

  const showToast = useCallback(
    (options: ShowToastOptions) => {
      clearHideTimeout();
      opacity.stopAnimation();
      translateY.stopAnimation();
      opacity.setValue(0);
      translateY.setValue(20);
      setToast(options);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 9,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();

      const duration =
        options.duration ?? DEFAULT_DURATION[options.type];
      hideTimeoutRef.current = setTimeout(hide, duration);
    },
    [hide, opacity, translateY],
  );

  useEffect(() => () => clearHideTimeout(), []);

  const accent = toast ? ACCENT[toast.type] : ACCENT.success;
  const messageColor = toast ? MESSAGE_COLOR[toast.type] : MESSAGE_COLOR.success;

  const Icon =
    toast?.type === 'success'
      ? CheckCircle2
      : toast?.type === 'error'
        ? AlertCircle
        : Info;

  return (
    <ToastContext.Provider value={{ showToast }}>
      <View style={styles.root}>
        {children}
        {toast ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.toastOuter,
              {
                paddingBottom: Math.max(insets.bottom, 12) + 8,
                opacity,
                transform: [{ translateY }],
              },
            ]}
          >
            <View
              style={[
                styles.toastCard,
                { borderLeftColor: accent } as ViewStyle,
              ]}
            >
              <Icon color={accent} size={22} strokeWidth={2.2} />
              <View style={styles.textBlock}>
                {toast.title ? (
                  <Text style={styles.title}>{toast.title}</Text>
                ) : null}
                <Text style={[styles.message, { color: messageColor }]}>
                  {toast.message}
                </Text>
              </View>
            </View>
          </Animated.View>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  toastOuter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    maxWidth: 400,
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  message: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
  },
});
