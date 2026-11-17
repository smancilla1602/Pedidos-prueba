/**
 * Tokens de color — Cervecería de Colima
 *
 * Fuente única de verdad del color. Ningún componente declara un hex:
 * siempre consume un token semántico.
 *
 * Paleta oficial aplicada con precisión:
 * - Lienzo: #F9F8F4 (hueso / crema suave)
 * - Superficies: #FFFFFF (blanco puro)
 * - Tinta principal: #0E3B2E ("Arbusto", verde bosque profundo)
 * - Texto secundario: #5A5A55 (gris cálido)
 * - Acento: #CFD278 ("Láser", verde lima) para acción clave y estados activos
 *
 * Contraste verificado (WCAG 2.1 AA, texto >= 4.5:1):
 * - textPrimary (#0E3B2E) sobre background (#F9F8F4): ~11.8:1
 * - textPrimary (#0E3B2E) sobre surface (#FFFFFF): ~12.5:1
 * - textSecondary (#5A5A55) sobre background: ~6.6:1
 * - textMuted (#6E6E66) sobre surface: ~5.1:1
 * - textOnAccent (#0E3B2E) sobre accent (#CFD278): ~7.8:1
 * - danger (#A3231C) sobre dangerSurface (#FBECEA): ~6.4:1
 * - borderInteractive (#8F8D82) sobre surface: ~3.3:1 (borde de campo)
 */

export const palette = {
  forest: '#0E3B2E',
  forestDeep: '#0A2E24',
  cream: '#F9F8F4',
  white: '#FFFFFF',
  lime: '#CFD278',
  limeDeep: '#C1C566',
  limeTint: '#F3F5DC',
  warmGray: '#5A5A55',
  warmGraySoft: '#6E6E66',
  hairline: '#E4E0D4',
  hairlineStrong: '#CFCABB',
  fieldBorder: '#8F8D82',
};

export const colors = {
  // Lienzo y superficies
  background: palette.cream,
  surface: palette.white,
  surfaceSunken: '#F4F2EA',
  surfaceMuted: '#EDEAE0',

  // Tinta y estructura de marca
  primary: palette.forest,
  primaryPressed: palette.forestDeep,
  primaryTint: '#E7EDE7',

  // Acento: acción clave y estados activos
  accent: palette.lime,
  accentPressed: palette.limeDeep,
  accentTint: palette.limeTint,

  // Tipografía
  textPrimary: palette.forest,
  textSecondary: palette.warmGray,
  textMuted: palette.warmGraySoft,
  textOnPrimary: palette.white,
  textOnAccent: palette.forest,
  textAccentOnPrimary: palette.lime,

  // Bordes y foco
  border: palette.hairline,
  borderStrong: palette.hairlineStrong,
  borderInteractive: palette.fieldBorder,
  focus: palette.lime,

  // Estados
  danger: '#A3231C',
  dangerPressed: '#8A1C16',
  dangerSurface: '#FBECEA',
  dangerBorder: '#E8BDB8',
  success: '#17603F',
  successSurface: '#E7F1EA',
  successBorder: '#C2DCCB',
  disabledBackground: '#E8E5DA',
  disabledText: '#7A7A72',

  // Sombras, overlays y splash
  shadow: palette.forest,
  overlay: 'rgba(10, 46, 36, 0.5)',
  splashBackground: palette.forest,
  splashPanel: palette.white,
  splashTextMuted: '#D8E2DB',

  // Fotografía inmersiva (degradado "Arbusto")
  // Sobre photoOverlayHeavy el texto crema alcanza ~10:1 de contraste.
  photoOverlayHeavy: 'rgba(10, 46, 36, 0.9)',
  photoOverlayStrong: 'rgba(10, 46, 36, 0.66)',
  photoOverlayMid: 'rgba(10, 46, 36, 0.4)',
  photoOverlaySoft: 'rgba(10, 46, 36, 0.22)',
  textOnPhoto: palette.cream,
  textOnPhotoMuted: '#DCE3DC',
};


export default colors;
