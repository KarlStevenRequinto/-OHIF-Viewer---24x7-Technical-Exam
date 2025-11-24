/**
 * Dental Extension for OHIF Viewer
 * Provides dental-specific features including measurements, tooth selection, and theming
 */

import React from 'react';
import { Types } from '@ohif/core';
import { id } from './id';
import getPanelModule from './getPanelModule';
import getToolbarModule from './getToolbarModule';
import getCommandsModule from './getCommandsModule';
import getHangingProtocolModule from './getHangingProtocolModule';
import getLayoutTemplateModule from './getLayoutTemplateModule';
import DentalPracticeHeaderWrapper from './components/DentalPracticeHeaderWrapper';

// Export components for external use
export { default as DentalThemeToggle } from './components/DentalThemeToggle';
export { default as DentalPracticeHeader } from './components/DentalPracticeHeader';
export { default as ToothSelector } from './components/ToothSelector';
export { default as MeasurementsPalette } from './components/MeasurementsPalette';
export { default as MeasurementsList } from './components/MeasurementsList';
export { default as ExportButton } from './components/ExportButton';

// Export utilities
export * from './utils/toothNumbering';
export * from './utils/dentalThemes';
export * from './utils/measurementExport';

// Export store
export { useDentalStore } from './stores/useDentalStore';

// Export types
export * from './types';

/**
 * Pre-registration hook
 * Called before the extension is registered with OHIF
 */
const preRegistration = ({ servicesManager, commandsManager, configuration = {} }) => {
  console.log('🦷 Dental Extension: Pre-registration');

  // Initialize dental theme if configured
  if (configuration.defaultTheme) {
    const { applyTheme, getTheme } = require('./utils/dentalThemes');
    const theme = getTheme(configuration.defaultTheme);
    if (theme) {
      applyTheme(theme);
      console.log(`Applied default theme: ${configuration.defaultTheme}`);
    }
  }

  // Initialize practice info if configured
  if (configuration.practiceInfo) {
    const { useDentalStore } = require('./stores/useDentalStore');
    useDentalStore.getState().setPracticeInfo(configuration.practiceInfo);
    console.log('Set practice info from configuration');
  }
};

/**
 * On Mode Exit hook
 * Clean up dental state when exiting dental mode
 */
const onModeExit = ({ servicesManager }) => {
  console.log('🦷 Dental Extension: Mode exit - cleaning up state');

  // Optionally reset state when exiting mode
  // Uncomment if you want to clear state on mode exit
  // const { useDentalStore } = require('./stores/useDentalStore');
  // useDentalStore.getState().reset();
};

/**
 * Main Extension Definition
 */
const dentalExtension: Types.Extensions.Extension = {
  /**
   * Unique extension ID
   */
  id,

  /**
   * Lifecycle hooks
   */
  preRegistration,
  onModeExit,

  /**
   * Module getters
   */
  getPanelModule,
  getToolbarModule,
  getCommandsModule,
  getHangingProtocolModule,
  getLayoutTemplateModule,

  /**
   * Get Customization Module
   * Provides custom header component for dental workflows
   */
  getCustomizationModule: ({ servicesManager, commandsManager }) => {
    return [
      {
        name: 'dental-header',
        value: {
          id: 'dental-practice-header',
          headerComponent: DentalPracticeHeaderWrapper,
        },
      },
    ];
  },
};

export default dentalExtension;
