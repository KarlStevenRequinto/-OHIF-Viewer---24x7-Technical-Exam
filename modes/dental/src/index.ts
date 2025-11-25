/**
 * Dental Mode for OHIF Viewer
 * Specialized viewing mode for dental imaging workflows with 2x2 layout
 */

import { ToolbarService, utils } from '@ohif/core';
import { id } from './id';
import initToolGroups from './initToolGroups';
import { toolbarButtons as basicToolbarButtons } from '@ohif/mode-basic';

const { structuredCloneWithFunctions } = utils;
const { TOOLBAR_SECTIONS } = ToolbarService;

/**
 * Filter toolbar buttons to remove segmentation-dependent buttons
 * that would cause errors in dental mode
 */
const filterSegmentationButtons = (buttons) => {
  return buttons.filter(button => {
    // Check if button has evaluate prop
    if (button.props?.evaluate) {
      const evaluate = button.props.evaluate;

      // Handle string evaluate
      if (typeof evaluate === 'string') {
        if (evaluate.includes('Segmentation') ||
            evaluate.includes('navigationComponent') ||
            evaluate.includes('trackingStatus')) {
          return false;
        }
      }

      // Handle object evaluate with name property
      if (evaluate?.name) {
        if (evaluate.name.includes('Segmentation') ||
            evaluate.name.includes('navigationComponent') ||
            evaluate.name.includes('trackingStatus')) {
          return false;
        }
      }

      // Handle array of evaluates
      if (Array.isArray(evaluate)) {
        for (const evalItem of evaluate) {
          const evalName = typeof evalItem === 'string' ? evalItem : evalItem?.name;
          if (evalName?.includes('Segmentation') ||
              evalName?.includes('navigationComponent') ||
              evalName?.includes('trackingStatus')) {
            return false;
          }
        }
      }
    }

    return true;
  });
};

const dentalToolbarButtons = filterSegmentationButtons(basicToolbarButtons);

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
  '@ohif/extension-cornerstone-dicom-seg': '^3.0.0', // Needed for toolbar evaluation functions
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
 * Toolbar Sections Configuration
 * Defines which buttons appear in primary and secondary toolbars
 * Using existing toolbar buttons from extensions
 */
