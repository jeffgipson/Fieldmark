const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export function validateRequired(value, label) {
  if (!String(value ?? "").trim()) return `${label} is required.`;
  return null;
}

export function validateName(value, label) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return `${label} is required.`;
  if (trimmed.length < 2) return `${label} must be at least 2 characters.`;
  return null;
}

export function validateEmail(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "Email is required.";
  if (!EMAIL_PATTERN.test(trimmed)) return "Enter a valid email address.";
  return null;
}

export function validatePassword(value) {
  const password = String(value ?? "");
  if (!password) return "Password is required.";
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}

export function validatePositiveNumber(value, label) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return `${label} is required.`;
  const num = Number(trimmed);
  if (Number.isNaN(num) || num <= 0) return `${label} must be greater than zero.`;
  return null;
}

export function validateFarmLocation(form) {
  if (form.latitude == null || form.longitude == null) {
    return "Mark your farm on the map or search for an address.";
  }
  return null;
}

/** Returns a map of field keys to error messages (empty object = valid). */
export function validateLoginForm(form) {
  const errors = {};

  const email = validateEmail(form.email);
  if (email) errors.email = email;

  const password = validateRequired(form.password, "Password");
  if (password) errors.password = password;

  return errors;
}

/** Returns a map of field keys to error messages (empty object = valid). */
export function validateRegisterForm(form) {
  const errors = {};

  const firstName = validateName(form.first_name, "First name");
  if (firstName) errors.first_name = firstName;

  const lastName = validateName(form.last_name, "Last name");
  if (lastName) errors.last_name = lastName;

  const email = validateEmail(form.email);
  if (email) errors.email = email;

  const password = validatePassword(form.password);
  if (password) errors.password = password;

  const farmName = validateRequired(form.farm_name, "Farm name");
  if (farmName) errors.farm_name = farmName;

  const location = validateFarmLocation(form);
  if (location) errors.location = location;

  const acres = validatePositiveNumber(form.total_acres, "Total acres");
  if (acres) errors.total_acres = acres;

  const county = validateRequired(form.county, "County");
  if (county) errors.county = county;

  return errors;
}
