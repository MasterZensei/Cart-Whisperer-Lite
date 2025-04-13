"use client";

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Custom hook to handle navigation with transition handling
 * This helps prevent black/white screens during navigation
 */
export function useNavigation() {
  const router = useRouter();
  
  /**
   * Navigate to a path with proper transition handling
   * 
   * @param path The path to navigate to
   * @param options Optional configuration
   */
  const navigate = useCallback((
    path: string, 
    options: { 
      delay?: number;
      replace?: boolean;
    } = {}
  ) => {
    // Notify layout about navigation start
    window.dispatchEvent(new CustomEvent('before-reactnavigation'));
    
    // Log navigation for debugging
    console.log(`Navigation: Navigating to ${path}`);
    
    // Use a small delay to ensure the navigation event is processed
    setTimeout(() => {
      if (options.replace) {
        router.replace(path);
      } else {
        router.push(path);
      }
      
      // Notify that navigation has completed
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('next-route-changed'));
      }, 300);
    }, options.delay || 50);
  }, [router]);
  
  return {
    navigate,
    
    // Convenience method for common paths
    navigateToDashboard: () => navigate('/dashboard'),
    navigateToLogin: () => navigate('/login'),
    navigateToSettings: () => navigate('/settings'),
    
    // Method to navigate with replace (doesn't add to history)
    replaceWith: (path: string) => navigate(path, { replace: true })
  };
} 