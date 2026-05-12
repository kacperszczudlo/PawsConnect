import type { User } from '@supabase/supabase-js';
import { supabase } from '../supabase';

export const commitAuthProfileUpdate = async (authPayload: Record<string, any>): Promise<User> => {
  const { data, error } = await supabase.auth.updateUser(authPayload);
  if (error || !data.user) {
    throw error ?? new Error('Nie udało się zaktualizować profilu.');
  }
  return data.user;
};
