import { Platform } from 'react-native';
import { colors } from './colors';

/**
 * Tokens de espacio, radio, tipografía y movimiento.
 * Escala base de 4 px para un ritmo vertical matemáticamente consistente.
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 56,
  mega: 64,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
};

export const sizes = {
  minTouchTarget: 44, // mínimo táctil accesible
  control: 54, // altura de botones
  input: 52, // altura del contenedor de campo
  iconSm: 14,
  iconMd: 20,
  iconLg: 24,
  logoAspectRatio: 360 / 341, // dimensiones reales del PNG de marca
};

/**
 * Dos voces tipográficas: serif editorial para titulares (Georgia en
 * iOS/Web, serif del sistema en Android) y sans del sistema para la
 * interfaz y los formularios.
 */
export const fonts = {
  display: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'Georgia',
  }),
};

export const typography = {
  display: {
    fontFamily: fonts.display,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '400',
    letterSpacing: -0.8,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '400',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  body: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400',
  },
  bodyStrong: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  fieldLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  caption: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '400',
  },
  overline: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  address: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  button: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
};

export const layout = {
  maxContentWidth: 460, // columna única (móvil y tablet vertical)
  wideContentWidth: 1040, // split editorial en pantallas anchas
  formColumnWidth: 440,
  minHorizontalPadding: spacing.xxl,
  maxHorizontalPadding: spacing.giant,
  cardPaddingCompact: spacing.xxl,
  cardPaddingWide: spacing.xxxl,
};

/**
 * Duraciones de movimiento. La salida es más rápida que la entrada.
 */
export const motion = {
  fast: 140,
  base: 220,
  slow: 320,
  splashIn: 420,
  splashVisible: 3000,
  splashOut: 400,
  reduced: 120,
};

export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 30,
    elevation: 3,
  },
  raised: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.1,
    shadowRadius: 36,
    elevation: 6,
  },
  // Tarjeta que se superpone a una fotografía (login móvil): la sombra debe
  // leerse también por encima del borde superior del contenedor.
  sheet: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 12,
  },
  pill: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 3,
  },
};
