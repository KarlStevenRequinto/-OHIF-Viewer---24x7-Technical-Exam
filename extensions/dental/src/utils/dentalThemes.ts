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
 * Apply theme to CSS variables and inject global styles
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

  // Apply global OHIF UI overrides
  injectGlobalThemeStyles(theme);
}

/**
 * Inject global CSS styles to override OHIF UI
 */
function injectGlobalThemeStyles(theme: DentalTheme): void {
  // Remove existing dental theme styles
  const existingStyle = document.getElementById('dental-theme-styles');
  if (existingStyle) {
    existingStyle.remove();
  }

  // Create new style element
  const styleElement = document.createElement('style');
  styleElement.id = 'dental-theme-styles';
  styleElement.textContent = `
    /* Dental Theme Global Overrides */

    /* Body and root background */
    body {
      background-color: ${theme.colors.background} !important;
      color: ${theme.colors.text} !important;
      font-family: ${theme.typography.fontFamily} !important;
    }

    /* Main application container */
    #root {
      background-color: ${theme.colors.background} !important;
    }

    /* Viewport borders (2x2 grid borders) - NO BORDER */
    [class*="viewport-wrapper"],
    [class*="ViewportGrid"],
    [data-cy*="viewport"] {
      border-color: ${theme.colors.primary} !important;
      border-width: 0 !important;
    }

    /* Dental Practice Header - KEEP BORDER */
    #dental-practice-header,
    [id*="dental-practice-header"] {
      border-bottom: 2px solid ${theme.colors.primary} !important;
    }

    /* Grid container borders - MINIMAL GAP */
    [class*="grid"],
    [class*="Grid"] {
      gap: 0.5px !important;
    }

    /* Sidebar backgrounds (left and right panels) */
    [class*="sidebar"],
    [class*="Sidebar"],
    [class*="side-panel"],
    [class*="SidePanel"],
    [class*="panel"],
    [class*="Panel"],
    aside,
    nav {
      background-color: ${theme.colors.surface} !important;
      color: ${theme.colors.text} !important;
    }

    /* Studies panel (left sidebar) - More specific */
    [class*="studies"],
    [class*="Studies"],
    [class*="seriesList"],
    [class*="SeriesList"],
    [class*="thumbnailList"],
    [class*="ThumbnailList"],
    [class*="study-browser"],
    [class*="StudyBrowser"] {
      background-color: ${theme.colors.background} !important;
    }

    /* Studies header */
    [class*="studies"] > div:first-child,
    [class*="Studies"] > div:first-child {
      background-color: ${theme.colors.surface} !important;
      border-bottom: 1px solid ${theme.colors.primary} !important;
    }

    /* Thumbnail container */
    [class*="thumbnail-list"],
    [class*="ThumbnailList"],
    [class*="study-browser-viewport"] {
      background-color: ${theme.colors.background} !important;
    }

    /* Individual thumbnail items */
    [class*="thumbnail"],
    [class*="Thumbnail"],
    [class*="series-item"],
    [class*="SeriesItem"] {
      background-color: ${theme.colors.surface} !important;
      border: 1px solid ${theme.colors.primary} !important;
    }

    [class*="thumbnail"]:hover,
    [class*="Thumbnail"]:hover,
    [class*="series-item"]:hover {
      border-color: ${theme.colors.secondary} !important;
      background-color: ${theme.colors.primary} !important;
    }

    /* Active/Selected thumbnail */
    [class*="thumbnail"][class*="active"],
    [class*="Thumbnail"][class*="active"],
    [class*="thumbnail"][class*="selected"],
    [class*="Thumbnail"][class*="selected"] {
      border-color: ${theme.colors.primary} !important;
      border-width: 2px !important;
      background-color: ${theme.colors.primary} !important;
    }

    /* Measurements panel (right sidebar) */
    [class*="measurement"],
    [class*="Measurement"] {
      background-color: ${theme.colors.surface} !important;
      color: ${theme.colors.text} !important;
    }

    /* Buttons */
    button:not([class*="dental-"]) {
      color: ${theme.colors.text} !important;
    }

    button[class*="primary"]:not([class*="dental-"]) {
      background-color: ${theme.colors.primary} !important;
      border-color: ${theme.colors.primary} !important;
    }

    button[class*="secondary"]:not([class*="dental-"]) {
      background-color: ${theme.colors.secondary} !important;
      border-color: ${theme.colors.secondary} !important;
    }

    /* Input fields */
    input:not([class*="dental-"]),
    select:not([class*="dental-"]),
    textarea:not([class*="dental-"]) {
      background-color: ${theme.colors.background} !important;
      border-color: ${theme.colors.primary} !important;
      color: ${theme.colors.text} !important;
    }

    /* Scrollbars */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: ${theme.colors.background};
    }

    ::-webkit-scrollbar-thumb {
      background: ${theme.colors.primary};
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: ${theme.colors.secondary};
    }

    /* Text colors */
    h1, h2, h3, h4, h5, h6,
    p, span, div, label {
      color: ${theme.colors.text} !important;
    }

    /* Cards and containers */
    [class*="card"],
    [class*="Card"],
    [class*="container"],
    [class*="Container"] {
      background-color: ${theme.colors.surface} !important;
      color: ${theme.colors.text} !important;
    }

    /* Borders */
    [class*="border"] {
      border-color: ${theme.colors.primary} !important;
    }

    /* Links */
    a {
      color: ${theme.colors.primary} !important;
    }

    a:hover {
      color: ${theme.colors.secondary} !important;
    }

    /* Selected/Active states */
    [class*="selected"],
    [class*="active"],
    [aria-selected="true"] {
      background-color: ${theme.colors.primary} !important;
      color: white !important;
    }

    /* Tooltips */
    [role="tooltip"],
    [class*="tooltip"],
    [class*="Tooltip"] {
      background-color: ${theme.colors.surface} !important;
      color: ${theme.colors.text} !important;
      border: 1px solid ${theme.colors.primary} !important;
    }

    /* Modal/Dialog backgrounds */
    [role="dialog"],
    [class*="modal"],
    [class*="Modal"],
    [class*="dialog"],
    [class*="Dialog"] {
      background-color: ${theme.colors.surface} !important;
      color: ${theme.colors.text} !important;
    }

    /* Overlay backgrounds */
    [class*="overlay"],
    [class*="Overlay"],
    [class*="backdrop"],
    [class*="Backdrop"] {
      background-color: ${hexToRgba(theme.colors.background, 0.8)} !important;
    }

    /* Export button styling */
    button[class*="Export"] {
      background-color: ${theme.colors.primary} !important;
      color: white !important;
    }

    /* Force all divs with dark backgrounds to use theme */
    div[style*="background"][style*="rgb(0, 0, 0)"],
    div[style*="background"][style*="#000"],
    div[style*="background-color: rgb(0, 0, 0)"],
    div[style*="background-color: black"] {
      background-color: ${theme.colors.background} !important;
    }

    /* Studies list specific - nuclear option */
    div[class*="overflow"]:not([id*="dental"]) {
      background-color: ${theme.colors.background} !important;
    }

    /* Flex containers in sidebars */
    aside > div,
    nav > div,
    [class*="panel"] > div:not([class*="dental"]) {
      background-color: ${theme.colors.background} !important;
    }

    /* Text in sidebars */
    aside *:not(button):not(input):not(select),
    nav *:not(button):not(input):not(select),
    [class*="sidebar"] *:not(button):not(input):not(select),
    [class*="panel"] *:not(button):not(input):not(select) {
      color: ${theme.colors.text} !important;
    }

    /* Grid gap for viewports */
    [class*="grid"][class*="viewport"] {
      gap: 1px !important;
    }

    /* Measurement panel text */
    [class*="measurement"] *,
    [class*="Measurement"] * {
      color: ${theme.colors.text} !important;
    }
  `;

  // Append to head
  document.head.appendChild(styleElement);

  console.log(`✅ Applied dental theme: ${theme.name}`);
}

/**
 * Helper to convert hex to rgba
 */
function hexToRgba(hex: string, alpha: number): string {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
