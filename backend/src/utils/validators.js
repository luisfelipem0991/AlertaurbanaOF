const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[\p{L}\s]{2,80}$/u;

export function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateRegisterPayload(body = {}) {
  const errors = [];
  const allowedKeys = ["name", "email", "password", "confirmPassword"];
  const hasExtraKeys = Object.keys(body).some((k) => !allowedKeys.includes(k));
  const { name, email, password, confirmPassword } = body;

  if (
    hasExtraKeys ||
    !isNonEmptyString(name) ||
    !isNonEmptyString(email) ||
    !isNonEmptyString(password) ||
    !isNonEmptyString(confirmPassword)
  ) {
    errors.push("Campos obligatorios");
    return { valid: false, errors };
  }

  if (password !== confirmPassword) {
    errors.push("Las contraseñas no coinciden");
  }
  if (!NAME_REGEX.test(name.trim())) {
    errors.push("El nombre solo puede contener letras y espacios (2-80 caracteres)");
  }
  if (!EMAIL_REGEX.test(email.trim()) || email.length > 255) {
    errors.push("El correo no tiene un formato válido");
  }
  if (password.length < 8 || password.length > 72) {
    errors.push("La contraseña debe tener entre 8 y 72 caracteres");
  }

  return { valid: errors.length === 0, errors };
}

export function validateVerifyCodePayload(body = {}) {
  const errors = [];
  const allowedKeys = ["email", "code"];
  const hasExtraKeys = Object.keys(body).some((k) => !allowedKeys.includes(k));
  const { email, code } = body;

  if (hasExtraKeys || !isNonEmptyString(email) || !EMAIL_REGEX.test(email.trim())) {
    errors.push("Correo inválido");
  }
  if (!isNonEmptyString(code) || !/^\d{4}$/.test(code.trim())) {
    errors.push("El código debe ser de 4 dígitos");
  }

  return { valid: errors.length === 0, errors };
}

export function validateForgotPasswordPayload(body = {}) {
  const errors = [];
  const allowedKeys = ["email"];
  const hasExtraKeys = Object.keys(body).some((k) => !allowedKeys.includes(k));
  const { email } = body;

  if (hasExtraKeys || !isNonEmptyString(email) || !EMAIL_REGEX.test(email.trim())) {
    errors.push("Correo inválido");
  }

  return { valid: errors.length === 0, errors };
}

export function validateResetVerifyCodePayload(body = {}) {
  const errors = [];
  const allowedKeys = ["email", "code"];
  const hasExtraKeys = Object.keys(body).some((k) => !allowedKeys.includes(k));
  const { email, code } = body;

  if (hasExtraKeys || !isNonEmptyString(email) || !EMAIL_REGEX.test(email.trim())) {
    errors.push("Correo inválido");
  }
  if (!isNonEmptyString(code) || !/^\d{4}$/.test(code.trim())) {
    errors.push("El código debe ser de 4 dígitos");
  }

  return { valid: errors.length === 0, errors };
}

export function validateResetPasswordPayload(body = {}) {
  const errors = [];
  const allowedKeys = ["resetToken", "newPassword", "confirmPassword"];
  const hasExtraKeys = Object.keys(body).some((k) => !allowedKeys.includes(k));
  const { resetToken, newPassword, confirmPassword } = body;

  if (
    hasExtraKeys ||
    !isNonEmptyString(resetToken) ||
    !isNonEmptyString(newPassword) ||
    !isNonEmptyString(confirmPassword)
  ) {
    errors.push("Campos obligatorios");
    return { valid: false, errors };
  }

  if (newPassword !== confirmPassword) {
    errors.push("Las contraseñas no coinciden");
  }
  if (newPassword.length < 8 || newPassword.length > 72) {
    errors.push("La contraseña debe tener entre 8 y 72 caracteres");
  }

  return { valid: errors.length === 0, errors };
}

export function validateLoginPayload(body = {}) {
  const errors = [];
  const allowedKeys = ["email", "password"];
  const hasExtraKeys = Object.keys(body).some((k) => !allowedKeys.includes(k));
  const { email, password } = body;

  if (hasExtraKeys || !isNonEmptyString(email) || !EMAIL_REGEX.test(email.trim())) {
    errors.push("Correo inválido");
  }
  if (!isNonEmptyString(password)) {
    errors.push("La contraseña es obligatoria");
  }

  return { valid: errors.length === 0, errors };
}
export function validateHuecoPayload(body = {}) {
  const errors = [];
  const allowedKeys = ["direccion", "descripcion", "imagen_url", "barrio"];
  const hasExtraKeys = Object.keys(body).some((k) => !allowedKeys.includes(k));
  const { direccion, descripcion, imagen_url, barrio } = body;

  if (
    hasExtraKeys ||
    !isNonEmptyString(direccion) ||
    !isNonEmptyString(descripcion) ||
    !isNonEmptyString(imagen_url) ||
    !isNonEmptyString(barrio)
  ) {
    errors.push("Dirección, barrio, descripción e imagen son obligatorias");
    return { valid: false, errors };
  }

  if (direccion.length > 255) {
    errors.push("La dirección es demasiado larga");
  }
  if (descripcion.length > 2000) {
    errors.push("La descripción es demasiado larga");
  }
  try {
    new URL(imagen_url);
  } catch {
    errors.push("La imagen no tiene una URL válida");
  }

  return { valid: errors.length === 0, errors };
}
