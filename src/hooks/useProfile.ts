import { useCallback, useEffect, useState } from 'react';
import { profileService } from '../services/profileService';
import { UserProfile } from '../types/profile';

interface UseProfileResult {
  profile: UserProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  loadProfile: () => Promise<void>;
  saveProfile: (nextProfile: UserProfile) => Promise<boolean>;
}

export const useProfile = (): UseProfileResult => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
    } catch {
      setError('Nie udało się załadować profilu.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveProfile = useCallback(async (nextProfile: UserProfile) => {
    try {
      setError(null);
      setIsSaving(true);
      const updated = await profileService.updateProfile(nextProfile);
      setProfile(updated);
      return true;
    } catch {
      setError('Nie udało się zapisać zmian.');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  return {
    profile,
    isLoading,
    isSaving,
    error,
    loadProfile,
    saveProfile,
  };
};
