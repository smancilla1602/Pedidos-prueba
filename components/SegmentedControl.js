import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import PressableScale from './PressableScale';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { colors, motion, radii, shadows, spacing, typography } from '../theme';

const TRACK_PADDING = 4;
const TRACK_HEIGHT = 48;

/**
 * Control segmentado animado para alternar entre "Iniciar sesión" y
 * "Crear cuenta". El indicador se desplaza con transform (driver nativo)
 * y cada segmento conserva un objetivo táctil de 48 px de alto.
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

  const segmentWidth =
    trackWidth > 0 ? (trackWidth - TRACK_PADDING * 2) / options.length : 0;

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
              width: segmentWidth,
              transform: [
                { translateX: Animated.multiply(progress, segmentWidth) },
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
            pressedScale={0.98}
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
    height: TRACK_HEIGHT + TRACK_PADDING * 2 + 2,
    padding: TRACK_PADDING,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    left: TRACK_PADDING,
    top: TRACK_PADDING,
    bottom: TRACK_PADDING,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    ...shadows.pill,
  },
  segment: {
    flex: 1,
    zIndex: 1,
    height: TRACK_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
  },
  segmentLabel: {
    ...typography.label,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  segmentLabelActive: {
    color: colors.textOnPrimary,
    fontWeight: '700',
  },
});
