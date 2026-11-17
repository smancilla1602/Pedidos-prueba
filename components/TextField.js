import React, { forwardRef, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PressableScale from './PressableScale';
import { colors, radii, sizes, spacing, typography } from '../theme';

/**
 * Campo de texto con etiqueta visible, icono, error inline y
 * botón para mostrar/ocultar contraseña (44x44 px).
 *
 * - Etiqueta siempre arriba del input (nunca solo placeholder).
 * - El error se anuncia con accessibilityLiveRegion="polite".
 * - En web agrega un anillo de foco con el verde lima de la marca.
 */
const TextField = forwardRef(function TextField(
  {
    label,
    value,
    onChangeText,
    error,
    helper,
    icon,
    required = false,
    secureTextEntry = false,
    secureTextVisible = false,
    onToggleSecure,
    editable = true,
    style,
    inputStyle,
    onFocus,
    onBlur,
    accessibilityLabel,
    accessibilityHint,
    ...inputProps
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.label, focused && !hasError && styles.labelFocused]}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>

      <View
        style={[
          styles.shell,
          focused && styles.shellFocused,
          hasError && styles.shellError,
          !editable && styles.shellDisabled,
          Platform.OS === 'web' && focused && styles.webFocus,
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={sizes.iconMd}
            color={hasError ? colors.danger : focused ? colors.primary : colors.textMuted}
            style={styles.leadingIcon}
          />
        ) : null}

        <TextInput
          ref={ref}
          style={[styles.input, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          cursorColor={colors.primary}
          secureTextEntry={secureTextEntry && !secureTextVisible}
          accessibilityLabel={accessibilityLabel ?? `${label}${required ? ', obligatorio' : ''}`}
          accessibilityHint={hasError ? error : accessibilityHint}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...inputProps}
        />

        {secureTextEntry && onToggleSecure ? (
          <PressableScale
            onPress={onToggleSecure}
            accessibilityRole="button"
            accessibilityLabel={
              secureTextVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'
            }
            accessibilityHint="Alterna la visibilidad del texto de la contraseña"
            style={styles.adornment}
          >
            <Ionicons
              name={secureTextVisible ? 'eye-off-outline' : 'eye-outline'}
              size={sizes.iconMd}
              color={colors.primary}
            />
          </PressableScale>
        ) : null}
      </View>

      {hasError ? (
        <View style={styles.messageRow} accessibilityLiveRegion="polite">
          <Ionicons name="alert-circle" size={sizes.iconSm} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : helper ? (
        <Text style={styles.helperText}>{helper}</Text>
      ) : null}
    </View>
  );
});

export default TextField;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
  },
  labelFocused: {
    color: colors.primary,
  },
  required: {
    color: colors.danger,
  },
  shell: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: sizes.input,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.borderInteractive,
    borderRadius: radii.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
  },
  shellFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.accentTint,
  },
  shellError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSurface,
  },
  shellDisabled: {
    backgroundColor: colors.disabledBackground,
    borderColor: colors.border,
  },
  webFocus: {
    outlineWidth: 3,
    outlineStyle: 'solid',
    outlineColor: colors.focus,
    outlineOffset: 2,
  },
  leadingIcon: {
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    minHeight: sizes.input - 4,
    paddingVertical: spacing.md,
    paddingHorizontal: 0,
    fontSize: 16,
    color: colors.textPrimary,
    textAlignVertical: 'center',
  },
  adornment: {
    width: sizes.minTouchTarget,
    height: sizes.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs + 2,
  },
  errorText: {
    ...typography.caption,
    flex: 1,
    color: colors.danger,
  },
  helperText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
