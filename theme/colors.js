/**
 * Tokens de color — Cervecería de Colima
 *
 * Fuente única de verdad del color. Ningún componente declara un hex:
 * siempre consume un token semántico.
 *
 * Paleta oficial (cerveceriaColima.md):
 * - Lienzo: #F9F8F4 (crema)
 * - Superficies: #FFFFFF (blanco)
 * - Verde bosque: #0E3B2E (títulos, líneas de campo, enlaces)
 * - Verde azulado: #0A6B57 (botón principal)
 * - Ámbar: #EAB227 (subrayado de pestaña y foco; nunca como texto)
 * - Arena: #EFE6D2 (fondo de foto mientras carga)
 * - Tinta: #1C1D1D (texto que escribe la persona)
 * - Línea: #E8E8E1 (separadores)
 * - Rojo: #D02E2E sobre #FFF6F6 (errores)
 *
 * Los tokens "lime" se conservan por compatibilidad con superficies ya
 * publicadas; las pantallas nuevas usan los tokens `action`, `brandAccent`,
 * `ink`, `line` y `error`.
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
  teal: '#0A6B57',
  amber: '#EAB227',
  sand: '#EFE6D2',
  ink: '#1C1D1D',
  line: '#E8E8E1',
  red: '#D02E2E',
  redSurface: '#FFF6F6',
  creamTransparent: 'rgba(249, 248, 244, 0)',
  creamFade: 'rgba(249, 248, 244, 0.72)',
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

  // Acento: acción clave y estados activos (lime heredado)
  accent: palette.lime,
  accentPressed: palette.limeDeep,
  accentTint: palette.limeTint,

  // Guía de marca: acción, acentos y estructura editorial
  action: palette.teal,
  actionPressed: palette.forest,
  textOnAction: palette.white,
  brandAccent: palette.amber,
  ink: palette.ink,
  fieldLine: palette.forest,
  line: palette.line,
  error: palette.red,
  errorSurface: palette.redSurface,
  photoPlaceholder: palette.sand,
  photoFadeStart: palette.creamTransparent,
  photoFadeMid: palette.creamFade,

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
  splashBackground: palette.cream,

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