export const toolbarSections = {
  // Primary toolbar (top buttons)
  [TOOLBAR_SECTIONS.primary]: [
    'MeasurementTools',
    'Zoom',
    'WindowLevel',
    'Pan',
    'Capture',
    'Layout',
    'MoreTools',
  ],

  // Viewport action menus (overlays on viewports)
  [TOOLBAR_SECTIONS.viewportActionMenu.topLeft]: ['orientationMenu', 'dataOverlayMenu'],
  [TOOLBAR_SECTIONS.viewportActionMenu.topRight]: ['modalityLoadBadge'],
  [TOOLBAR_SECTIONS.viewportActionMenu.bottomLeft]: ['windowLevelMenu'],

  // Measurement tools dropdown
  MeasurementTools: [
    'Length',
    'Bidirectional',
    'Angle',
    'EllipticalROI',
    'RectangleROI',
    'ArrowAnnotate',
  ],

  // More tools dropdown
  MoreTools: [
    'Reset',
    'rotate-right',
    'flipHorizontal',
    'invert',
    'Magnify',
    'CalibrationLine',
    'Probe',
  ],
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
   * Toolbar Configuration
   */
  toolbarButtons: dentalToolbarButtons,
  toolbarSections,

  /**
   * Lifecycle hooks
   */
  onModeEnter: ({ servicesManager, extensionManager, commandsManager }) => {
    console.log('🦷 Entering Dental Mode');

    // Get services
    const { toolGroupService, toolbarService, measurementService } = servicesManager.services;

    // Initialize tool groups
    initToolGroups(extensionManager, toolGroupService, commandsManager);

    // Register toolbar buttons (filtered for dental mode)
    toolbarService.register(dentalToolbarButtons);

    // Update toolbar sections
    for (const [key, section] of Object.entries(toolbarSections)) {
      toolbarService.updateSection(key, section);
    }

    console.log('✅ Toolbar buttons registered and sections updated');

    // Apply saved theme or default dental theme
    const applySavedTheme = () => {
      try {
        const { loadThemePreference, getTheme, applyTheme } = require('@ohif/extension-dental');
        const savedThemeName = loadThemePreference() || 'dental';
        const theme = getTheme(savedThemeName);
        applyTheme(theme);
        console.log(`Applied saved theme: ${savedThemeName}`);
      } catch (error) {
        console.warn('Could not apply saved theme:', error);
      }
    };

    applySavedTheme();

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

    // Get hanging protocol service (measurementService already declared above)
    const { hangingProtocolService } = servicesManager.services;

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
      console.log('🦷 Measurement added event:', measurement);

      // Import dental store
      const { useDentalStore } = require('@ohif/extension-dental');
      const { activeMeasurementPreset } = useDentalStore.getState();

      // Determine measurement type and label
      let type = 'general';
      let label = 'Measurement';
      let value = 0;
      let unit = 'mm';

      // Check if it's from a dental preset
      if (activeMeasurementPreset) {
        type = activeMeasurementPreset.type;
        label = activeMeasurementPreset.label;
        unit = activeMeasurementPreset.unit;
      } else {
        // Auto-detect measurement type from OHIF tool
        if (measurement.type === 'Length' || measurement.label?.includes('Length')) {
          type = 'periapical_length';
          label = 'Length';
          unit = 'mm';
        } else if (measurement.type === 'Angle' || measurement.label?.includes('Angle')) {
          type = 'canal_angle';
          label = 'Angle';
          unit = 'degrees';
        } else if (measurement.type === 'Bidirectional') {
          type = 'crown_width';
          label = 'Bidirectional';
          unit = 'mm';
        }
      }

      // Extract value from measurement
      if (measurement.length !== undefined) {
        value = measurement.length;
        unit = 'mm';
      } else if (measurement.angle !== undefined) {
        value = measurement.angle;
        unit = 'degrees';
      } else if (measurement.area !== undefined) {
        value = measurement.area;
        unit = 'mm²';
      }

      // Create dental measurement object
      const dentalMeasurement = {
        id: measurement.uid || `measurement-${Date.now()}`,
        type,
        label,
        value,
        unit,
        timestamp: new Date().toISOString(),
        patientId: useDentalStore.getState().patientInfo?.patientId || 'unknown',
        studyInstanceUID: measurement.StudyInstanceUID || 'unknown',
        metadata: {
          imageId: measurement.imageId,
          seriesInstanceUID: measurement.SeriesInstanceUID,
          referencedImageId: measurement.referencedImageId,
          toolType: measurement.type,
          displayText: measurement.text,
        },
      };

      console.log('✅ Creating dental measurement:', dentalMeasurement);

      // Add to dental store
      try {
        useDentalStore.getState().addMeasurement(dentalMeasurement);
        console.log('✅ Measurement added to dental store');
      } catch (error) {
        console.error('❌ Error adding measurement to dental store:', error);
      }
    };

    // Subscribe to measurement events
    try {
      // Subscribe to MEASUREMENT_ADDED event
      measurementService.subscribe(
        measurementService.EVENTS.MEASUREMENT_ADDED,
        handleMeasurementAdded
      );

      // Also subscribe to RAW_MEASUREMENT_ADDED as fallback
      measurementService.subscribe(
        measurementService.EVENTS.RAW_MEASUREMENT_ADDED,
        ({ source, measurement, data }) => {
          console.log('🦷 Raw measurement added:', { source, measurement, data });
          handleMeasurementAdded({ source, measurement });
        }
      );

      // Subscribe to MEASUREMENT_UPDATED to catch value changes
      measurementService.subscribe(
        measurementService.EVENTS.MEASUREMENT_UPDATED,
        ({ source, measurement }) => {
          console.log('🦷 Measurement updated:', { source, measurement });
          // Update existing measurement in dental store if it exists
          const dentalStore = require('@ohif/extension-dental').useDentalStore.getState();
          const existingMeasurement = dentalStore.measurements.find(m => m.id === measurement.uid);

          if (existingMeasurement) {
            // Extract updated value
            let value = existingMeasurement.value;
            if (measurement.length !== undefined) value = measurement.length;
            else if (measurement.angle !== undefined) value = measurement.angle;
            else if (measurement.area !== undefined) value = measurement.area;

            dentalStore.updateMeasurement(measurement.uid, { value });
            console.log('✅ Updated measurement value in dental store');
          }
        }
      );

      console.log('✅ Subscribed to measurement events (ADDED, RAW_ADDED, UPDATED)');
    } catch (error) {
      console.error('❌ Failed to subscribe to measurement events:', error);
    }

    // Debug: Log all existing measurements
    try {
      const allMeasurements = measurementService.getMeasurements();
      console.log('📊 Existing measurements on mode enter:', allMeasurements);
    } catch (error) {
      console.warn('Could not fetch existing measurements:', error);
    }

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
export { initToolGroups };
