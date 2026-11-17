import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import BrandLogo from './BrandLogo';
import { useReducedMotion } from '../hooks/useReducedMotion';
import useWebViewportFill from '../hooks/useWebViewportFill';
import { colors, motion, radii, shadows, spacing, typography } from '../theme';

// En web el overlay se ancla al viewport dinámico (position: fixed). Así,
// cuando Safari/Chrome móvil muestran u ocultan sus barras, el verde cubre
// de borde a borde y no queda ninguna franja con la foto del login detrás.
const WEB_FIXED_FILL =
  Platform.OS === 'web'
    ? { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }
    : null;

/**
 * Splash animado de entrada.
 *
 * Secuencia: fade-in + escala 0.92 -> 1 del logotipo, permanencia de
 * 3000 ms para apreciar la marca y fade-out que revela la pantalla que
 * está debajo (Login o Sesión Activa). El overlay usa cobertura absoluta
 * total y un zIndex/elevation altos para flotar sobre el login en
 * iOS, Android y Web. Solo se animan `opacity` y `transform` con
 * useNativeDriver para no bloquear el hilo de JavaScript.
 */
export default function AnimatedSplash({ onFinish }) {
  const reducedMotion = useReducedMotion();
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.92)).current;
  const captionOpacity = useRef(new Animated.Value(0)).current;
  const onFinishRef = useRef(onFinish);

  // Web: 100dvh + fondo verde en html/body para que la franja de la barra
  // del navegador nunca deje ver la fotografía del login que hay debajo.
  useWebViewportFill(colors.splashBackground);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    screenOpacity.setValue(1);
    logoOpacity.setValue(0);
    logoScale.setValue(0.92);
    captionOpacity.setValue(0);

    const enter = reducedMotion
      ? Animated.parallel([
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: motion.reduced,
            useNativeDriver: true,
          }),
          Animated.timing(captionOpacity, {
            toValue: 1,
            duration: motion.reduced,
            useNativeDriver: true,
          }),
        ])
      : Animated.parallel([
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: motion.splashIn,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.spring(logoScale, {
            toValue: 1,
            friction: 8,
            tension: 55,
            useNativeDriver: true,
          }),
          Animated.timing(captionOpacity, {
            toValue: 1,
            duration: motion.splashIn,
            delay: 120,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]);

    enter.start();

    const fadeOut = Animated.timing(screenOpacity, {
      toValue: 0,
      duration: reducedMotion ? motion.reduced : motion.splashOut,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    });

    // El splash permanece visible 3000 ms desde el montaje; al cumplirse
    // ese tiempo arranca el fade-out y, al terminar, se desmonta por
    // completo para dar paso al Login o a la Sesión Activa.
    const fadeOutTimer = setTimeout(() => {
      fadeOut.start(({ finished }) => {
        if (finished) onFinishRef.current?.();
      });
    }, motion.splashVisible);

    return () => {
      clearTimeout(fadeOutTimer);
      enter.stop();
      fadeOut.stop();
    };
  }, [reducedMotion, screenOpacity, logoOpacity, logoScale, captionOpacity]);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        styles.overlay,
        WEB_FIXED_FILL,
        { opacity: screenOpacity },
      ]}
    >
      <StatusBar style="light" />
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoPanel,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}
        >
          <BrandLogo width={200} accessibilityLabel="Cervecería de Colima" />
        </Animated.View>

        <Animated.View style={[styles.captionBlock, { opacity: captionOpacity }]}>
          <View style={styles.accentRule} />
          <Text style={styles.caption}>CERVECERÍA DE COLIMA</Text>
          <Text style={styles.subCaption}>El Trapiche · Cuauhtémoc, Colima</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: colors.splashBackground,
    alignItems: 'center',
    justifyContent: 'center',
    // Elevation es necesario en Android para quedar por encima de las
    // tarjetas del login (que también tienen elevation).
    zIndex: 999,
    elevation: 999,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  logoPanel: {
    backgroundColor: colors.splashPanel,
    borderRadius: radii.xxl,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xxl,
    ...shadows.raised,
  },
  captionBlock: {
    marginTop: spacing.xxxl,
    alignItems: 'center',
  },
  accentRule: {
    width: 36,
    height: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    marginBottom: spacing.lg,
  },
  caption: {
    ...typography.overline,
    letterSpacing: 2.4,
    color: colors.textAccentOnPrimary,
    textAlign: 'center',
  },
  subCaption: {
    ...typography.caption,
    marginTop: spacing.sm,
    color: colors.splashTextMuted,
    textAlign: 'center',
  },
});
