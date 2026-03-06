import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiRequest, authApiRequest, AuthUser, Profile, TOKEN_KEY } from '../lib/api';

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: 'admin' | 'instructor' | 'practitioner',
    avatarUrl?: string
  ) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string | null;
    role: 'admin' | 'instructor' | 'practitioner';
    created_at: string;
    updated_at: string;
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    apiRequest<{ user: AuthResponse['user'] }>('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((data) => {
        setUser({ id: data.user.id, email: data.user.email });
        setProfile({
          id: data.user.id,
          full_name: data.user.full_name,
          avatar_url: data.user.avatar_url,
          role: data.user.role || 'practitioner',
          created_at: data.user.created_at,
          updated_at: data.user.updated_at,
        });
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: 'admin' | 'instructor' | 'practitioner',
    avatarUrl?: string
  ) => {
    try {
      const data = await apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, fullName, role, avatarUrl: avatarUrl || null }),
      });

      localStorage.setItem(TOKEN_KEY, data.token);
      setUser({ id: data.user.id, email: data.user.email });
      setProfile({
        id: data.user.id,
        full_name: data.user.full_name,
        avatar_url: data.user.avatar_url,
        role: data.user.role || 'practitioner',
        created_at: data.user.created_at,
        updated_at: data.user.updated_at,
      });

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const data = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem(TOKEN_KEY, data.token);
      setUser({ id: data.user.id, email: data.user.email });
      setProfile({
        id: data.user.id,
        full_name: data.user.full_name,
        avatar_url: data.user.avatar_url,
        role: data.user.role || 'practitioner',
        created_at: data.user.created_at,
        updated_at: data.user.updated_at,
      });

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setProfile(null);
    window.history.pushState({}, '', '/login');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return { error: new Error('No profile found') };

    try {
      const data = await authApiRequest<{ user: AuthResponse['user'] }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          fullName: updates.full_name,
          avatarUrl: updates.avatar_url,
        }),
      });

      setProfile({
        id: data.user.id,
        full_name: data.user.full_name,
        avatar_url: data.user.avatar_url,
        role: data.user.role || 'practitioner',
        created_at: data.user.created_at,
        updated_at: data.user.updated_at,
      });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
