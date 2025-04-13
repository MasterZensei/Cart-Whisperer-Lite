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
        console.log("Checking session...");
        
        // Set a timeout to prevent infinite loading - reduced from 5s to 2s for faster fallback
        const timeoutId = setTimeout(() => {
          console.log("Auth check timeout reached - forcing loading state to false");
          setLoading(false);
          setUser(null);
        }, 2000);
        
        // Use session manager to get current user
        if (sessionManager) {
          console.log("Using sessionManager to validate session");
          try {
            const isSessionValid = await sessionManager.isSessionValid();
            console.log("Session validation result:", isSessionValid);
            
            if (isSessionValid) {
              const currentUser = sessionManager.getCurrentUser();
              console.log("Current user from session:", currentUser);
              
              if (currentUser && currentUser.id && currentUser.email) {
                setUser({
                  id: currentUser.id,
                  email: currentUser.email,
                });
              } else {
                console.log("User data incomplete in session");
                setUser(null);
              }
            } else {
              console.log("Session is not valid");
              setUser(null);
            }
          } catch (sessionError) {
            console.error("Error validating session:", sessionError);
            logger.error(sessionError as Error, { context: 'auth:session-validation' });
            setUser(null);
            
            // Clear the timeout if we reach this point
            clearTimeout(timeoutId);
            setLoading(false);
          }
        } else {
          console.log("Session manager not available, falling back to API");
          // Fallback to API call if session manager is not available
          try {
            const response = await fetch('/api/auth/session', {
              method: 'GET',
              credentials: 'include',
            });
            
            if (!response.ok) {
              throw new Error('Session check failed');
            }
            
            const data = await response.json();
            console.log("Session API response:", data);
            
            if (data.user) {
              setUser(data.user);
            } else {
              setUser(null);
            }
          } catch (fetchError) {
            console.error("API session check failed:", fetchError);
            logger.error(fetchError as Error, { context: 'auth:session-check-api' });
            setUser(null);
            
            // Clear the timeout if we reach this point
            clearTimeout(timeoutId);
            setLoading(false);
          }
        }
        
        // Clear the timeout if we reach this point
        clearTimeout(timeoutId);
      } catch (err) {
        console.error("Session check error:", err);
        logger.error(err as Error, { context: 'auth:session-check' });
        setUser(null);
      } finally {
        // Ensure loading state changes even if errors occur
        console.log("Finished checking session, setting loading to false");
        setLoading(false);
      }
    };
    
    // Wrap the session check in a try-catch to ensure it never breaks the UI
    try {
      checkSession();
    } catch (err) {
      console.error("Critical session check error:", err);
      setLoading(false);
      setUser(null);
    }

    // Handle client-side navigation auth state
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        try {
          checkSession();
        } catch (err) {
          console.error("Error during visibility change check:", err);
          setLoading(false);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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