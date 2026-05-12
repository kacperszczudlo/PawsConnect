import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WifiOff } from 'lucide-react-native';

type Props = {
  visible: boolean;
};

export function OfflineBanner({ visible }: Props) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: visible ? 260 : 180,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: visible ? 0 : -18,
        friction: 11,
        tension: 76,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, opacity, translateY]);

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.wrap,
        {
          paddingTop: Math.max(insets.top, 10),
          opacity,
          transform: [{ translateY }],
        },
      ]}
      accessibilityLiveRegion={visible ? 'polite' : 'none'}
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? 'yes' : 'no-hide-descendants'}
    >
      <View style={styles.card}>
        <WifiOff color="#fed7aa" size={22} strokeWidth={2.2} />
        <View style={styles.textCol}>
          <Text style={styles.title}>Brak połączenia</Text>
          <Text style={styles.sub}>
            Nie możemy zsynchronizować danych. Sprawdź Wi‑Fi lub dane mobilne — aplikacja odświeży się po powrocie sieci.
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 50,
    elevation: 16,
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    maxWidth: 440,
    width: '100%',
    backgroundColor: 'rgba(30, 41, 59, 0.96)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.45)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
  },
  textCol: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  sub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1',
    lineHeight: 17,
  },
});
