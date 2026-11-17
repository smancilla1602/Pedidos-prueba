import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PressableScale from './PressableScale';
import { colors, radii, shadows, sizes, spacing, typography } from '../theme';

const VARIANT_STYLES = {
  primary: {
    container: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
      ...shadows.pill,
    },
    label: { color: colors.textOnAccent },
    icon: colors.textOnAccent,
    spinner: colors.textOnAccent,
  },
  secondary: {
    container: {
      backgroundColor: colors.surface,
      borderColor: colors.primary,
    },
    label: { color: colors.primary },
    icon: colors.primary,
    spinner: colors.primary,
  },
  danger: {
    container: {
      backgroundColor: colors.surface,
      borderColor: colors.dangerBorder,
    },
    label: { color: colors.danger },
    icon: colors.danger,
    spinner: colors.danger,
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
    label: { color: colors.primary },
    icon: colors.primary,
    spinner: colors.primary,
  },
};

/**
 * Botón de acción principal. La variante `primary` usa el verde lima
 * de la marca con tinta verde bosque (contraste 7.8:1) y una
 * microinteracción de escala al presionar. Altura 54 px.
 */
export default function PrimaryButton({
  label,
  onPress,
  icon,
  iconPosition = 'left',
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  accessibilityHint,
  testID,
}) {
  const config = VARIANT_STYLES[variant] ?? VARIANT_STYLES.primary;
  const isInactive = disabled || loading;
  const iconNode = loading ? (
    <ActivityIndicator size="small" color={config.spinner} />
  ) : icon ? (
    <Ionicons name={icon} size={sizes.iconMd} color={config.icon} />
  ) : null;

  return (
    <PressableScale
      onPress={onPress}
      disabled={isInactive}
      pressedScale={0.98}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      testID={testID}
      style={[styles.base, config.container, isInactive && styles.inactive, style]}
    >
      <View style={styles.content}>
        {iconPosition === 'left' ? iconNode : null}
        <Text
          style={[styles.label, config.label, isInactive && styles.inactiveLabel]}
          numberOfLines={1}
        >
          {label}
        </Text>
        {iconPosition === 'right' ? iconNode : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: sizes.control,
    minWidth: sizes.minTouchTarget,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  label: {
    ...typography.button,
    textAlign: 'center',
  },
  inactive: {
    backgroundColor: colors.disabledBackground,
    borderColor: colors.disabledBackground,
    shadowOpacity: 0,
    elevation: 0,
  },
  inactiveLabel: {
    color: colors.disabledText,
  },
});
