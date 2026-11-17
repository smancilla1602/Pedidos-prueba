import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import PressableScale from './PressableScale';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { colors, motion, spacing, typography } from '../theme';

const TRACK_HEIGHT = 44;
const TRACK_INSET = spacing.md;
const INDICATOR_HEIGHT = 2;

/**
 * Selector editorial entre "Iniciar sesión" y "Crear cuenta".
 * Una línea láser se desplaza bajo la pestaña activa con transform
 * (driver nativo); cada pestaña conserva 44 px de altura táctil.
 */
export default function SegmentedControl({
  options,
  value,
  onChange,
  accessibilityLabel = 'Modo de acceso',
}) {
  const reducedMotion = useReducedMotion();
  const [trackWidth, setTrackWidth] = useState(0);
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );
  const progress = useRef(new Animated.Value(activeIndex)).current;

  const segmentWidth = trackWidth > 0 ? trackWidth / options.length : 0;
  const indicatorWidth = Math.max(0, segmentWidth - TRACK_INSET * 2);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: activeIndex,
      duration: reducedMotion ? 0 : motion.base,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [activeIndex, progress, reducedMotion]);

  return (
    <View
      style={styles.track}
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
    >
      {trackWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            {
              width: indicatorWidth,
              transform: [
                {
                  translateX: Animated.add(
                    Animated.multiply(progress, segmentWidth),
                    TRACK_INSET
                  ),
                },
              ],
            },
          ]}
        />
      ) : null}

      {options.map((option, index) => {
        const isActive = index === activeIndex;

        return (
          <PressableScale
            key={option.value}
            onPress={() => onChange(option.value)}
            pressedScale={0.99}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={option.label}
            style={styles.segment}
          >
            <Text
              style={[styles.segmentLabel, isActive && styles.segmentLabelActive]}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    height: TRACK_HEIGHT + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    height: INDICATOR_HEIGHT,
    borderRadius: 1,
    backgroundColor: colors.accent,
  },
  segment: {
    flex: 1,
    height: TRACK_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  segmentLabel: {
    ...typography.label,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  segmentLabelActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
});

