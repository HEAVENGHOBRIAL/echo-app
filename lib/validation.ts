// Vérifications faites dans l'app avant d'appeler Supabase (réponse immédiate, sans réseau).
import type { Dict } from '@/lib/i18n';

export const MIN_PASSWORD_LENGTH = 8;

export function validateEmail(email: string, t: Dict): string | null {
  const value = email.trim();
  if (!value) return t.validation.emailEmpty;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t.validation.emailInvalid;
  return null;
}

export function validatePassword(password: string, t: Dict): string | null {
  if (!password) return t.validation.passwordEmpty;
  if (password.length < MIN_PASSWORD_LENGTH) return t.validation.passwordShort(MIN_PASSWORD_LENGTH);
  return null;
}

export function validateFirstName(name: string, t: Dict): string | null {
  if (!name.trim()) return t.validation.firstNameEmpty;
  return null;
}
