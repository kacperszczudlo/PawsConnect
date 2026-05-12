import type { User } from '@supabase/supabase-js';

export type EditableProfileRole = 'admin' | 'user';

export interface ProfileSyncDraft {
  role: EditableProfileRole;
  user: User;
  fullName: string;
  city: string;
  phone: string;
  email: string;
  avatarUrl?: string | null;
  shelterStreet?: string;
  shelterPostalCode?: string;
  newPassword?: string;
}
