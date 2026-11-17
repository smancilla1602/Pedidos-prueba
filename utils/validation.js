/**
 * Validación de formularios (sin dependencias externas).
 * Cada validador devuelve un string de error en español o null si es válido.
 * Los mensajes son específicos y accionables (SKILL prioridad 8).
 */

export const MIN_PASSWORD_LENGTH = 6;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

export function normalizeEmail(value = '') {
  return value.trim().toLowerCase();
}

export function normalizePhone(value = '') {
  return value.trim();
}

export function validateEmail(value = '') {
  const email = normalizeEmail(value);
  if (!email) return 'Ingresa tu correo electrónico.';
  if (!EMAIL_PATTERN.test(email)) {
    return 'Escribe un correo válido, por ejemplo nombre@empresa.com.';
  }
  return null;
}

export function validatePassword(value = '', minLength = MIN_PASSWORD_LENGTH) {
  if (!value) return 'Ingresa tu contraseña.';
  if (value.length < minLength) {
    return `La contraseña debe tener al menos ${minLength} caracteres.`;
  }
  return null;
}

export function validateNombre(value = '') {
  const nombre = value.trim();
  if (!nombre) return 'Ingresa tu nombre.';
  if (nombre.length < 2) return 'Tu nombre debe tener al menos 2 caracteres.';
  if (nombre.length > 60) return 'Tu nombre no puede superar 60 caracteres.';
  return null;
}

export function validateApellido(value = '') {
  const apellido = value.trim();
  if (!apellido) return 'Ingresa tu apellido.';
  if (apellido.length < 2) return 'Tu apellido debe tener al menos 2 caracteres.';
  if (apellido.length > 60) return 'Tu apellido no puede superar 60 caracteres.';
  return null;
}

/**
 * Acepta 10 dígitos nacionales o el formato internacional de México
 * (+52 / 52 / +521 con espacios o guiones).
 */
export function validateCelular(value = '') {
  const celular = value.trim();
  if (!celular) return 'Ingresa tu número de celular.';
  if (!/^[\d\s()+-]+$/.test(celular)) {
    return 'El celular solo puede incluir números, espacios, guiones o el signo +.';
  }
  const digits = celular.replace(/\D/g, '');
  const isTenDigits = digits.length === 10;
  const isMexico = (digits.length === 12 || digits.length === 13) && digits.startsWith('52');
  if (!isTenDigits && !isMexico) {
    return 'Escribe un celular de 10 dígitos (puedes incluir la lada +52).';
  }
  return null;
}

export function validateEmpresaSucursal(value = '') {
  const empresa = value.trim();
  if (!empresa) return 'Ingresa tu empresa o sucursal.';
  if (empresa.length < 2) return 'Indica al menos 2 caracteres.';
  if (empresa.length > 80) return 'La empresa o sucursal no puede superar 80 caracteres.';
  return null;
}

export function validateLoginForm({ email = '', password = '' } = {}) {
  const errors = {};
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;
  return errors;
}

export function validateSignUpForm({
  nombre = '',
  apellido = '',
  email = '',
  celular = '',
  empresaSucursal = '',
  password = '',
} = {}) {
  const errors = {};

  const nombreError = validateNombre(nombre);
  if (nombreError) errors.nombre = nombreError;
  const apellidoError = validateApellido(apellido);
  if (apellidoError) errors.apellido = apellidoError;
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  const celularError = validateCelular(celular);
  if (celularError) errors.celular = celularError;
  const empresaError = validateEmpresaSucursal(empresaSucursal);
  if (empresaError) errors.empresaSucursal = empresaError;
  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;

  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
