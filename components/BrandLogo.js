import React from 'react';
import { Image } from 'react-native';

const LOGO_SOURCE = require('../assets/Logo-Cerveceria-Colima.png');
const LOGO_ASPECT_RATIO = 360 / 341;

/**
 * Logotipo oficial de Cervecería de Colima.
 * El PNG tiene fondo transparente, por lo que debe colocarse sobre
 * superficies claras para conservar el contraste del trazo.
 */
export default function BrandLogo({
  width = 160,
  style,
  decorative = false,
  accessibilityLabel = 'Logotipo de Cervecería de Colima',
}) {
  return (
    <Image
      source={LOGO_SOURCE}
      style={[{ width, height: width / LOGO_ASPECT_RATIO }, style]}
      resizeMode="contain"
      accessible={!decorative}
      accessibilityRole={decorative ? undefined : 'image'}
      accessibilityLabel={decorative ? undefined : accessibilityLabel}
    />
  );
}
