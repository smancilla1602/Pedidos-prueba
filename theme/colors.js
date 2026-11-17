/**
 * Tokens de color — Cervecería de Colima
 *
 * Fuente única de verdad del color de la app. Ningún componente debe
 * declarar un hex directamente: siempre consume un token semántico.
 *
 * Contraste verificado (WCAG 2.1 AA, 4.5:1 para texto):
 * - textOnPrimary (#FFFFFF) sobre primary (#0E3B2E): ~12.4:1
 * - textPrimary (#1A1A1A) sobre background (#F9F8F4): ~16.6:1
 * - textMuted (mossGray) sobre background/surface: ~5.4:1
 * - textOnAccent (primary) sobre accent (#CFD278): ~7.8:1
 * - danger (#A3231C) sobre dangerSurface (#FBECEA): ~6.4:1
 *
 * Nota: el acento lima se usa como indicador (anillo de foco, pastillas,
 * pill de estado), nunca como color de texto sobre crema/blanco.
 */

export const palette = {
  forestGreen: '#0E3B2E',
  forestGreenDeep: '#092A21',
  warmCream: '#F9F8F4',
  pureWhite: '#FFFFFF',
  softLime: '#CFD278',
  softLimeDeep: '#B7BA5C',
  softLimeTint: '#F1F2DC',
  charcoal: '#1A1A1A',
  mossGray: '#5E6962',
  stoneGray: '#E1DCCF',
};

export const colors = {
  // Superficies y lienzo
  background: palette.warmCream,
  surface: palette.pureWhite,
  surfaceSunken: '#F2F0E9',
  surfaceMuted: '#EDEAE1',

  // Marca
  primary: palette.forestGreen,
  primaryPressed: palette.forestGreenDeep,
  primaryTint: '#E3EBE5',
  accent: palette.softLime,
  accentPressed: palette.softLimeDeep,
  accentTint: palette.softLimeTint,

  // Tipografía
  textPrimary: palette.charcoal,
  textSecondary: '#4B564F',
  textMuted: palette.mossGray,
  textOnPrimary: palette.pureWhite,
  textOnAccent: palette.forestGreen,
  textAccentOnPrimary: palette.softLime,

  // Bordes y foco
  border: palette.stoneGray,
  borderStrong: '#C7C1B2',
  borderInteractive: '#96927F', // ~3.1:1 sobre blanco (borde de campos)
  focus: palette.softLime,

  // Estados
  danger: '#A3231C',
  dangerPressed: '#8A1C16',
  dangerSurface: '#FBECEA',
  dangerBorder: '#E8BDB8',
  success: '#17603F',
  successSurface: '#E7F1EA',
  successBorder: '#C2DCCB',
  disabledBackground: '#E4E0D6',
  disabledText: '#6E786F',

  // Sombras, overlays y splash
  shadow: palette.forestGreen,
  overlay: 'rgba(9, 42, 33, 0.48)',
  splashBackground: palette.forestGreen,
  splashPanel: palette.pureWhite,
  splashTextMuted: '#D6E0D9',
};

export default colors;
