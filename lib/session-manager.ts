import { supabase } from './supabase';
import { logger } from './logger';

// Constants for session management
const SESSION_EXPIRY_BUFFER = 5 * 60; // 5 minutes in seconds
const SESSION_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes in milliseconds

export class SessionManager {
  private refreshTimer: NodeJS.Timeout | null = null;
  private currentUser: any = null;
  
  /**
   * Initialize the session manager
   */
  constructor() {
    // Listen for auth state changes
    if (typeof window !== 'undefined') {
      // Set up Supabase auth state listener
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session) {
            this.currentUser = session.user;
            this.startRefreshTimer(session);
          }
        } else if (event === 'SIGNED_OUT') {
          this.clearRefreshTimer();
          this.currentUser = null;
        }
      });
      
      // Initialize session from existing session
      this.initializeFromExistingSession();
    }
  }
  
  /**
   * Initialize from an existing session if available
   */
  public async initializeFromExistingSession() {
    try {
      console.log("Initializing from existing session");
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error getting session:", error);
        return;
      }
      
      if (data && data.session) {
        console.log("Found existing session, setting current user");
        this.currentUser = data.session.user;
        this.startRefreshTimer(data.session);
      } else {
        console.log("No existing session found");
      }
    } catch (error) {
      console.error("Exception in initializeFromExistingSession:", error);
      logger.error(error as Error, { context: 'session:initialize' });
    }
  }
  
  /**
   * Start the refresh timer for the session
   */
  private startRefreshTimer(session: any) {
    this.clearRefreshTimer();
    
    if (!session.expires_at) {
      logger.warn('Session missing expires_at timestamp', { context: 'session:refresh-timer' });
      return;
    }
    
    // Calculate when the token needs to be refreshed (5 minutes before expiry)
    const expiresAt = session.expires_at;
    const refreshAt = (expiresAt - SESSION_EXPIRY_BUFFER) * 1000; // Convert to milliseconds
    const now = Date.now();
    
    // Calculate time until refresh is needed
    const timeUntilRefresh = Math.max(0, refreshAt - now);
    
    // Set up refresh timer
    if (timeUntilRefresh < SESSION_REFRESH_INTERVAL) {
      // If token is expiring soon, refresh now
      this.refreshSession();
    } else {
      // Otherwise set a timer to refresh before expiry
      this.refreshTimer = setTimeout(() => {
        this.refreshSession();
      }, timeUntilRefresh);
      
      logger.debug('Session refresh timer started', {
        context: 'session:refresh-timer',
        additionalData: { 
          refreshAt: new Date(refreshAt).toISOString(),
          timeUntilRefresh: Math.floor(timeUntilRefresh / 1000) + ' seconds'
        }
      });
    }
  }
  
  /**
   * Clear the refresh timer
   */
  private clearRefreshTimer() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
  
  /**
   * Refresh the session
   */
  public async refreshSession() {
    try {
      logger.debug('Refreshing authentication session', { context: 'session:refresh' });
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        throw error;
      }
      
      if (data && data.session) {
        logger.debug('Session refreshed successfully', { context: 'session:refresh' });
        this.startRefreshTimer(data.session);
      } else {
        logger.warn('Session refresh returned no session', { context: 'session:refresh' });
      }
    } catch (error) {
      logger.error(error as Error, { context: 'session:refresh' });
      
      // If refresh fails, try again after a delay
      this.refreshTimer = setTimeout(() => {
        this.refreshSession();
      }, 60000); // Try again after 1 minute
    }
  }
  
  /**
   * Check if the current session is valid
   */
  public async isSessionValid(): Promise<boolean> {
    try {
      console.log("Checking if session is valid");
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error in isSessionValid:", error);
        return false;
      }
      
      const isValid = !!(data && data.session);
      console.log("Session validation result:", isValid, data?.session ? "Session exists" : "No session");
      return isValid;
    } catch (error) {
      console.error("Exception in isSessionValid:", error);
      logger.error(error as Error, { context: 'session:validate' });
      return false;
    }
  }
  
  /**
   * Get the current user
   */
  public getCurrentUser() {
    console.log("Getting current user:", this.currentUser);
    return this.currentUser;
  }
  
  /**
   * Sign out and clear session
   */
  public async signOut() {
    try {
      this.clearRefreshTimer();
      await supabase.auth.signOut();
      this.currentUser = null;
      
      return { success: true };
    } catch (error) {
      logger.error(error as Error, { context: 'session:sign-out' });
      return { success: false, error };
    }
  }
}

// Export singleton instance
export const sessionManager = typeof window !== 'undefined' ? new SessionManager() : null; 