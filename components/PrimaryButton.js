import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PressableScale from './PressableScale';
import { colors, radii, shadows, sizes, spacing, typography } from '../theme';

const VARIANT_STYLES = {
  primary: {
    container: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      ...shadows.pill,
    },
    label: { color: colors.textOnPrimary },
    icon: colors.textOnPrimary,
    spinner: colors.textOnPrimary,
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
 * Botón principal de la app con estado de carga y microinteracción táctil.
 * Altura mínima de 52 px (> 44 px) y estado deshabilitado accesible.
 */
export default function PrimaryButton({
  label,
  onPress,
  icon,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  accessibilityHint,
  testID,
}) {
  const config = VARIANT_STYLES[variant] ?? VARIANT_STYLES.primary;
  const isInactive = disabled || loading;

  return (
    <PressableScale
      onPress={onPress}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      testID={testID}
      style={[
        styles.base,
        config.container,
        isInactive && styles.inactive,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={config.spinner} />
        ) : icon ? (
          <Ionicons name={icon} size={sizes.iconMd} color={config.icon} />
        ) : null}
        <Text
          style={[styles.label, config.label, isInactive && styles.inactiveLabel]}
          numberOfLines={1}
        >
          {label}
        </Text>
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
