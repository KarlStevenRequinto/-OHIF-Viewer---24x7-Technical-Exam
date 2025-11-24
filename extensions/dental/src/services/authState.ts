/**
 * Simple Auth State Management (without React Context)
 * This avoids the AuthProvider context issues with OHIF's extension system
 */

import apiService, { User } from './apiService';

// Global auth state
let currentUser: User | null = null;
let authListeners: Array<(user: User | null) => void> = [];

// Initialize from localStorage
const initAuth = () => {
  currentUser = apiService.getCurrentUserLocal();
};

// Subscribe to auth changes
export const subscribeToAuth = (callback: (user: User | null) => void) => {
  authListeners.push(callback);
  return () => {
    authListeners = authListeners.filter(cb => cb !== callback);
  };
};

// Notify all listeners
const notifyListeners = () => {
  authListeners.forEach(callback => callback(currentUser));
};

// Get current user
export const getCurrentUser = (): User | null => {
  return currentUser;
};

// Check if authenticated
export const isAuthenticated = (): boolean => {
  return !!currentUser;
};

// Login
export const login = async (email: string, password: string): Promise<void> => {
  const response = await apiService.login(email, password);
  if (response.success && response.data) {
    currentUser = response.data.user;
    notifyListeners();
  } else {
    throw new Error(response.message || 'Login failed');
  }
};

// Register
export const register = async (
  email: string,
  password: string,
  fullName: string
): Promise<void> => {
  const response = await apiService.register(email, password, fullName);
  if (response.success && response.data) {
    currentUser = response.data.user;
    notifyListeners();
  } else {
    throw new Error(response.message || 'Registration failed');
  }
};

// Logout
export const logout = (): void => {
  apiService.logout();
  currentUser = null;
  notifyListeners();
};

// Initialize on module load
initAuth();
