import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { colors } from '../theme';

const LOGO_SOURCE = require('../assets/Logo-Cerveceria-Colima.png');
const LOGO_ASPECT_RATIO = 360 / 341;

/**
 * Logotipo oficial de Cervecería de Colima (PNG con fondo transparente).
 * `tone="light"` tiñe el trazo en crema para colocarlo directamente
 * sobre la fotografía oscura, sin placas, bordes ni sombras.
 */
export default function BrandLogo({
  width = 160,
  style,
  decorative = false,
  tone = 'original',
  accessibilityLabel = 'Logotipo de Cervecería de Colima',
}) {
  return (
    <Image
      source={LOGO_SOURCE}
      style={[
        { width, height: width / LOGO_ASPECT_RATIO },
        tone === 'light' ? styles.light : null,
        style,
      ]}
      resizeMode="contain"
      accessible={!decorative}
      accessibilityRole={decorative ? undefined : 'image'}
      accessibilityLabel={decorative ? undefined : accessibilityLabel}
    />
  );
}

const styles = StyleSheet.create({
  light: {
    tintColor: colors.textOnPhoto,
  },
});

