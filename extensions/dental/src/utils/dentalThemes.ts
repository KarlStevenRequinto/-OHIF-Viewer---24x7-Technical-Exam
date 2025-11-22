/**
 * Dental Theme Definitions
 * Provides color schemes and typography for dental-specific UI
 */

import { DentalTheme } from '../types';

/**
 * Default OHIF theme (for reference)
 */
export const defaultTheme: DentalTheme = {
  name: 'default',
  colors: {
    primary: '#5ACCE6',
    secondary: '#3A3F99',
    background: '#090C29',
    surface: '#1F1F3D',
    text: '#FFFFFF',
    accent: '#5ACCE6',
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    headerSize: '1.25rem',
    bodySize: '0.875rem',
  },
};

/**
 * Dental Professional Theme
 * Clean, clinical appearance with dental-appropriate colors
 */
export const dentalTheme: DentalTheme = {
  name: 'dental',
  colors: {
    primary: '#2B7A9B',      // Dental blue (trust, professionalism)
    secondary: '#4CAF50',    // Healthy green
    background: '#F5F7FA',   // Light clinical background
    surface: '#FFFFFF',      // Pure white surfaces
    text: '#1A2332',         // Dark text for readability
    accent: '#FF6B6B',       // Attention red (for alerts/issues)
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    headerSize: '1.5rem',
    bodySize: '1rem',
  },
};

/**
 * Dental Dark Theme
 * For low-light environments or user preference
 */
export const dentalDarkTheme: DentalTheme = {
  name: 'dental-dark',
  colors: {
    primary: '#4ECDC4',      // Bright teal
    secondary: '#66BB6A',    // Bright green
    background: '#121826',   // Very dark blue-grey
    surface: '#1E2534',      // Dark surface
    text: '#E8EAED',         // Light grey text
    accent: '#FF7675',       // Soft red
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    headerSize: '1.5rem',
    bodySize: '1rem',
  },
};

/**
 * All available themes
 */
export const dentalThemes = {
  default: defaultTheme,
  dental: dentalTheme,
  'dental-dark': dentalDarkTheme,
};

/**
 * Get theme by name
 */
export function getTheme(themeName: string): DentalTheme {
  return dentalThemes[themeName] || defaultTheme;
}

/**
 * Apply theme to CSS variables
 */
export function applyTheme(theme: DentalTheme): void {
  const root = document.documentElement;

  // Apply color variables
  root.style.setProperty('--dental-primary', theme.colors.primary);
  root.style.setProperty('--dental-secondary', theme.colors.secondary);
  root.style.setProperty('--dental-background', theme.colors.background);
  root.style.setProperty('--dental-surface', theme.colors.surface);
  root.style.setProperty('--dental-text', theme.colors.text);
  root.style.setProperty('--dental-accent', theme.colors.accent);

  // Apply typography variables
  root.style.setProperty('--dental-font-family', theme.typography.fontFamily);
  root.style.setProperty('--dental-header-size', theme.typography.headerSize);
  root.style.setProperty('--dental-body-size', theme.typography.bodySize);

  // Store current theme name
  root.setAttribute('data-dental-theme', theme.name);
}

/**
 * Get current theme name from DOM
 */
export function getCurrentThemeName(): string {
  return document.documentElement.getAttribute('data-dental-theme') || 'default';
}

/**
 * Theme storage key for localStorage
 */
export const THEME_STORAGE_KEY = 'ohif-dental-theme';

/**
 * Save theme preference to localStorage
 */
export function saveThemePreference(themeName: string): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeName);
  } catch (error) {
    console.warn('Failed to save theme preference:', error);
  }
}

/**
 * Load theme preference from localStorage
 */
export function loadThemePreference(): string | null {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to load theme preference:', error);
    return null;
  }
}
