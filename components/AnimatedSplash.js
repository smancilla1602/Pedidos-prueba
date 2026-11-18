import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import BrandLogo from './BrandLogo';
import { useReducedMotion } from '../hooks/useReducedMotion';
import useWebViewportFill from '../hooks/useWebViewportFill';
import { colors, motion, sizes } from '../theme';

// En web el overlay se ancla al viewport dinámico (position: fixed). Así,
// cuando Safari/Chrome móvil muestran u ocultan sus barras, el lienzo crema
// cubre de borde a borde y no queda ninguna franja con la foto del login.
const WEB_FIXED_FILL =
  Platform.OS === 'web'
    ? { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }
    : null;

const LOGO_MIN_WIDTH = 180;
const LOGO_MAX_WIDTH = 300;
const LOGO_WIDTH_RATIO = 0.56;

/**
 * Splash de entrada con "trazo" del logotipo.
 *
 * Una máscara con overflow hidden crece de 0 al ancho completo del logo
 * (1200 ms, easing suave), el logo reposa 400 ms y el overlay se desvanece
 * (350 ms) para revelar Login o Sesión Activa. Si la app aún no está lista
 * (fuentes/sesión), el logo se mantiene dibujado hasta que `ready` sea true
 * o se agote `motion.splashReadyGrace`.
 *
 * El ancho es una propiedad de layout, así que se anima en el hilo de JS
 * (useNativeDriver: false); la opacidad del overlay sí usa driver nativo.
 */
export default function AnimatedSplash({ onFinish, ready = true }) {
  const reducedMotion = useReducedMotion();
  const { width } = useWindowDimensions();
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const revealWidth = useRef(new Animated.Value(0)).current;
  const fadeRef = useRef(null);
  const fadeStartedRef = useRef(false);
  const onFinishRef = useRef(onFinish);
  const [drawDone, setDrawDone] = useState(false);
  const [holdDone, setHoldDone] = useState(false);

  const logoWidth = Math.max(
    LOGO_MIN_WIDTH,
    Math.min(LOGO_MAX_WIDTH, Math.round(width * LOGO_WIDTH_RATIO))
  );
  const logoHeight = Math.ceil(logoWidth / sizes.logoAspectRatio);

  // Web: 100dvh + lienzo crema en html/body para que la franja de la barra
  // del navegador nunca deje ver la fotografía del login que hay debajo.
  useWebViewportFill(colors.background);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  // Trazo: resetea la máscara y la abre de izquierda a derecha. Al terminar
  // arranca el reposo editorial de 400 ms; un cambio de `ready` no reinicia
  // ni el trazo ni el reposo.
  useEffect(() => {
    if (fadeStartedRef.current) return undefined;

    let active = true;
    let holdTimer = null;
    let draw = null;

    screenOpacity.setValue(1);
    setDrawDone(false);
    setHoldDone(false);
    revealWidth.setValue(reducedMotion ? logoWidth : 0);

    const startHold = () => {
      if (!active) return;
      setDrawDone(true);
      holdTimer = setTimeout(() => {
        if (active) setHoldDone(true);
      }, motion.splashHold);
    };

    if (reducedMotion) {
      startHold();
    } else {
      draw = Animated.timing(revealWidth, {
        toValue: logoWidth,
        duration: motion.splashDraw,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      });
      draw.start(({ finished }) => {
        if (finished) startHold();
      });
    }

    return () => {
      active = false;
      if (holdTimer) clearTimeout(holdTimer);
      draw?.stop();
    };
  }, [reducedMotion, logoWidth, revealWidth, screenOpacity]);

  // Salida: cuando el trazo y el reposo terminaron, espera como máximo
  // `splashReadyGrace` a que la app esté lista y desvanece una sola vez.
  useEffect(() => {
    if (!holdDone || fadeStartedRef.current) return undefined;

    let graceTimer = null;

    const fadeOut = () => {
      if (fadeStartedRef.current) return;
      fadeStartedRef.current = true;

      fadeRef.current = Animated.timing(screenOpacity, {
        toValue: 0,
        duration: reducedMotion ? motion.reduced : motion.splashFade,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      });
      fadeRef.current.start(({ finished }) => {
        if (finished) onFinishRef.current?.();
      });
    };

    if (ready) {
      fadeOut();
    } else {
      graceTimer = setTimeout(fadeOut, motion.splashReadyGrace);
    }

    return () => {
      if (graceTimer) clearTimeout(graceTimer);
    };
  }, [holdDone, ready, reducedMotion, screenOpacity]);

  // Si el overlay se desmonta antes de terminar (recarga o navegación),
  // detenemos cualquier animación pendiente.
  useEffect(
    () => () => {
      fadeRef.current?.stop();
    },
    []
  );

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        styles.overlay,
        WEB_FIXED_FILL,
        { opacity: screenOpacity },
      ]}
    >
      <StatusBar style="dark" />

      {/* Caja fija: ancla la máscara a la izquierda para que el trazo avance
          de izquierda a derecha (no se abre desde el centro) y la imagen
          interna conserve su ancho real sin deformarse. */}
      <View style={[styles.logoBox, { width: logoWidth, height: logoHeight }]}>
        <Animated.View
          style={[styles.mask, { width: revealWidth, height: logoHeight }]}
        >
          <BrandLogo
            width={logoWidth}
            style={styles.logoFixed}
            accessibilityLabel="Cervecería de Colima"
          />
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
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    // Elevation es necesario en Android para quedar por encima de las
    // tarjetas del login (que también tienen elevation).
    zIndex: 999,
    elevation: 999,
  },
  logoBox: {
    alignItems: 'flex-start',
  },
  mask: {
    overflow: 'hidden',
  },
  // La imagen queda fuera del flujo flexbox para que la máscara la recorte
  // sin encogerla ni estirarla mientras el ancho crece.
  logoFixed: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
