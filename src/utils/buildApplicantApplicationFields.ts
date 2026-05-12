import type { User } from '@supabase/supabase-js';

/** Pola wnioskującego zapisywane razem z wierszem `applications` (snake_case → Supabase). */
export function buildApplicantApplicationFields(user: User, options?: { message?: string }) {
  const md = user.user_metadata ?? {};
  const fullName = (md.full_name ?? '').toString().trim();
  const email = (user.email ?? '').toString().trim();
  const message = options?.message?.trim() ?? '';

  return {
    applicant_name: fullName || email || 'Użytkownik',
    applicant_email: email,
    applicant_phone: (md.phone ?? '').toString().trim(),
    applicant_city: (md.city ?? '').toString().trim(),
    applicant_avatar_url: (md.avatar_url ?? '').toString().trim(),
    ...(message ? { applicant_message: message } : {}),
  };
}
