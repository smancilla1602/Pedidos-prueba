import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

const BOTTLES_SOURCE = require('../assets/botellas-lineup.jpg');

// Degradado móvil: oscurece la parte alta (texto crema), deja respirar la
// fotografía en el centro y vuelve a oscurecer al pie de la tarjeta.
const MOBILE_COLORS = [
  colors.photoOverlayHeavy,
  colors.photoOverlayStrong,
  colors.photoOverlayMid,
  colors.photoOverlayHeavy,
];
const MOBILE_LOCATIONS = [0, 0.3, 0.56, 1];

// Degradado editorial: oscurece la esquina superior izquierda donde flota
// el logotipo crema, deja respirar la fotografía y la asienta al pie.
const WIDE_COLORS = [
  colors.photoOverlayStrong,
  colors.photoOverlaySoft,
  colors.photoOverlayMid,
];
const WIDE_LOCATIONS = [0, 0.45, 1];

/**
 * Fondo fotográfico inmersivo con velo verde "Arbusto".
 * La imagen y el degradado son decorativos: quedan fuera del árbol de
 * accesibilidad y no capturan toques.
 */
export default function PhotoBackdrop({ variant = 'mobile' }) {
  const isWide = variant === 'wide';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image
        source={BOTTLES_SOURCE}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        accessible={false}
      />
      <LinearGradient
        colors={isWide ? WIDE_COLORS : MOBILE_COLORS}
        locations={isWide ? WIDE_LOCATIONS : MOBILE_LOCATIONS}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
