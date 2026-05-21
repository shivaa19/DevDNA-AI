"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string) => boolean;
  registerUser: (name: string, email: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Read from localStorage on mount
    const storedUser = localStorage.getItem('devdna_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('devdna_user');
      }
    }
    setIsLoading(false);
  }, []);

  const registerUser = (name: string, email: string) => {
    // Get existing registered users
    const registered = localStorage.getItem('devdna_registered_users');
    let usersList: User[] = [];
    if (registered) {
      try {
        usersList = JSON.parse(registered);
      } catch (e) {
        usersList = [];
      }
    }

    // Add new user if not already registered (avoid duplicates)
    if (!usersList.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      usersList.push({ name, email });
      localStorage.setItem('devdna_registered_users', JSON.stringify(usersList));
    }

    // Log the user in immediately after registering
    const newUser = { name, email };
    setUser(newUser);
    localStorage.setItem('devdna_user', JSON.stringify(newUser));
  };

  const login = (email: string): boolean => {
    // Retrieve registered users
    const registered = localStorage.getItem('devdna_registered_users');
    let usersList: User[] = [];
    if (registered) {
      try {
        usersList = JSON.parse(registered);
      } catch (e) {
        usersList = [];
      }
    }

    // Find the user by email
    const existingUser = usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (existingUser) {
      setUser(existingUser);
      localStorage.setItem('devdna_user', JSON.stringify(existingUser));
      
      // Load user-specific profile data into the global states so it populates correctly
      const profileStr = localStorage.getItem(`devdna_profile_${existingUser.email}`);
      if (profileStr) {
        try {
          const profile = JSON.parse(profileStr);
          if (profile.github_username) localStorage.setItem('devdna_github_user', profile.github_username);
          if (profile.github_stats) localStorage.setItem('devdna_github_stats', JSON.stringify(profile.github_stats));
          
          if (profile.formData?.linkedin || profile.linkedin_username) {
            localStorage.setItem('devdna_linkedin_user', profile.formData?.linkedin || profile.linkedin_username);
          }
          if (profile.linkedin_stats) localStorage.setItem('devdna_linkedin_stats', JSON.stringify(profile.linkedin_stats));

          if (profile.leetcode_username) localStorage.setItem('devdna_leetcode_user', profile.leetcode_username);
          if (profile.leetcode_stats) localStorage.setItem('devdna_leetcode_stats', JSON.stringify(profile.leetcode_stats));
        } catch(e) {}
      }

      return true;
    } else {
      // Return false so the UI knows they must sign up first
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('devdna_user');
    
    // Clear global platform states so the next user doesn't inherit them
    localStorage.removeItem('devdna_github_user');
    localStorage.removeItem('devdna_github_stats');
    localStorage.removeItem('devdna_linkedin_user');
    localStorage.removeItem('devdna_linkedin_stats');
    localStorage.removeItem('devdna_leetcode_user');
    localStorage.removeItem('devdna_leetcode_stats');
  };

  return (
    <AuthContext.Provider value={{ user, login, registerUser, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
