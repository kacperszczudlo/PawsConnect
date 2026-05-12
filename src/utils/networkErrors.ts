/** Tekst dla użytkownika przy typowych błędach sieci (fetch / RN). */
export const OFFLINE_MESSAGE =
  'Brak połączenia z internetem lub serwer nie odpowiada. Sprawdź sieć i spróbuj ponownie.';

export function isLikelyOfflineError(error: unknown): boolean {
  if (error == null) {
    return false;
  }

  const msg =
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
      ? String((error as Error).message)
      : String(error);

  const lower = msg.toLowerCase();
  return (
    lower.includes('network request failed') ||
    lower.includes('failed to fetch') ||
    lower.includes('network error') ||
    lower.includes('internet connection appears to be offline') ||
    lower.includes('load failed') ||
    lower.includes('the internet connection appears') ||
    lower.includes('eai_again') ||
    lower.includes('enotfound') ||
    lower.includes('etimedout') ||
    lower.includes('econnrefused')
  );
}

export function friendlyErrorMessage(error: unknown, fallback: string): string {
  if (isLikelyOfflineError(error)) {
    return OFFLINE_MESSAGE;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const m = (error as { message?: unknown }).message;
    if (typeof m === 'string' && m.trim()) {
      return m.trim();
    }
  }

  return fallback;
}
