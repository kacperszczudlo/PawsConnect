export const normalizePhone = (value: string) => value.replace(/\s+/g, ' ').trim();

export const isValidPhone = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.length === 9 || (digits.length === 11 && digits.startsWith('48'));
};

export const normalizePostalCode = (value: string) => {
  const trimmed = value.trim();
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length === 5) {
    return `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(2)}`;
  }

  return trimmed;
};

export const isValidPostalCode = (value: string) => /^\d{2}-\d{3}$/.test(value.trim());
