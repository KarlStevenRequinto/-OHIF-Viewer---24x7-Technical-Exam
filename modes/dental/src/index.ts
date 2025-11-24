/**
 * Dental Mode for OHIF Viewer
 * Specialized viewing mode for dental imaging workflows with 2x2 layout
 */

import { utils } from '@ohif/core';
import { id } from './id';

const { structuredCloneWithFunctions } = utils;

/**
 * Extension module references
 */
const ohif = {
  layout: '@ohif/extension-default.layoutTemplateModule.viewerLayout',
  sopClassHandler: '@ohif/extension-default.sopClassHandlerModule.stack',
  thumbnailList: '@ohif/extension-default.panelModule.seriesList',
};

const cornerstone = {
  viewport: '@ohif/extension-cornerstone.viewportModule.cornerstone',
  measurements: '@ohif/extension-cornerstone.panelModule.panelMeasurement',
};

/**
 * SOP Class Handlers
 * Define which DICOM SOP classes this mode can handle
 */
export const sopClassHandlers = [ohif.sopClassHandler];

/**
 * Extension Dependencies
 * List all extensions required by this mode
 */
const extensionDependencies = {
  '@ohif/extension-default': '^3.0.0',
  '@ohif/extension-cornerstone': '^3.0.0',
  '@ohif/extension-dental': '^3.0.0',
};

/**
 * Dental Layout Configuration
 * Defines the UI layout for dental mode
 */
export const dentalLayout = {
  id: ohif.layout,
  props: {
    // Left panels - Series thumbnail list
    leftPanels: [ohif.thumbnailList],
    leftPanelResizable: true,

    // Right panels - Dental measurements and cornerstone measurements
    rightPanels: [
      '@ohif/extension-dental.panelModule.dentalMeasurements',
      cornerstone.measurements,
    ],
    rightPanelClosed: false,
    rightPanelResizable: true,
    rightPanelDefaultWidth: 400,

    // Viewports - Will use 2x2 grid from hanging protocol
    viewports: [
      {
        namespace: cornerstone.viewport,
        displaySetsToDisplay: [ohif.sopClassHandler],
      },
    ],
  },
};

/**
 * Layout Template Function
 * Returns a cloned copy of the dental layout
 */
export function layoutTemplate() {
  return structuredCloneWithFunctions(this.layoutInstance);
}

/**
 * Dental Route Configuration
 */
export const dentalRoute = {
  path: 'dental',
  layoutTemplate,
  layoutInstance: dentalLayout,
};

/**
 * Mode Configuration
 */
