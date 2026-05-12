import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { UserProfile } from '../types/profile';

const mapUserToProfile = (user: User): UserProfile => {
  const role = user.user_metadata?.role;
  const fullName =
    role === 'admin'
      ? (user.user_metadata?.shelter_name ?? '').toString()
      : (user.user_metadata?.full_name ?? '').toString();

  return {
    id: user.id,
    fullName,
    email: (user.email ?? '').toString(),
    phone: (user.user_metadata?.phone ?? '').toString(),
    city: (user.user_metadata?.city ?? '').toString(),
    avatarUrl: (user.user_metadata?.avatar_url ?? '').toString(),
  };
};

export const profileService = {
  async getProfile(): Promise<UserProfile> {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw error ?? new Error('Nie udało się pobrać profilu.');
    }

    return mapUserToProfile(data.user);
  },

  async updateProfile(payload: UserProfile): Promise<UserProfile> {
    const { data, error } = await supabase.auth.updateUser({
      email: payload.email,
      data: {
        full_name: payload.fullName,
        city: payload.city,
        phone: payload.phone,
        avatar_url: payload.avatarUrl,
      },
    });

    if (error || !data.user) {
      throw error ?? new Error('Nie udało się zaktualizować profilu.');
    }

    return mapUserToProfile(data.user);
  },
};
