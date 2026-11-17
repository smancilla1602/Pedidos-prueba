import React, { useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet } from 'react-native';
import { colors, motion } from '../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Envoltorio táctil con microinteracción de escala al presionar.
 * Usa el driver nativo (solo transforma `scale`) y mantiene el
 * objetivo táctil mínimo indicado por el llamador.
 */
export default function PressableScale({
  children,
  style,
  pressedScale = 0.97,
  disableAnimation = false,
  onPressIn,
  onPressOut,
  ...rest
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const [focused, setFocused] = useState(false);
  const isDisabled = Boolean(rest.disabled);
  const webInteractionStyle = Platform.OS === 'web'
    ? {
        cursor: isDisabled ? 'default' : 'pointer',
        userSelect: 'none',
      }
    : null;

  const animateTo = (toValue) => {
    Animated.timing(scale, {
      toValue,
      duration: motion.fast,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(event) => {
        if (!disableAnimation) animateTo(pressedScale);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        if (!disableAnimation) animateTo(1);
        onPressOut?.(event);
      }}
      onFocus={(event) => {
        setFocused(true);
        rest.onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        rest.onBlur?.(event);
      }}
      style={[
        style,
        webInteractionStyle,
        Platform.OS === 'web' && focused && styles.webFocus,
        { transform: [{ scale }] },
      ]}
    >
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  // Anillo de foco solo para navegación por teclado en web (SKILL prioridad 1).
  webFocus: {
    outlineWidth: 3,
    outlineStyle: 'solid',
    outlineColor: colors.focus,
    outlineOffset: 3,
  },
});
