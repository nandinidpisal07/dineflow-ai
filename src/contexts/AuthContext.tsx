import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { AuthService } from '../services/authService';
import { ProfileService } from '../services/profileService';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signUp: (email: string, pass: string, name: string, role?: UserRole) => Promise<UserProfile>;
  signIn: (email: string, pass: string, role?: UserRole) => Promise<UserProfile>;
  setUserRole: (role: UserRole) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  hasSelectedRole: boolean;
  isCustomer: boolean;
  isBusiness: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    AuthService.getSession()
      .then((session) => {
        if (session) {
          setUser(session.user);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const signUp = async (email: string, pass: string, name: string, role?: UserRole) => {
    setLoading(true);
    try {
      const newUser = await AuthService.signUp(email, pass, name, role);
      setUser(newUser);
      return newUser;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, pass: string, role?: UserRole) => {
    setLoading(true);
    try {
      const loggedUser = await AuthService.signIn(email, pass, role);
      setUser(loggedUser);
      return loggedUser;
    } finally {
      setLoading(false);
    }
  };

  const setUserRole = async (role: UserRole) => {
    if (!user) throw new Error('No active session.');
    setLoading(true);
    try {
      const updated = await AuthService.setUserRole(user.id, role);
      setUser(updated);
      return updated;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await AuthService.signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No active user profile.');
    const updated = await ProfileService.updateProfile(user.id, updates);
    setUser(updated);
    return updated;
  };

  const hasSelectedRole = Boolean(user && user.role);
  const isCustomer = user?.role === 'customer';
  const isBusiness = user?.role === 'restaurant_owner' || user?.role === 'business';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        setUserRole,
        signOut,
        updateProfile,
        hasSelectedRole,
        isCustomer,
        isBusiness,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
