import { colors } from './colors';

/**
 * Tokens de espacio, radio, tipografía y movimiento.
 * Escala base de 4 px para ritmo vertical consistente (SKILL prioridad 5 y 6).
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
  minTouchTarget: 44, // mínimo táctil accesible (SKILL prioridad 2)
  control: 52, // altura de botones
  input: 54, // altura del contenedor de campo
  iconSm: 14,
  iconMd: 20,
  iconLg: 24,
  logoAspectRatio: 360 / 341, // dimensiones reales del PNG de marca
};

/**
 * Escala tipográfica: base 16 px y line-height 1.5 en texto corrido.
 */
export const typography = {
  display: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
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
  },
  caption: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400',
  },
  overline: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 1.6,
  },
  button: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
};

export const layout = {
  maxContentWidth: 480,
  minHorizontalPadding: spacing.xl,
  maxHorizontalPadding: spacing.xxxl,
  cardPaddingCompact: spacing.xxl,
  cardPaddingWide: spacing.xxxl,
};

/**
 * Duraciones de movimiento. La salida es más rápida que la entrada
 * (SKILL prioridad 7: exit-faster-than-enter).
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
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 26,
    elevation: 4,
  },
  raised: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 32,
    elevation: 8,
  },
  pill: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
};
