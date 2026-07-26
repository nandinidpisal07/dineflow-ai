import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../types';

export function useProfile() {
  const { user, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveProfile = async (updates: Partial<UserProfile>) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateProfile(updates);
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    profile: user,
    saving,
    error,
    saveProfile,
  };
}
