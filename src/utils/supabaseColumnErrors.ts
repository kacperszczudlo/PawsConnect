export const isSchemaOrMissingColumnError = (error: unknown): boolean => {
  const e = error as { code?: string; message?: string } | null | undefined;
  if (!e) {
    return false;
  }
  const code = String(e.code ?? '');
  if (code === 'PGRST204' || code === '42703') {
    return true;
  }
  const msg = (e.message ?? '').toLowerCase();
  return msg.includes('schema cache') || (msg.includes('could not find') && msg.includes('column'));
};

export const APPLICANT_OPTIONAL_INSERT_KEYS = [
  'applicant_email',
  'applicant_phone',
  'applicant_city',
  'applicant_avatar_url',
  'applicant_message',
] as const;