const mode = {
  /**
   * Mode ID and metadata
   */
  id,
  routeName: 'dental',
  displayName: 'Dental',

  /**
   * Lifecycle hooks
   */
  onModeEnter: ({ servicesManager, extensionManager, commandsManager }) => {
    console.log('🦷 Entering Dental Mode');

    // Hide the default OHIF header and inject Dental Practice Header
    const injectDentalHeader = async () => {
      // Check if already injected
      if ((window as any).__dentalHeaderRoot) {
        console.log('⏭️ Dental header already injected, skipping');
        return;
      }

      // Import React and ReactDOM
      const React = await import('react');
      const ReactDOM = await import('react-dom/client');

      // Import dental components - use named exports
      const dentalModule = await import('@ohif/extension-dental');
      const DentalPracticeHeader = dentalModule.DentalPracticeHeader;
      const useDentalStore = dentalModule.useDentalStore;

      console.log('Dental module imported:', {
        DentalPracticeHeader: typeof DentalPracticeHeader,
        useDentalStore: typeof useDentalStore,
      });

      // Find the ACTUAL header/nav element - be more specific
      // Look for elements with specific structure, not just any element
      const possibleSelectors = [
        'nav[class*="NavBar"]',
        'div[class*="Header"]',
        'header',
        '[role="banner"]',
        // Look for the actual OHIF nav structure
        'nav > div', // NavBar > content div
        'div[class*="h-\\[48px\\]"]', // The 48px height div from Header.tsx
      ];

      let headerContainer = null;
      for (const selector of possibleSelectors) {
        const element = document.querySelector(selector);
        if (element && element.tagName !== 'NOSCRIPT') {
          headerContainer = element;
          console.log(`✅ Found header with selector: ${selector}`, element);
          break;
        }
      }

      // Fallback: Find the first meaningful child of body (skip noscript)
      if (!headerContainer) {
        const bodyChildren = Array.from(document.body.children);
        headerContainer = bodyChildren.find(
          el => el.tagName !== 'NOSCRIPT' && el.tagName !== 'SCRIPT'
        ) as HTMLElement;
        console.log('Using first body child:', headerContainer?.tagName);
      }

      if (!headerContainer) {
        console.warn('❌ Header container not found - tried all selectors');
        return;
      }

      console.log('✅ Found header container:', headerContainer.tagName, headerContainer.className);

      // Create a NEW div to inject into instead of clearing existing content
      const dentalHeaderDiv = document.createElement('div');
      dentalHeaderDiv.id = 'dental-practice-header';
      dentalHeaderDiv.style.cssText = 'width: 100%; background: white; z-index: 1000;';

      // Insert at the top of the page
      if (headerContainer.parentElement) {
        headerContainer.parentElement.insertBefore(dentalHeaderDiv, headerContainer);
        // Hide the original header
        (headerContainer as HTMLElement).style.display = 'none';
      } else {
        // Fallback: prepend to body
        document.body.insertBefore(dentalHeaderDiv, document.body.firstChild);
      }

      // Create root and render dental header
      const root = ReactDOM.default.createRoot(dentalHeaderDiv);
      const createElement = React.default.createElement;

      const DentalHeaderWrapper = () => {
        const { selectedTeeth, selectTooth, deselectTooth, patientInfo, practiceInfo } =
          useDentalStore();

        return createElement(DentalPracticeHeader, {
          practiceInfo,
          patientInfo,
          selectedTeeth,
          onToothSelect: selectTooth,
          onToothDeselect: deselectTooth,
          showToothSelector: true,
        });
      };

      root.render(createElement(DentalHeaderWrapper));

      // Store root for cleanup
      (window as any).__dentalHeaderRoot = root;
      (window as any).__dentalHeaderElement = dentalHeaderDiv;
      (window as any).__originalHeader = headerContainer;

      console.log('✅ Dental Practice Header injected successfully!');
    };

    // Execute after a delay to ensure DOM is ready
    setTimeout(injectDentalHeader, 1500);

    // Initialize dental-specific services
    const { measurementService, hangingProtocolService } = servicesManager.services;

    // Apply dental hanging protocol
    try {
      hangingProtocolService.setProtocol('dental2x2');
      console.log('Applied dental 2x2 hanging protocol');
    } catch (error) {
      console.warn('Could not set dental hanging protocol:', error);
    }

    // Initialize patient info from study metadata
    try {
      const { displaySetService } = servicesManager.services;
      const displaySets = displaySetService.getActiveDisplaySets();

      if (displaySets && displaySets.length > 0) {
        const firstDisplaySet = displaySets[0];
        const { PatientName, PatientID, PatientBirthDate, PatientSex } =
          firstDisplaySet.metadata || {};

        if (PatientName || PatientID) {
          commandsManager.runCommand('setDentalPatientInfo', {
            patientInfo: {
              patientName: PatientName?.Alphabetic || 'Unknown',
              patientId: PatientID || 'N/A',
              dateOfBirth: PatientBirthDate,
              gender: PatientSex,
            },
          });
        }
      }
    } catch (error) {
      console.warn('Could not initialize patient info:', error);
    }

    // Set up measurement event listeners
    const handleMeasurementAdded = ({ source, measurement }) => {
      console.log('Measurement added:', measurement);

      // Check if it's a dental measurement (from our preset)
      const { useDentalStore } = require('@ohif/extension-dental');
      const { activeMeasurementPreset } = useDentalStore.getState();

      if (activeMeasurementPreset) {
        // Create dental measurement object
        const dentalMeasurement = {
          id: measurement.uid,
          type: activeMeasurementPreset.type,
          label: activeMeasurementPreset.label,
          value: measurement.length || measurement.angle || 0,
          unit: activeMeasurementPreset.unit,
          timestamp: new Date().toISOString(),
          imageId: measurement.imageId,
          seriesInstanceUID: measurement.SeriesInstanceUID,
          studyInstanceUID: measurement.StudyInstanceUID,
        };

        // Add to dental store
        commandsManager.runCommand('addDentalMeasurement', {
          measurement: dentalMeasurement,
        });
      }
    };

    // Subscribe to measurement events
    measurementService.subscribe(
      measurementService.EVENTS.MEASUREMENT_ADDED,
      handleMeasurementAdded
    );

    console.log('🦷 Dental Mode initialized successfully');
  },

  onModeExit: ({ servicesManager }) => {
    console.log('🦷 Exiting Dental Mode');

    // Cleanup dental header
    const root = (window as any).__dentalHeaderRoot;
    const dentalHeaderElement = (window as any).__dentalHeaderElement;
    const originalHeader = (window as any).__originalHeader;

    if (root) {
      root.unmount();
      delete (window as any).__dentalHeaderRoot;
    }

    if (dentalHeaderElement && dentalHeaderElement.parentElement) {
      dentalHeaderElement.parentElement.removeChild(dentalHeaderElement);
      delete (window as any).__dentalHeaderElement;
    }

    if (originalHeader) {
      (originalHeader as HTMLElement).style.display = '';
      delete (window as any).__originalHeader;
    }

    // Clean up event listeners
    const { measurementService } = servicesManager.services;
    measurementService.clearListeners();
  },

  /**
   * Validate Mode
   * Check if this mode can be activated for the current study
   */
  validationTags: {
    study: [],
    series: [],
  },

  /**
   * Is Valid Mode
   * Return validation object if this mode should be available for the current study
   */
  isValidMode: ({ modalities }) => {
    // Allow dental mode for any study (can be restricted by modality)
    return {
      valid: true,
      description: 'Dental mode is available for all studies',
    };

    // Example: Restrict to specific modalities
    // const dentalModalities = ['DX', 'CR', 'IO'];
    // const modalities_list = modalities.split('\\');
    // const hasValidModality = modalities_list.some(modality => dentalModalities.includes(modality));
    // return {
    //   valid: hasValidModality,
    //   description: hasValidModality
    //     ? `Matches dental modalities`
    //     : `No dental modalities found. Supported: ${dentalModalities.join(', ')}`,
    // };
  },

  /**
   * Routes
   * Define the routes and layouts for this mode
   */
  routes: [dentalRoute],

  /**
   * Extension Dependencies
   */
  extensions: extensionDependencies,

  /**
   * Hanging Protocol
   * Specify which hanging protocol to use by default
   */
  hangingProtocol: 'dental2x2',

  /**
   * SOP Class Handlers
   * Define which DICOM SOP classes this mode can handle
   */
  sopClassHandlers,

  /**
   * Default Layout Template
   */
  defaultContext: 'DENTAL',
};

export default mode;
