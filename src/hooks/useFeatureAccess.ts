import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const MAX_SEARCHES = 10;

export function useFeatureAccess(featureName: string) {
  const { user } = useAuth();
  const [remainingSearches, setRemainingSearches] = useState(MAX_SEARCHES);
  
  useEffect(() => {
    if (user && user.email) {
      const storageKey = `devdna_limits_${user.email}`;
      const savedLimitsStr = localStorage.getItem(storageKey);
      
      let limits: Record<string, number> = {};
      if (savedLimitsStr) {
        try {
          limits = JSON.parse(savedLimitsStr);
        } catch (e) {
          console.error("Failed to parse limits", e);
        }
      }
      
      if (limits[featureName] !== undefined) {
        setRemainingSearches(limits[featureName]);
      } else {
        // Initialize if not present
        limits[featureName] = MAX_SEARCHES;
        localStorage.setItem(storageKey, JSON.stringify(limits));
        setRemainingSearches(MAX_SEARCHES);
      }
    }
  }, [user, featureName]);

  const consumeSearch = (): boolean => {
    if (!user || !user.email) return false;
    
    const storageKey = `devdna_limits_${user.email}`;
    const savedLimitsStr = localStorage.getItem(storageKey);
    
    let limits: Record<string, number> = {};
    if (savedLimitsStr) {
      try {
        limits = JSON.parse(savedLimitsStr);
      } catch (e) {}
    }
    
    const currentLimit = limits[featureName] ?? MAX_SEARCHES;
    
    if (currentLimit > 0) {
      const newLimit = currentLimit - 1;
      limits[featureName] = newLimit;
      localStorage.setItem(storageKey, JSON.stringify(limits));
      setRemainingSearches(newLimit);
      return true; // Successfully consumed
    }
    
    return false; // Limit reached
  };

  return {
    remainingSearches,
    consumeSearch,
    isLocked: remainingSearches <= 0
  };
}
