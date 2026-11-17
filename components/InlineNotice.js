import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, sizes, spacing, typography } from '../theme';

const NOTICE_STYLES = {
  success: {
    icon: 'checkmark-circle',
    background: colors.successSurface,
    border: colors.successBorder,
    foreground: colors.success,
  },
  error: {
    icon: 'alert-circle',
    background: colors.dangerSurface,
    border: colors.dangerBorder,
    foreground: colors.danger,
  },
  info: {
    icon: 'information-circle-outline',
    background: colors.accentTint,
    border: colors.border,
    foreground: colors.primary,
  },
};

/**
 * Aviso en línea para errores de autenticación y confirmaciones.
 * Nunca se usa Alert.alert para errores de formulario (SKILL prioridad 8).
 */
export default function InlineNotice({ type = 'info', title, message, style }) {
  const config = NOTICE_STYLES[type] ?? NOTICE_STYLES.info;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: config.background, borderColor: config.border },
        style,
      ]}
      accessibilityRole={type === 'error' ? 'alert' : undefined}
      accessibilityLiveRegion="polite"
    >
      <Ionicons
        name={config.icon}
        size={sizes.iconMd}
        color={config.foreground}
        style={styles.icon}
      />
      <View style={styles.copy}>
        {title ? (
          <Text style={[styles.title, { color: config.foreground }]}>{title}</Text>
        ) : null}
        {message ? (
          <Text style={[styles.message, { color: config.foreground }]}>{message}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  icon: {
    marginTop: 1,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.label,
  },
  message: {
    ...typography.caption,
  },
});
