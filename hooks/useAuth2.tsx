"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

type User = {
  id: string;
  email: string;
};

type Session = {
  access_token?: string;
  expires_at?: number;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, storeName?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  loading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  signIn: async () => false,
  signUp: async () => false,
  signOut: async () => {},
  loading: true,
  error: null,
});

export const useAuth = () => useContext(AuthContext);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    console.log("Auth provider initializing");
    const storedUser = localStorage.getItem('user');
    const storedSession = localStorage.getItem('session');

    console.log("Stored user found:", !!storedUser);
    console.log("Stored session found:", !!storedSession);

    if (storedUser && storedSession) {
      const parsedUser = JSON.parse(storedUser);
      const parsedSession = JSON.parse(storedSession);

      // Check if session is expired
      if (parsedSession.expires_at && parsedSession.expires_at * 1000 > Date.now()) {
        console.log("Valid session found, setting user:", parsedUser.email);
        setUser(parsedUser);
        setSession(parsedSession);
      } else {
        // Clear if expired
        console.log("Session expired, clearing localStorage");
        localStorage.removeItem('user');
        localStorage.removeItem('session');
      }
    }

    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sign in failed');
      }

      setUser(data.user);
      setSession(data.session);

      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('session', JSON.stringify(data.session));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
      console.error('Sign in error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, storeName?: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, storeName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sign up failed');
      }

      // After signup, sign in the user
      return await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
      console.error('Sign up error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);

      await fetch('/api/auth/signout', {
        method: 'POST',
      });

      // Clear state
      setUser(null);
      setSession(null);

      // Remove from localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('session');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign out failed');
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    signIn,
    signUp,
    signOut,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 