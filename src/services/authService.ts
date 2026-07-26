import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { UserProfile, UserRole } from '../types';

const LOCAL_SESSION_KEY = 'dineflow_session';
const LOCAL_USERS_KEY = 'dineflow_local_users';

export interface AuthSession {
  user: UserProfile;
}

export const AuthService = {
  async getSession(): Promise<AuthSession | null> {
    if (isSupabaseConfigured && supabase) {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) return this.getLocalSession();

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        const userObj: UserProfile = {
          id: profile.id,
          email: profile.email || session.user.email || '',
          full_name: profile.full_name || 'User',
          role: profile.role || null,
          phone: profile.phone,
          profile_image: profile.profile_image,
          created_at: profile.created_at || new Date().toISOString(),
          updated_at: profile.updated_at || new Date().toISOString(),
        };
        this.saveLocalSession(userObj);
        return { user: userObj };
      }
    }
    return this.getLocalSession();
  },

  async signUp(email: string, password: string, fullName: string, role?: UserRole): Promise<UserProfile> {
    const targetRole = role || null;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role: targetRole },
        },
      });

      if (error) throw new Error(error.message);
      if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email,
          full_name: fullName,
          role: targetRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await supabase.from('profiles').insert([{
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: targetRole,
        }]);

        this.saveLocalSession(profile);
        return profile;
      }
    }

    // Local fallback persistence engine
    const users = this.getLocalUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }

    const newUser: UserProfile = {
      id: 'usr_' + Date.now(),
      email,
      full_name: fullName,
      role: targetRole,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    this.saveLocalSession(newUser);
    return newUser;
  },

  async signIn(email: string, password: string, expectedRole?: UserRole): Promise<UserProfile> {
    let userObj: UserProfile | null = null;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        userObj = {
          id: data.user.id,
          email: data.user.email || email,
          full_name: profile?.full_name || 'User',
          role: profile?.role || null,
          phone: profile?.phone,
          profile_image: profile?.profile_image,
          created_at: profile?.created_at || new Date().toISOString(),
          updated_at: profile?.updated_at || new Date().toISOString(),
        };
      }
    } else {
      const users = this.getLocalUsers();
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        throw new Error('Invalid email or password.');
      }
      userObj = user;
    }

    if (!userObj) {
      throw new Error('Unable to authenticate.');
    }

    // If role requested, verify or set if unset
    if (expectedRole) {
      if (!userObj.role) {
        userObj = await this.setUserRole(userObj.id, expectedRole);
      } else if (expectedRole === 'restaurant_owner' && userObj.role !== 'restaurant_owner' && userObj.role !== 'business') {
        throw new Error('This account is registered as a Customer. Please log in through Customer Login.');
      } else if (expectedRole === 'customer' && userObj.role !== 'customer') {
        throw new Error('This account is registered as a Restaurant Owner. Please log in through Restaurant Login.');
      }
    }

    this.saveLocalSession(userObj);
    return userObj;
  },

  async setUserRole(userId: string, role: UserRole): Promise<UserProfile> {
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId);
    }

    const currentSession = this.getLocalSession();
    if (currentSession && currentSession.user.id === userId) {
      currentSession.user.role = role;
      currentSession.user.updated_at = new Date().toISOString();
      this.saveLocalSession(currentSession.user);

      const users = this.getLocalUsers();
      const idx = users.findIndex((u) => u.id === userId);
      if (idx !== -1) {
        users[idx].role = role;
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
      }
      return currentSession.user;
    }

    throw new Error('User session not found.');
  },

  async resetPassword(email: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw new Error(error.message);
    }
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LOCAL_SESSION_KEY);
  },

  saveLocalSession(user: UserProfile) {
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ user }));
  },

  getLocalSession(): AuthSession | null {
    try {
      const stored = localStorage.getItem(LOCAL_SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  getLocalUsers(): UserProfile[] {
    try {
      const stored = localStorage.getItem(LOCAL_USERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },
};
