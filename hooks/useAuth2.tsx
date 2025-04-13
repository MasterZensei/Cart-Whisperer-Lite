"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { sessionManager } from '@/lib/session-manager';
import { logger } from '@/lib/logger';

type User = {
  id: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, storeName?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  loading: boolean;
  error: string | null;
  refreshSession: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  signIn: async () => false,
  signUp: async () => false,
  signOut: async () => {},
  loading: true,
  error: null,
  refreshSession: async () => false,
});

export const useAuth = () => useContext(AuthContext);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Get CSRF token for forms
  const getCsrfToken = async () => {
    try {
      const response = await fetch('/api/auth/csrf', {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Failed to get CSRF token');
      }
      
      const data = await response.json();
      return data.csrfToken;
    } catch (err) {
      logger.error(err as Error, { context: 'auth:csrf' });
      return null;
    }
  };

  // Check user session on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
        
        // Use session manager to get current user
        if (sessionManager) {
          const isSessionValid = await sessionManager.isSessionValid();
          
          if (isSessionValid) {
            const currentUser = sessionManager.getCurrentUser();
            if (currentUser && currentUser.id && currentUser.email) {
              setUser({
                id: currentUser.id,
                email: currentUser.email,
              });
            } else {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        } else {
          // Fallback to API call if session manager is not available
          const response = await fetch('/api/auth/session', {
            method: 'GET',
            credentials: 'include',
          });
          
          if (!response.ok) {
            throw new Error('Session check failed');
          }
          
          const data = await response.json();
          
          if (data.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        logger.error(err as Error, { context: 'auth:session-check' });
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get CSRF token
      const csrfToken = await getCsrfToken();
      
      if (!csrfToken) {
        throw new Error('Unable to get CSRF token');
      }
      
      // Submit login request with CSRF token
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sign in failed');
      }

      setUser(data.user);
      
      // Initialize session manager after successful login
      if (sessionManager) {
        await sessionManager.initializeFromExistingSession?.();
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
      logger.error(err as Error, { context: 'auth:signin' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, storeName?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get CSRF token
      const csrfToken = await getCsrfToken();
      
      if (!csrfToken) {
        throw new Error('Unable to get CSRF token');
      }

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, storeName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sign up failed');
      }

      setUser(data.user);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
      logger.error(err as Error, { context: 'auth:signup' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use session manager for sign out if available
      if (sessionManager) {
        const { success, error } = await sessionManager.signOut();
        if (!success && error) {
          throw error;
        }
      } else {
        // Fallback to API call
        await fetch('/api/auth/signout', {
          method: 'POST',
          credentials: 'include',
        });
      }

      // Clear state
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign out failed');
      logger.error(err as Error, { context: 'auth:signout' });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to manually refresh the session
  const refreshSession = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (sessionManager) {
        // Use session manager to refresh
        await sessionManager.refreshSession?.();
        const isValid = await sessionManager.isSessionValid();
        return isValid;
      } else {
        // Fallback to API call
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });
        
        return response.ok;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Session refresh failed');
      logger.error(err as Error, { context: 'auth:refresh-session' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    signIn,
    signUp,
    signOut,
    loading,
    error,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 