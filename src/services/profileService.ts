import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { UserProfile } from '../types';
import { AuthService } from './authService';

export const ProfileService = {
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw new Error(error.message);
    }

    const session = AuthService.getLocalSession();
    if (session && session.user.id === userId) {
      const updatedUser: UserProfile = {
        ...session.user,
        ...updates,
        updated_at: new Date().toISOString(),
      };
      AuthService.saveLocalSession(updatedUser);
      return updatedUser;
    }

    throw new Error('User profile not found.');
  },
};
